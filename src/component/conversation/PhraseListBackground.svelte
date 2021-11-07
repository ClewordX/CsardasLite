<script lang="ts">
import { ConversationSizeMode } from "@src/store/machine/Conversation.Store";

import { afterUpdate } from "svelte";
import { ConversationMessageReceiverManager } from "./MessageReceiverManager";



    export let type: 'image'|'iframe'|'color' = 'image';
    // NOTE: source is a string of format '#rrggbb' when tyep is 'color'.
    export let source: string;
    export let mode: ConversationSizeMode;

    let bgIframe: HTMLIFrameElement;
    afterUpdate(() => {
        if (type === 'iframe') {
            ConversationMessageReceiverManager.registerCurrentMessageReceiver(bgIframe);
        }
    });
</script>


{#if type === 'image'}
<img class={`conversation-background-image conversation-background-image-${mode}`} src={source} alt="conversation background" />
{:else if type === 'iframe'}
<iframe class={`conversation-background-image conversation-background-image-${mode}`} title="conversation background" src={source} bind:this={bgIframe}></iframe>
{:else if type === 'color'}
<div class={`conversation-background-image conversation-background-image-${mode}`} style={`background-color:${source}`}>&nbsp;</div>
{/if}

<style>
    .conversation-background-image {
        z-index: 100001;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        width: 100%;
        object-fit: cover;
    }
    .conversation-background-iframe {
        width: 100%;
        height: 100%;
    }
    .conversation-background-image-halfview {
        right: 60% !important;
        width: 40%;
    }
    @media (max-width: 1366px) {
        .conversation-background-image-halfview {
            right: 55% !important;
            width: 45%;
        }
    }
    @media (max-width: 1024px) {
        .conversation-background-image-halfview {
            right: 50% !important;
            width: 50%;
        }
    }
</style>