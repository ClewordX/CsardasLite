<script lang="ts">
import MachineStore from "@src/store/Machine.Store";

import { ConversationCharacterPhraseDescriptor } from "@src/store/machine/Conversation.Store";





    export let phraseDescriptor: ConversationCharacterPhraseDescriptor;

    let position = (
        phraseDescriptor.position
        || MachineStore.Conversation.characterDict[phraseDescriptor.name]?.position
        || 'left'
    );
    let icon = (
        MachineStore.Conversation.characterDict[phraseDescriptor.name]?.iconUrl
        || ''
    );
</script>

<div>
    {#if phraseDescriptor._order <= 0}
    <div>
        <div class="phrase-character-name" style={`float:${position}`}>{phraseDescriptor.name}</div>
        <div style="clear:both"></div>
    </div>
    {/if}
    <div class="phrase">
        <div class="phrase-inner" style={`flex-direction:row${position === 'right'?'-reverse':''}`}>
            <img class={`phrase-icon-pic phrase-icon-${position}`} src={icon} alt="Phrase icon" />
            <div class={`phrase-text phrase-text-${position}`}>
                {phraseDescriptor.text}
            </div>
        </div>
    </div>
</div>

<style>
    .phrase-character-name {
        font-size: 80%;
        font-family: Arial, Helvetica, sans-serif;
    }
    .phrase-inner {
        margin: 8px;
        margin-left: 0;
        margin-right: 0;
        display: flex;
        align-items: baseline;
    }
    .phrase-icon-pic {
        width: 2.25em;
        height: 2.25em;
    }
    .phrase-text-left {
        margin-left: 0.5em;
    }
    .phrase-text-right {
        margin-right: 0.5em;
    }
</style>