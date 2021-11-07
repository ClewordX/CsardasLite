import { accessible } from "@src/common/Accessible";
import CoverStore from "@src/store/machine/Cover.Store";
import ConversationStore from "@src/store/machine/Conversation.Store";
import InfoStore from "./machine/Info.Store";
import TableOfContentsStore from "./machine/TableOfContents.Store";

export enum EMode {
    TOC = 'toc',
    COVER = 'cover',
    CONVERSATION = 'conversation',
    INFO = 'info',
}

function _MachineStore() {
    let store = {
        currentMode: accessible<EMode>(EMode.COVER),

        Cover: CoverStore,
        Conversation: ConversationStore,
        Info: InfoStore,
        TableOfContents: TableOfContentsStore,

        reset: () => {
            store.currentMode.set(EMode.COVER);
            store.Cover.reset();
            store.Conversation.reset();
            store.Info.reset();
            store.TableOfContents.reset();
        },
        mode: (x: EMode) => {
            store.currentMode.set(x);
        }
    };
    return store;
}

export default _MachineStore();
