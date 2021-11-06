import type { SevenMachineProgram } from "@bctnry/seven";
import { CommonSevenComponentIndex } from "@src/seven/SevenComponentIndex";
import { _pushComponentCall, _timespanParser } from "../Common";

// NOTE: requires x to be a type-tagged dict.
export function isMachineCommonInstr(x: any) {
    return [
        'pause',
        'wait',
    ].includes(x.type);
}

// NOTE: requires x to be a type-tagged dict.
export function compileMachineCommonInstr(res: SevenMachineProgram, x: any) {
    switch (x.type) {
        case 'wait': {
            _pushComponentCall(res, CommonSevenComponentIndex.Wait, { ms: _timespanParser(x.data) });
            break;
        }
        case 'pause': {
            _pushComponentCall(res, CommonSevenComponentIndex.Pause, {});
            break;
        }
    }
}
