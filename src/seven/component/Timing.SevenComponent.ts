import type { SevenComponent, SevenMachine } from "@bctnry/seven";
import { CommonSevenComponentIndex } from "@src/seven/SevenComponentIndex";

export const WaitComponent: SevenComponent = {
    name: CommonSevenComponentIndex.Wait,
    call: (args: {[name: string]: any}, machine: SevenMachine) => {
        machine.lock();
        setTimeout(() => {
            machine.unlock();
            machine.step();
        }, args.ms);
        return true;
    }
};
