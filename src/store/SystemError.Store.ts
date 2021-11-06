import { accessible } from "@src/common/Accessible";

export type SystemErrorStateType = {
    headerMessage?: string,
    message?: string
}

function _SystemErrorStore() {
    let store = accessible<SystemErrorStateType>({});

    return {
        subscribe: store.subscribe.bind(store),
        getValue: store.getValue.bind(store),
        set: store.set.bind(store),
        reset: () => {
            store.set({});
        },
        error: (headerMessage?: string, message?: string) => {
            store.set({headerMessage, message});
        }
    }
}

export default _SystemErrorStore();
