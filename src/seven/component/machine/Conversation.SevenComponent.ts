import type { SevenComponent, SevenMachine } from "@bctnry/seven";
import { ConversationMessageReceiverManager } from "@src/component/conversation/MessageReceiverManager";
import { ConversationSevenComponentIndex } from "@src/seven/SevenComponentIndex";
import MachineStore from "@src/store/Machine.Store";
import { ConversationPhraseType } from "@src/store/machine/Conversation.Store";

export const ConversationHeaderComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.Header,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.nextPhraseWith({
            type: ConversationPhraseType.HEADER,
            level: args.level,
            text: args.text
        });
    }
};

export const ConversationNarratorComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.Narrator,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.nextPhraseWith({
            type: ConversationPhraseType.NARRATOR,
            text: args.text
        });
    }
};

export const ConversationSetCharacterComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.SetCharacter,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.setCharacterDict(args.characterDict);
        return true;
    }
};

export const ConversationTextComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.Text,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.nextPhraseWith({
            type: ConversationPhraseType.CHARACTER,
            ...args
        } as any);
    }
};

export const ConversationSetBackgroundComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.SetBackground,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.setBackground(args as any);
        return true;
    }
};

export const ConversationSetModeComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.SetMode,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.setSizeMode(args.mode);
        if (args.mode === 'reset') {
            return true;
        }
    }
};

export const ConversationSetAnchorComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.SetAnchor,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.setDisplayAnchor(args.anchor);
        return true;
    }
};

export const ConversationClearComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.Clear,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.reset();
        return true;
    }
};

export const ConversationHalfviewComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.SetHalfview,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.setHalfview(args as any);
        return true;
    }
};

export const ConversationBranchComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.Branch,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        MachineStore.Conversation.nextPhraseWith({
            type: ConversationPhraseType.BRANCHING,
            choice: args.branchList
        } as any);
    }
};

export const ConversationSendMessageComponent: SevenComponent = {
    name: ConversationSevenComponentIndex.SendMessage,
    call: (args: {[name: string]: any}, m: SevenMachine) => {
        ConversationMessageReceiverManager.sendMessage(args.data);
        return !!!args.stopAfterSend;
    }
}


