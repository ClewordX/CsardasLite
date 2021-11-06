import { SevenMachineInstrType, SevenMachineProgram } from "@bctnry/seven";

export function _pushComponentCall(x: SevenMachineProgram, name: string, args: {[name: string]: any}) {
    x.push({_:SevenMachineInstrType.CALL_COMPONENT, name, args});
}

// returns ms.
const REGEX_TIMESPAN = /(?:(\d+)m)?(?:(\d+)s)?/;
export function _timespanParser(x: string) {
    let matchres = REGEX_TIMESPAN.exec(x);
    if (!matchres) { return undefined; }
    return (parseInt(matchres[1]||'0', 10)*60 + parseInt(matchres[2]||'0', 10)) * 1000;
}

export function isFlowControlStatement(x: any) {
    return [
        '(label)',
        '(goto)',
        '(if_goto)',
    ].includes(x.type);
}


// NOTE: new dict is `.push`-ed, i.e. at `length-1`.
export type LabelDict = {[key: string]: number}[];
export function _labelLookup(label: string, dict: LabelDict) {
    if (dict.length <= 0) { return undefined; }
    for (let i = dict.length-1; i >= 0; i--) {
        if (dict[i][label]) {
            return dict[i][label];
        }
    }
    return undefined;
}
