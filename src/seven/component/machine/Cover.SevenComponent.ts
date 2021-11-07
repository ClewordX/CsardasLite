import type { SevenComponent, SevenMachine } from "@bctnry/seven";
import { CoverSevenComponentIndex } from "@src/seven/SevenComponentIndex";
import MachineStore from "@src/store/Machine.Store";

export const CoverSetComponent: SevenComponent = {
    name: CoverSevenComponentIndex.Set,
    call: (args: {[name: string]: any}) => {
        MachineStore.Cover.set({
            currentTitle: args.title || '',
            currentTopTitle: args.topTitle || '',
            currentBgUrl: args.bgImage || '',
            currentBgColor: args.bgColor || '',
            currentDescription: args.description || '',
            currentPosition: args.position || 'bottom_left',
        });
    }
}
