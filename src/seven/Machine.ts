import { SevenMachine } from "@bctnry/seven";
import { SetDescriptionComponent, SetTitleComponent } from "./component/Document.SevenComponent";
import { ErrorComponent } from "./component/Error.SevenComponent";
import { ListenComponent, LoadComponent, LoadFileComponent, PauseComponent, ResetComponent, SetMachineModeComponent } from "./component/Machine.SevenComponent";
import { ConversationBranchComponent, ConversationClearComponent, ConversationHalfviewComponent, ConversationHeaderComponent, ConversationNarratorComponent, ConversationSendMessageComponent, ConversationSetAnchorComponent, ConversationSetBackgroundComponent, ConversationSetCharacterComponent, ConversationSetModeComponent, ConversationTextComponent } from "./component/machine/Conversation.SevenComponent";
import { InfoAppendPageComponent, InfoDeletePageComponent, InfoGotoPageComponent, InfoNextPageComponent, InfoPrevPageComponent, LoadInfoPageComponent } from "./component/machine/Info.SevenComponent";
import { CoverSetComponent } from "./component/machine/Cover.SevenComponent";
import { TOCBgColorComponent, TOCBgImageComponent, TOCSetDataComponent } from "./component/machine/TableOfContents.SevenComponent";

export const MACHINE = new SevenMachine();

[
    SetTitleComponent,
    SetDescriptionComponent,
    ErrorComponent,
    ResetComponent,
    ListenComponent,
    PauseComponent,
    LoadComponent,
    LoadFileComponent,
    SetMachineModeComponent,

    // Cover.
    CoverSetComponent,

    // conversation.
    ConversationHeaderComponent,
    ConversationNarratorComponent,
    ConversationTextComponent,
    ConversationSetBackgroundComponent,
    ConversationSetModeComponent,
    ConversationSetCharacterComponent,
    ConversationSetAnchorComponent,
    ConversationHalfviewComponent,
    ConversationBranchComponent,
    ConversationClearComponent,
    ConversationSendMessageComponent,
    
    // info.
    LoadInfoPageComponent,
    InfoAppendPageComponent,
    InfoGotoPageComponent,
    InfoDeletePageComponent,
    InfoPrevPageComponent,
    InfoNextPageComponent,

    // toc.
    TOCBgColorComponent,
    TOCBgImageComponent,
    TOCSetDataComponent,
    
].forEach((v) => MACHINE.registerComponent(v));

(window as any).MACHINE = MACHINE;


console.log(`SevenMachine component registration complete.`);
