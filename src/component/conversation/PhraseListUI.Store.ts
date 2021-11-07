import { accessible } from "@src/common/Accessible";

function _PhraseListUIStore() {
    let store = {
        isNextButtonAvailable: accessible(true),

        reset: () => {
            store.isNextButtonAvailable.set(true);
        },

        enableNext: () => {
            store.isNextButtonAvailable.set(true);
        },
        disableNext: () => {
            store.isNextButtonAvailable.set(false);
        },
    }
    return store;
}

export default _PhraseListUIStore();
