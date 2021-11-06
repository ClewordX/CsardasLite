import { SevenMachine } from "@bctnry/seven";
import { SetDescriptionComponent, SetTitleComponent } from "./component/Document.SevenComponent";
import { ErrorComponent } from "./component/Error.SevenComponent";
import { ListenComponent, LoadComponent, LoadFileComponent, PauseComponent, ResetComponent, SetMachineModeComponent } from "./component/Machine.SevenComponent";
import { ConversationBranchComponent, ConversationClearComponent, ConversationHalfviewComponent, ConversationHeaderComponent, ConversationNarratorComponent, ConversationSendMessageComponent, ConversationSetAnchorComponent, ConversationSetBackgroundComponent, ConversationSetCharacterComponent, ConversationSetModeComponent, ConversationTextComponent } from "./component/machine/Conversation.SevenComponent";
import { InfoAppendPageComponent, InfoDeletePageComponent, InfoGotoPageComponent, InfoNextPageComponent, InfoPrevPageComponent, LoadInfoPageComponent } from "./component/machine/Info.SevenComponent";
import { SegueSetComponent } from "./component/machine/Segue.SevenComponent";

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

    // segue.
    SegueSetComponent,

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
    
].forEach((v) => MACHINE.registerComponent(v));


console.log(`SevenMachine component registration complete.`);
