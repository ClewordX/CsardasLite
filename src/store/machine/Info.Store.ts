import { Accessible, accessible } from "@src/common/Accessible";

export type InfoContentFormat = 'gemtext'|'markdown'|'html';
export type InfoPage = {
    content: string,
    format: InfoContentFormat,
    backgroundImageUrl?: string,
};
// NOTE: 一般而言info的内容是整个变动，不大会出现单独更新一页的情况。


function _InfoStore() {
    let store = {
        pages: accessible<InfoPage[]>([]),
        currentPage: accessible(0),
        currentBgUrl: [],
        
        reset: () => {
            store.pages.set([]);
            store.currentPage.set(0);
        },
        loadInfoPage: (pageList: InfoPage[], cacheBgList: string[] = []) => {
            store.currentBgUrl = cacheBgList;
            store.pages.set(pageList);
            store.currentPage.set(0);
        },
        setCurrentPageIndex: (pageIndex: number) => {
            store.currentPage.set(pageIndex);
        },
        appendInfoPage: (page: InfoPage, index?: number) => {
            if (index === undefined) {
                store.pages.getValue().push(page);
            } else {
                store.pages.getValue().splice(index, 0, page);
            }
            store.pages.set(store.pages.getValue());
        },
        changeInfoPage: (newPage: InfoPage, pageIndex: number) => {
            store.pages.getValue()[pageIndex] = newPage;
            store.pages.set(store.pages.getValue());
        },
        deleteInfoPage: (pageIndex: number) => {
            if (store.currentPage.getValue() === pageIndex) {
                store.currentPage.update((v) => v === 0? 0 : v-1);
            } else {
                store.pages.getValue().splice(pageIndex, 1);
                store.pages.set(store.pages.getValue());
            }
        },
        hasPrevPage: () => {
            return store.currentPage.getValue() > 0;
        },
        hasNextPage: () => {
            return store.currentPage.getValue() + 1 < store.pages.getValue().length;
        },
        prevPage: () => {
            if (store.currentPage.getValue() > 0) {
                store.currentPage.update((v) => v - 1);
            }
        },
        nextPage: () => {
            if (store.currentPage.getValue() + 1 < store.pages.getValue().length) {
                store.currentPage.update((v) => v + 1);
            }
        },
    }
    return store;

}

export default _InfoStore();
