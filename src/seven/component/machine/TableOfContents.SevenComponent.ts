import type { SevenComponent } from "@bctnry/seven";
import { TableOfContentsComponentIndex } from "@src/seven/SevenComponentIndex";
import MachineStore from "@src/store/Machine.Store";

export const TOCBgColorComponent: SevenComponent = {
    name: TableOfContentsComponentIndex.BgColor,
    call: (args: {[name: string]: any}) => {
        MachineStore.TableOfContents.currentBackground.set({
            type: 'color',
            color: args.color
        });
        return true;
    }
};

export const TOCBgImageComponent: SevenComponent = {
    name: TableOfContentsComponentIndex.BgImage,
    call: (args: {[name: string]: any}) => {
        MachineStore.TableOfContents.currentBackground.set({
            type: 'image',
            url: args.url
        });
        return true;
    }
};

export const TOCSetDataComponent: SevenComponent = {
    name: TableOfContentsComponentIndex.SetData,
    call: (args: {[name: string]: any}) => {
        MachineStore.TableOfContents.currentData.set(args.data);
    }
};


