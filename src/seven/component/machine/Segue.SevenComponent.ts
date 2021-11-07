import type { SevenComponent, SevenMachine } from "@bctnry/seven";
import { SegueSevenComponentIndex } from "@src/seven/SevenComponentIndex";
import MachineStore from "@src/store/Machine.Store";

export const SegueSetComponent: SevenComponent = {
    name: SegueSevenComponentIndex.Set,
    call: (args: {[name: string]: any}) => {
        MachineStore.Segue.set({
            currentTitle: args.title || '',
            currentTopTitle: args.topTitle || '',
            currentBgUrl: args.bgImage || '',
            currentBgColor: args.bgColor || '',
            currentDescription: args.description || '',
            currentPosition: args.position || 'center',
        });
    }
}
