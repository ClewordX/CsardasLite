import type { SevenComponent, SevenMachine } from "@bctnry/seven";
import { CommonSevenComponentIndex } from "@src/seven/SevenComponentIndex";
import SystemErrorStore from "@src/store/SystemError.Store";
import SystemStateStore, { SystemCurrentStatus } from "@src/store/SystemState.Store";

export const ErrorComponent: SevenComponent = {
    name: CommonSevenComponentIndex.Error,
    call: (args: {[name: string]: any}) => {
        SystemErrorStore.error(args.header, args.message,);
        SystemStateStore.currentStatus.set(SystemCurrentStatus.ERROR);
    }
};
