import type { SevenComponent, SevenMachine } from "@bctnry/seven";
import SystemStateStore from "@src/store/SystemState.Store";
import { CommonSevenComponentIndex } from "@src/seven/SevenComponentIndex";

export const SetTitleComponent: SevenComponent = {
    name: CommonSevenComponentIndex.SetTitle,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        SystemStateStore.currentDocumentTitle.set(args.title);
        return true;
    }
};

export const SetDescriptionComponent: SevenComponent = {
    name: CommonSevenComponentIndex.SetDescription,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        SystemStateStore.currentDocumentTitle.set(args.description);
        return true;
    }
};
