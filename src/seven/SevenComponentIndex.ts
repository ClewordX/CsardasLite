export enum CommonSevenComponentIndex {
    Wait = 'WAIT',
    Error = 'ERROR',
    SetTitle = 'TITLE',
    SetDescription = 'DESCRIPTION',
    SetMode = 'MODE',
    Reset = 'RESET',
    Listen = 'LISTEN',
    Pause = 'PAUSE',
    Load = 'LOAD',
    LoadFile = 'LOAD_FILE',
}

export enum CoverSevenComponentIndex {
    Set = 'COVER_SET',
}

export enum ConversationSevenComponentIndex {
    Header = 'CONV_HEADER',
    Narrator = 'CONV_NARRATOR',
    Branch = 'CONV_BRANCH',
    Text = 'CONV_TEXT',
    SetMode = 'CONV_SET_MODE',
    SetAnchor = 'CONV_SET_ANCHOR',
    SetBackground = 'CONV_SET_BG',
    SetCharacter = 'CONV_SET_CHAR',
    Clear = 'CONV_CLEAR',
    SetHalfview = 'CONV_SET_HALFVIEW',
    SendMessage = 'CONV_SEND_MSG',
}

export enum InfoSevenComponentIndex {
    LoadInfoPage = 'INFO_LOAD',
    SetCurrentPageIndex = 'INFO_GOTO',
    AppendInfoPage = 'INFO_ADD',
    // ChangeInfoPage = 'INFO_CHANGE',
    DeleteInfoPage = 'INFO_DELETE',
    PrevPage = 'INFO_PREV',
    NextPage = 'INFO_NEXT',
}

export enum TableOfContentsComponentIndex {
    BgColor = 'TOC_BG_COLOR',
    BgImage = 'TOC_BG_IMG',
    SetData = 'TOC_SET_DATA',
}

