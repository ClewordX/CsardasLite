import { accessible } from "@src/common/Accessible";


function _SystemWaitingStore() {
    let store = {
        message: accessible([]),

        reset: () => {
            store.message.set([]);
        },
        appendWaitingMessage: (x: string) => {
            store.message.getValue().push(x);
            store.message.set(store.message.getValue());
        },
        clearWaitingMessage: () => {
            store.message.set([]);
        },
    };
    return store;
}

export default _SystemWaitingStore();
