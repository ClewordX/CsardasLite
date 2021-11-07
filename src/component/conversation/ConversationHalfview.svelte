<script lang="ts">
import { ConversationHalfviewDescriptor } from "@src/store/machine/Conversation.Store";

import { afterUpdate } from "svelte";
import { ConversationMessageReceiverManager } from "./MessageReceiverManager";


    export let descriptor: ConversationHalfviewDescriptor;
    let halfviewIframe: HTMLIFrameElement;

    afterUpdate(() => {
        if (descriptor.type === 'iframe') {
            console.log(`halfview`, halfviewIframe);
            ConversationMessageReceiverManager.registerCurrentMessageReceiver(halfviewIframe);
        }
    });
</script>


<div id="conversation-halfview">
    {#if descriptor.type === 'image'}
    <img src={descriptor.url} alt="info background" />
    {:else if descriptor.type === 'iframe'} 
    <iframe id='conversation-halfview-iframe' title="conversation halfview iframe" src={descriptor.url} bind:this={halfviewIframe}></iframe>
    {:else if descriptor.type === 'color'}
    <div id='conversation-halfview-color' style={`background-color:${descriptor.color}`}>&nbsp;</div>
    {/if}
</div>

<style>
    #conversation-halfview {
        font-family: 'Times New Roman', Times, serif;
        z-index: 100000;
        position: fixed;
        left: 40%;
        right: 0;
        top: 0;
        bottom: 0;
        overflow: auto;
    }
    @media (max-width: 1366px) {
        #conversation-halfview {
            left: 45%;
        }
        #conversation-halfview-color {
            left: 45%;
        }
    }
    @media (max-width: 1024px) {
        #conversation-halfview {
            left: 50%;
        }
        #conversation-halfview-color {
            left: 50%;
        }
    }
    #conversation-halfview-color {
        font-family: 'Times New Roman', Times, serif;
        z-index: 100000;
        position: fixed;
        left: 40%;
        right: 0;
        top: 0;
        bottom: 0;
    }
    #conversation-halfview-iframe {
        border: 0;
        width: 100%;
        height: 100%;
    }
</style>


