import { Accessible, accessible } from "@src/common/Accessible";

export enum SegueTitlePosition {
    BOTTOM_LEFT = 'bottom_left',
    CENTER = 'center',
}

export type SegueStoreState = {
    currentTitle: string,
    currentTopTitle: string,
    currentBgUrl: string,
    currentBgColor: string,
    currentDescription: string,
    currentPosition: SegueTitlePosition,
}


function _SegueStore() {
    const { subscribe, getValue, set, update } = accessible({
        currentTitle: '',
        currentTopTitle: '',
        currentBgUrl: '',
        currentBgColor: '',
        currentDescription: '',
        currentPosition: SegueTitlePosition.CENTER,
    });
    return {
        subscribe,
        getValue,
        reset: () => {
            set({
                currentTitle: '',
                currentTopTitle: '',
                currentBgUrl: '',
                currentBgColor: '',
                currentDescription: '',
                currentPosition: SegueTitlePosition.CENTER,
            });
        },
        set,
    }
}

let _store = _SegueStore();

export default _store;
