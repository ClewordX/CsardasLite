import type { SevenMachineProgram } from "@bctnry/seven";
import { ConversationSevenComponentIndex } from "@src/seven/SevenComponentIndex";
import type { ConversationCharacterDescriptor } from "@src/store/machine/Conversation.Store";
import { AsTypeTaggedDict } from "@src/utils/AuxFuncs";
import * as yaml from "js-yaml";
import { _pushComponentCall } from "../Common";
import { isMachineCommonInstr, compileMachineCommonInstr } from "./MachineCommon";

export function CompileForConversation(res: SevenMachineProgram, x: any) {
    let characterDict: {[name: string]: ConversationCharacterDescriptor} = {};
    x.character && x.character.forEach((v) => {
        characterDict[v.name] = {
            name: v.name,
            iconUrl: v.icon,
            iconDict: {},
            position: v.position,            
        };
    });
    let branchResolveRequest: any[] = [];
    _pushComponentCall(res, ConversationSevenComponentIndex.SetCharacter, { characterDict: characterDict });
    for (let i = 0; i < x.contents.length; i++) {
        let v = AsTypeTaggedDict(x.contents[i]);
        // if (isFlowControlStatement(v)) { continue; }
        if (isMachineCommonInstr(v)) { compileMachineCommonInstr(res, v); continue; }
        switch (v.type) {
            case 'h1': {
                _pushComponentCall(res, ConversationSevenComponentIndex.Header, { level: 1, text: v.data });
                break;
            }
            case 'h2': {
                _pushComponentCall(res, ConversationSevenComponentIndex.Header, { level: 2, text: v.data });
                break;
            }
            case 'h3': {
                _pushComponentCall(res, ConversationSevenComponentIndex.Header, { level: 3, text: v.data });
                break;
            }
            case '_': {
                _pushComponentCall(res, ConversationSevenComponentIndex.Narrator, { text: v.data });
                break;
            }
            case 'talk': {
                let position = v.data.position || characterDict[v.data.name].position || 'left';
                let defaultIconUrl = characterDict[v.data.name].iconUrl;
                let iconUrl = (
                    v.data.emotion &&
                        characterDict[v.data.name].iconDict[v.data.emotion]?
                        characterDict[v.data.name].iconDict[v.data.emotion]
                        : defaultIconUrl
                );
                v.data.text.forEach((t, i) => {
                    _pushComponentCall(res, ConversationSevenComponentIndex.Text, {
                        name: v.data.name,
                        position: position,
                        iconUrl: iconUrl,
                        text: t,
                        _order: i,
                    });
                });
                break;
            }
            case 'message': {
                _pushComponentCall(res, ConversationSevenComponentIndex.SendMessage, {
                    data: v.data,
                    stopAfterSend: true,
                });
                break;
            }
            case 'multi_message': {
                v.data.forEach((j, i) => {
                    _pushComponentCall(res, ConversationSevenComponentIndex.SendMessage, {
                        data: j,
                        stopAfterSend: i === v.data.length - 1
                    });
                });
                break;
            }
            case 'mode': {
                _pushComponentCall(res, ConversationSevenComponentIndex.SetMode, { mode: v.data });
                break;
            }
            case 'bg_image': {
                _pushComponentCall(res, ConversationSevenComponentIndex.SetBackground, { type: 'image', url: v.data });
                break;
            }
            case 'bg_color': {
                _pushComponentCall(res, ConversationSevenComponentIndex.SetBackground, { type: 'color', color: v.data });
                break;
            }
            case 'bg_iframe': {
                _pushComponentCall(res, ConversationSevenComponentIndex.SetBackground, { type: 'iframe', url: v.data });
                break;
            }
            case 'halfview': {
                _pushComponentCall(res, ConversationSevenComponentIndex.SetHalfview, v.data);
                _pushComponentCall(res, ConversationSevenComponentIndex.SetMode, { mode: 'halfview' });
                break;
            }
            case 'chatbox': {
                _pushComponentCall(res, ConversationSevenComponentIndex.SetMode, { mode: 'chatbox' });
                _pushComponentCall(res, ConversationSevenComponentIndex.SetAnchor, { anchor: v.data });
                break;
            }
            case 'branch': {
                let resolveRequest = {
                    branchList: v.data
                };
                branchResolveRequest.push(resolveRequest);
                _pushComponentCall(res, ConversationSevenComponentIndex.Branch, resolveRequest);
                break;
            }
            case 'select': {
                break;
            }
            default: {
                res.push({_:undefined, _instr: v} as any);
                break;
            }
        }
    }
    
    // pass2: label resolve.
    return {
        pass: 2,
        branchResolveRequest: branchResolveRequest
    };
}
