import { accessible } from "@src/common/Accessible";
import SegueStore from "@src/store/machine/Segue.Store";
import ConversationStore from "@src/store/machine/Conversation.Store";
import InfoStore from "./machine/Info.Store";

export enum EMode {
    TOC = 'toc',
    SEGUE = 'segue',
    CONVERSATION = 'conversation',
    INFO = 'info',
}

function _MachineStore() {
    let store = {
        currentMode: accessible<EMode>(EMode.SEGUE),

        Segue: SegueStore,
        Conversation: ConversationStore,
        Info: InfoStore,

        reset: () => {
            store.currentMode.set(EMode.SEGUE);
            store.Segue.reset();
        },
        mode: (x: EMode) => {
            store.currentMode.set(x);
        }
    };
    return store;
}

export default _MachineStore();