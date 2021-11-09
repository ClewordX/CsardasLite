import { jit } from "@src/jit/JIT";
import { MACHINE } from "./Machine";

export function GlobalLoadCourseData(x: any) {
    if (x.title) {
        document.title = `${x.title} - Csárdás Lite`;
    }

    // SystemStateStore.notReady();
    let jitted = jit(x);
    MACHINE.loadProgram(jitted);
    MACHINE.unlock();
    // SystemStateStore.ready();
    MACHINE.step();    
}

export function InitializeDocumentGroup(x: any) {
    (window as any).__CSARDAS = {
        session: x.docsJson,
        entry: x.main
    };
}

export function RetrieveDocument(name: string) {
    return (window as any).__CSARDAS?.session[name];
}

export function RetrieveEntryDocument() {
    return RetrieveDocument((window as any).__CSARDAS.entry);
}
