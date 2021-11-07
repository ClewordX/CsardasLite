import { Accessible, accessible } from "@src/common/Accessible";

export enum CoverTitlePosition {
    BOTTOM_LEFT = 'bottom_left',
    CENTER = 'center',
}

export type CoverStoreState = {
    currentTitle: string,
    currentTopTitle: string,
    currentBgUrl: string,
    currentBgColor: string,
    currentDescription: string,
    currentPosition: CoverTitlePosition,
}


function _CoverStore() {
    const { subscribe, getValue, set, update } = accessible({
        currentTitle: '',
        currentTopTitle: '',
        currentBgUrl: '',
        currentBgColor: '',
        currentDescription: '',
        currentPosition: CoverTitlePosition.BOTTOM_LEFT,
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
                currentPosition: CoverTitlePosition.BOTTOM_LEFT,
            });
        },
        set,
    }
}

let _store = _CoverStore();

export default _store;
