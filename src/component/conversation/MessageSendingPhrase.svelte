<script lang="ts">
import { ConversationMessageSendingPhraseDescriptor } from "@src/store/machine/Conversation.Store";
import * as Marked from "marked";
import { ConversationMessageReceiverManager } from "./MessageReceiverManager";



    export let phraseDescriptor: ConversationMessageSendingPhraseDescriptor;

    function handleSendingMessageAction(i: number) {
        ConversationMessageReceiverManager.sendMessage(phraseDescriptor.actions[i].message);
    }
</script>

<div class="message-sending-phrase">
    <div class="message-sending-phrase-actions">
        {#each phraseDescriptor.actions as action, i}
            <span class="message-sending-phrase-action-item"
                on:click={(e) => handleSendingMessageAction(i)}
            >{action.name}</span>
        {/each}
    </div>
    <div class="message-sending-phrase-content">
        {@html Marked.parseInline(phraseDescriptor.content)}
    </div>
</div>

<style>
    .message-sending-phrase {
        background-color: #000000cd;
        font-size: 0.95em;
        padding: 0.45em;
        position: relative;
    }
</style>
