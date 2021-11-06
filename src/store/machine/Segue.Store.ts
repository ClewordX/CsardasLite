import { Accessible, accessible } from "@src/common/Accessible";

export enum SegueTitlePosition {
    BOTTOM_LEFT = 'bottom_left',
    CENTER = 'center',
}

export type SegueStoreState = {
    currentTitle: string,
    currentTopTitle: string,
    currentSubTitle: string,
    currentBgUrl: string,
    currentPosition: SegueTitlePosition,
}


function _SegueStore() {
    const { subscribe, getValue, set, update } = accessible({
        currentTitle: '',
        currentTopTitle: '',
        currentSubTitle: '',
        currentBgUrl: '',
        currentPosition: SegueTitlePosition.CENTER,
    });
    return {
        subscribe,
        getValue,
        reset: () => {
            set({
                currentTitle: '',
                currentTopTitle: '',
                currentSubTitle: '',
                currentBgUrl: '',
                currentPosition: SegueTitlePosition.CENTER,
            });
        },
        set,
    }
}

let _store = _SegueStore();

export default _store;
