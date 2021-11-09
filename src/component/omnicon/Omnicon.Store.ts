// NOTE: for custom menu options.

import { accessible } from "@src/common/Accessible"

export type TOmniconMenuItem = {
    id: string,
    title: string,
    // NOTE: if return true, then close the menu after completion.
    callback?: (omniconElement: HTMLElement, omniconMenuElement: HTMLElement, e: MouseEvent) => boolean,
}

function _OmniconStore() {
    let store = {
        currentCustomOmniconMenu: accessible<TOmniconMenuItem[]>([]),

        reset: () => {
            store.currentCustomOmniconMenu.set([]);
        },

        add: (x: TOmniconMenuItem) => {
            store.currentCustomOmniconMenu.getValue().push(x);
            store.currentCustomOmniconMenu.set(store.currentCustomOmniconMenu.getValue());
        },
        remove: (x: TOmniconMenuItem) => {
            store.currentCustomOmniconMenu.set(store.currentCustomOmniconMenu.getValue().filter((v) => v !== x));
        },
        removeById: (x: string) => {
            store.currentCustomOmniconMenu.set(store.currentCustomOmniconMenu.getValue().filter((v) => v.id !== x));
        },
        addOrReplace: (x: TOmniconMenuItem) => {
            let i = store.currentCustomOmniconMenu.getValue().findIndex((v) => v.id === x.id);
            if (i !== -1) {
                store.currentCustomOmniconMenu.getValue()[i] = x;
            } else {
                store.currentCustomOmniconMenu.getValue().push(x);
            }
            store.currentCustomOmniconMenu.set(store.currentCustomOmniconMenu.getValue());
        }
    }
    return store;
};

export default _OmniconStore();
