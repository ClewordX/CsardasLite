// NOTE: for custom menu options.

import { accessible } from "@src/common/Accessible"

export type TOmniconMenuItem = {
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
            store.currentCustomOmniconMenu.update((v) => v.filter((i) => i === x));
        }
    }
    return store;
};

export default _OmniconStore();
