import { accessible } from "@src/common/Accessible";

export type TTableOfContentsItem = {
    title: string,
    description?: string,
    targetFileName: string,
}

export type TTableOfContentsBackgroundDescriptor =
    { type: 'image', url: string }
    | { type: 'color', color: string }

function _TableOfContentsStore() {
    let store = {
        currentData: accessible<TTableOfContentsItem[]>([]),
        currentBackground: accessible<TTableOfContentsBackgroundDescriptor>({
            type: 'color',
            color: 'darkslategray',
        }),

        reset: () => {
            store.currentData.set([]);
            store.currentBackground.set({
                type: 'color',
                color: 'darkslategray',
            });
        }
    };
    return store;
}

export default _TableOfContentsStore();
