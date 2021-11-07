import type { SevenComponent, SevenMachine } from "@bctnry/seven";
import { jit } from "@src/jit/JIT";
import { CommonSevenComponentIndex } from "@src/seven/SevenComponentIndex";
import MachineStore from "@src/store/Machine.Store";
import SystemErrorStore from "@src/store/SystemError.Store";
import SystemStateStore, { SystemCurrentStatus } from "@src/store/SystemState.Store";



export const ResetComponent: SevenComponent = {
    name: CommonSevenComponentIndex.Reset,
    call: (args: {[name: string]: any}) => {
        MachineStore.reset();
        return true;
    }
};

export const ListenComponent: SevenComponent = {
    name: CommonSevenComponentIndex.Listen,
    call: (args: {[name: string]: any}, machine: SevenMachine) => {
        machine.variableMap[args.name].subscribe(args.callback);
        return true;
    }
};

export const PauseComponent: SevenComponent = {
    name: CommonSevenComponentIndex.Pause,
    call: () => {
        // intentionally left blank.
        // when `call` does not return any `true`-equivalent value the
        // machine will stop stepping, hence it's `PAUSE`.
    }
};

export const LoadComponent: SevenComponent = {
    name: CommonSevenComponentIndex.Load,
    call: (args: {[name: string]: any}, machine: SevenMachine) => {
        try {
            let jitted = jit(args.data);
            machine.loadProgram(jitted);
            machine.unlock();
            SystemStateStore.ready();
            machine.step();
        } catch (e) {
            SystemErrorStore.error(
                e.message,
                `Source data:
                <pre>${JSON.stringify(args.data, undefined, '    ')}</pre>
                Generated data:
                <pre>${JSON.stringify(e.data, undefined, '    ')}</pre>
                `
            );
            SystemStateStore.currentStatus.set(SystemCurrentStatus.ERROR);
        }
    }
}

export const LoadFileComponent: SevenComponent = {
    name: CommonSevenComponentIndex.LoadFile,
    call: (args: {[name: string]: any}, machine: SevenMachine) => {
        try {
            let data = (window as any).__CSARDAS?.session.docsJson[args.fileName];
            if (!data) {
                throw {
                    message: `No file named ${args.fileName}`,
                };
            }
            let jitted = jit(data);
            machine.loadProgram(jitted);
            machine.unlock();
            SystemStateStore.ready();
            machine.step();
        } catch (e) {
            SystemErrorStore.error(
                e.message,
                `Source file:
                <pre>${JSON.stringify(args.fileName, undefined, '    ')}</pre>
                Generated data:
                <pre>${JSON.stringify(e.data, undefined, '    ')}</pre>
                `
            );
            SystemStateStore.currentStatus.set(SystemCurrentStatus.ERROR);
        }
    }
}

export const SetMachineModeComponent: SevenComponent = {
    name: CommonSevenComponentIndex.SetMode,
    call: (args: {[name: string]: any}, machine: SevenMachine) => {
        console.log(`Switch mode: ${args.modeType}`);
        MachineStore.mode(args.modeType);
        return true;
    }
};
