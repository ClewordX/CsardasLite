import { accessible, Accessible } from "@src/common/Accessible";

export enum ConversationDisplayAnchor {
    // these two are for halfview.
    LEFT = 'left',
    RIGHT = 'right',

    // these four are for chatbox.
    TOP_LEFT = 'top_left',
    TOP_RIGHT = 'top_right',
    BOTTOM_LEFT = 'bottom_left',
    BOTTOM_RIGHT = 'bottom_right',
}

export type ConversationPhraseListState = {
    currentSizeMode: Accessible<ConversationSizeMode>,
    currentDisplayMode: Accessible<ConversationDisplayMode>,
    currentDisplayAnchor: Accessible<ConversationDisplayAnchor>,
}

export type ConversationCharacterDescriptor = {
    name: string,
    // default icon.
    iconUrl: string,
    // icon for other emotions.
    iconDict: {[emotion: string]: string},
    position?: 'left'|'right'
}

export enum ConversationPhraseType {
    NARRATOR = 1,
    CHARACTER = 2,
    HEADER = 3,
    BRANCHING = 4,
    MESSAGE_SENDING = 5,
}

export type ConversationNarratorPhraseDescriptor = {
    type: ConversationPhraseType.NARRATOR,
    text: string
};
export type ConversationCharacterPhraseDescriptor = {
    type: ConversationPhraseType.CHARACTER,
    name: string,
    position?: string,
    text: string,
    _order?: number,
};
export type ConversationHeaderDescriptor = {
    type: ConversationPhraseType.HEADER,
    level: number,
    text: string,
};
// NOTE: targets should be compiled by JIT when the program reaches places
// where this is needed.
export type ConversationBranchingDescriptor = {
    type: ConversationPhraseType.BRANCHING,
    choice: {
        text: string,
        target?: number,
    }[]
}

export type ConversationMessageSendingPhraseDescriptor = {
    type: ConversationPhraseType.MESSAGE_SENDING,
    actions: {
        name: string,
        message: any
    }[],
    content?: string,
}
export type ConversationPhraseDescriptor =
    ConversationNarratorPhraseDescriptor
    | ConversationCharacterPhraseDescriptor
    | ConversationHeaderDescriptor
    | ConversationBranchingDescriptor
    | ConversationMessageSendingPhraseDescriptor
;

export type ConversationBackgroundDescriptor = 
    { type: 'image', url: string }
    | { type: 'iframe', url: string }
    | { type: 'color', color: string }

export type ConversationHalfviewDescriptor = 
    { type: 'image', url: string }
    | { type: 'iframe', url: string }
    | { type: 'color', color: string }

export enum ConversationSizeMode {
    FULLVIEW = 'fullview',
    CHATBOX = 'chatbox',
    HALFVIEW = 'halfview',
}
export enum ConversationDisplayMode {
    DEFAULT = 1,
    RECALL = 2,
}

const DEFAULT_SIZE_MODE = ConversationSizeMode.FULLVIEW;
const DEFAULT_DISPLAY_MODE = ConversationDisplayMode.DEFAULT;
const DEFAULT_DISPLAY_ANCHOR = ConversationDisplayAnchor.BOTTOM_LEFT;
function _ConversationStore() {
    let store = {
        currentPhraseListState: {
            currentSizeMode: accessible(DEFAULT_SIZE_MODE),
            currentDisplayMode: accessible(DEFAULT_DISPLAY_MODE),
            currentDisplayAnchor: accessible(DEFAULT_DISPLAY_ANCHOR),
        },
        characterDict: {},
        currentOutline: [],
        currentPhrases: accessible([]),
        currentBackground: accessible<ConversationBackgroundDescriptor>({
            type: 'color',
            color: 'white'
        }),
        currentHalfview: accessible<ConversationHalfviewDescriptor>({
            type: 'color',
            color: 'black'
        }),
        
        reset: () => {
            store.characterDict = {};
            store.currentOutline = [];
            store.currentPhrases.set([]);
            store.currentPhraseListState.currentSizeMode.set(DEFAULT_SIZE_MODE);
            store.currentPhraseListState.currentDisplayMode.set(DEFAULT_DISPLAY_MODE);
            store.currentPhraseListState.currentDisplayAnchor.set(DEFAULT_DISPLAY_ANCHOR);
        },
        setCharacterDict: (characterDict: {[name: string]: ConversationCharacterDescriptor}) => {
            store.characterDict = characterDict;
        },
        setCharacterIcon: (name: string, iconDict: {[emotion: string]: string}) => {
            store.characterDict[name].iconDict = iconDict;
        },
        nextPhraseWith: (x: ConversationPhraseDescriptor) => {
            let phraseList = store.currentPhrases;
            phraseList.getValue().push(x);
            phraseList.set(phraseList.getValue());
        },
        setBackground: (descriptor: ConversationBackgroundDescriptor) => {
            store.currentBackground.set(descriptor);
        },
        setSizeMode(x: ConversationSizeMode|'reset') {
            store.currentPhraseListState.currentSizeMode.set(x === 'reset'? ConversationSizeMode.FULLVIEW : x);
        },
        setDisplayMode(x: ConversationDisplayMode) {
            store.currentPhraseListState.currentDisplayMode.set(x);
        },
        setDisplayAnchor(x: ConversationDisplayAnchor) {
            store.currentPhraseListState.currentDisplayAnchor.set(x);
        },
        setHalfview: (newHalfview: ConversationHalfviewDescriptor) => {
            store.currentHalfview.set(newHalfview);
        },
    };
    return store;
}

export default _ConversationStore();
