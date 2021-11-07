import type { SevenComponent, SevenMachine } from "@bctnry/seven";
import { InfoSevenComponentIndex } from "@src/seven/SevenComponentIndex";
import MachineStore from "@src/store/Machine.Store";


export const LoadInfoPageComponent: SevenComponent = {
    name: InfoSevenComponentIndex.LoadInfoPage,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Info.loadInfoPage(args.pageList, args._bgList);
    }
};

/*
export const ChangeInfoPageComponent: SevenComponent = {
    name: InfoSevenComponentIndex.ChangeInfoPage,
    call: (args: {[name: string]: any}, m: SevenMachine) => {

    }
};
*/

export const InfoAppendPageComponent: SevenComponent = {
    name: InfoSevenComponentIndex.AppendInfoPage,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Info.appendInfoPage(args.page, args.index);
        return true;
    }
};

export const InfoGotoPageComponent: SevenComponent = {
    name: InfoSevenComponentIndex.SetCurrentPageIndex,

    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Info.setCurrentPageIndex(args.pageIndex);
        return true;
    }
};


export const InfoDeletePageComponent: SevenComponent = {
    name: InfoSevenComponentIndex.DeleteInfoPage,

    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Info.deleteInfoPage(args.pageIndex);
        return true;
    }
};


export const InfoPrevPageComponent: SevenComponent = {
    name: InfoSevenComponentIndex.PrevPage,

    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Info.prevPage();
        return true;
    }
};


export const InfoNextPageComponent: SevenComponent = {
    name: InfoSevenComponentIndex.NextPage,

    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Info.nextPage();
        return true;
    }
};

