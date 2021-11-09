import { accessible } from "@src/common/Accessible";

export enum SystemCurrentStatus {
    NONE = 0,
    WAITING = 1,
    ERROR = 2,
}

function _SystemStateStore() {
    let store = {
        currentStatus: accessible(SystemCurrentStatus.NONE),
        currentDocumentFileName: accessible(''),
        currentDocumentTitle: accessible(''),
        currentDocumentDescription: accessible(''),
        
        reset: () => {
            store.currentStatus.set(SystemCurrentStatus.NONE);
            store.currentDocumentTitle.set('');
            store.currentDocumentDescription.set('');
        },
        ready: () => {
            store.currentStatus.set(SystemCurrentStatus.NONE);
        },
        notReady: () => {
            store.currentStatus.set(SystemCurrentStatus.WAITING);
        },
    };
    return store;
}

export default _SystemStateStore();
