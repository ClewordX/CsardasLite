import { jit } from "@src/jit/JIT";
import SystemStateStore from "@src/store/SystemState.Store";
import { MACHINE } from "./Machine";

export function GlobalLoadCourseData(x: any) {
    SystemStateStore.notReady();
    let jitted = jit(x);
    MACHINE.loadProgram(jitted);
    MACHINE.unlock();
    SystemStateStore.ready();
    MACHINE.step();    
}
