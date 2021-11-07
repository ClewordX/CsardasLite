import * as yaml from 'js-yaml';
import { SevenMachineInstrType, SevenMachineProgram } from "@bctnry/seven";
import { AsTypeTaggedDict } from "@src/utils/AuxFuncs";
import { _pushComponentCall } from "./Common";
import { CompileForConversation } from "./subsystem/Conversation";
import { compileMachineCommonInstr, isMachineCommonInstr } from "./subsystem/MachineCommon";
import { CommonSevenComponentIndex, InfoSevenComponentIndex, CoverSevenComponentIndex, ConversationSevenComponentIndex, TableOfContentsComponentIndex } from '@src/seven/SevenComponentIndex';
// NOTE: we have to do at least 2 pass here because we can't possibly figure out
// the position of every (label) in the source code.
// this leads to the discrimination of two different kind of blocks: those which
// can include a (label), and those which does not.
// now we decide on this rule:
//     for all blocks that can contain other executable statements, the said
//     statements must be contained in the `contents` field; and all blocks with
//     a `contents` field with an array value, it'll be compiled & searched for
//     labels & stuff.

// NOTE: okay we do 3 pass here:
//     first we ignore all (label) and (goto) and generate instructions in-place;
//     then we resolve all (label);
//     at last we resolve all (goto).

// NOTE(2021.7.11): all labels now are scoped.

export class JITError extends Error {
    constructor(public message: string, public data: any) {
        super(message);
    }
}

const ContainerBlockType: string[] = ['contents'];
const ContentContainingBlockType: string[] = [
    'conversation',
]

let resolveRequest: {pass:number,[dataKey:string]:any}[] = [];

function _pass1_generation(x: any) {
    let res: any[] = [];
    _pushComponentCall(res, CommonSevenComponentIndex.Reset, {});
    if (x.title) {
        _pushComponentCall(res, CommonSevenComponentIndex.SetTitle, {title: x.title});
    }
    if (x.description) {
        _pushComponentCall(res, CommonSevenComponentIndex.SetDescription, {description: x.description});
    }
    if (!x.main) { x.main = yaml.load(x.raw_main); }
    let i = 0;
    while (x.main[i]) {
        let X = AsTypeTaggedDict(x.main[i]);
        if (isMachineCommonInstr(X)) { compileMachineCommonInstr(res, X); continue; }
        switch (X.type) {
            case '(load_file)': {
                _pushComponentCall(res, CommonSevenComponentIndex.LoadFile, {fileName: X.data});
                break;
            }
            case 'toc': {
                _pushComponentCall(res, CommonSevenComponentIndex.SetMode, {modeType: 'toc'});
                if (X.data.bg_color) {
                    _pushComponentCall(res, TableOfContentsComponentIndex.BgColor, {color: X.data.bg_color});
                }
                if (X.data.bg_image) {
                    _pushComponentCall(res, TableOfContentsComponentIndex.BgImage, {url: X.data.bg_image});
                }
                _pushComponentCall(res, TableOfContentsComponentIndex.SetData, {data: X.data.contents});
                break;
            }
            case 'info': {
                _pushComponentCall(res, CommonSevenComponentIndex.SetMode, {modeType: 'info'});
                _pushComponentCall(res, InfoSevenComponentIndex.LoadInfoPage, {
                    pageList: X.data.contents.map((v: any) => {
                        let res: any = {};
                        res.format = v.type || 'markdown';
                        res.content = v.content;
                        res.bg_image = v.bg_image;
                        res.bg_color = v.bg_color;
                        return res;
                    }),
                    _bgList: X.data.contents.filter((v: any) => v.bg_image && v.bg_image.trim()).map((v: any) => v.bg_image),
                });
                break;
            }
            case 'cover': {
                _pushComponentCall(res, CommonSevenComponentIndex.SetMode, {modeType: 'cover'});
                _pushComponentCall(res, CoverSevenComponentIndex.Set, {
                    title: X.data.title || undefined,
                    topTitle: X.data.toptitle || undefined,
                    bgImage: X.data.bg_image || undefined,
                    bgColor: X.data.bg_color || undefined,
                    description: X.data.description || undefined,
                    position: X.data.position || undefined,
                });
                break;
            }
            case 'conversation': {
                _pushComponentCall(res, CommonSevenComponentIndex.SetMode, {
                    modeType: 'conversation'
                });
                _pushComponentCall(res, ConversationSevenComponentIndex.Clear, {});
                // NOTE: an empty `contents` block should be skipped.
                if (!X.data.contents) { return; }
                resolveRequest.push(CompileForConversation(res, X.data));
                
                break;
            }
            default: {
                res.push({_:undefined, _instr: X});
                break;
            }
        }
        i++;
    }
    return res;
}



// TODO: this won't resolve labels defined inside containers. fix this.
function _pass2_labelResolve(x: any[], base: number = 0) {
    let res: {[key: string]: number} = {};
    let resultCounter: number = base;
    let resolved: any[] = [];
    for (let i = 0; i < x.length; i++) {
        let v = x[i];
        if (v._ === undefined && v._instr.type === '(label)') {
            res[v._instr.data] = resultCounter;
        } else {
            resolved.push(v);
            resultCounter++;
        }
    }
    console.log(res);
    resolveRequest.filter((v) => v.pass === 2).forEach((v) => {
        console.log(v);
        if (v.branchResolveRequest) {
            v.branchResolveRequest.forEach((b) => {
                b.branchList.forEach((v) => {
                    v.target = res[v.target];
                });
            });
        }
    });
    return {
        labelDict: res,
        result: resolved,
    };
}

function _pass3_gotoResolve(x: {labelDict: {[key: string]:number}, result:any[]}): SevenMachineProgram {
    let res: SevenMachineProgram = [];

    for (let i = 0; i < x.result.length; i++) {
        let v = x.result[i];
        if (v._ === undefined && v._instr.type === '(goto)') {
            // TODO: ...
            res.push({_:SevenMachineInstrType.GOTO, target: x.labelDict[v._instr.data]})
        } else {
            res.push(v);
        }
    }
    return res;
}

function _pass4_emptyInstrCheck(x: any[]) {
    for (let i = 0; i < x.length; i++) {
        const v = x[i];
        if (v._ === undefined) {
            throw new Error('JIT produced unusable data.' + JSON.stringify(v));
        }
    }
}

export function jit(x: any): SevenMachineProgram{
    console.log(x);
    resolveRequest = [];
    let pass1Result = _pass1_generation(x);
    let pass2Result = _pass2_labelResolve(pass1Result);
    let pass3Result = _pass3_gotoResolve(pass2Result);
    console.log(pass3Result);
    _pass4_emptyInstrCheck(pass3Result);
    return pass3Result;
}



