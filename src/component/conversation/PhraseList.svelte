<script lang="ts">
import { afterUpdate, onDestroy, onMount } from "svelte";
import NarratorPhrase from "./NarratorPhrase.svelte";
import NormalPhrase from "./NormalPhrase.svelte";
import HeaderPhrase from "./HeaderPhrase.svelte";
import PhraseListBackground from "./PhraseListBackground.svelte";
import BranchingPhrase from "./BranchingPhrase.svelte";
import { ConversationDisplayAnchor, ConversationPhraseDescriptor, ConversationSizeMode } from "@src/store/machine/Conversation.Store";
import MachineStore from "@src/store/Machine.Store";
import { MACHINE } from "@src/seven/Machine";
import PhraseListUIStore from "./PhraseListUI.Store";
import OmniconStore, { TOmniconMenuItem } from "../omnicon/Omnicon.Store";

let phraseList: ConversationPhraseDescriptor[];
let nextKeyLocked: boolean = false;
let subscriptionList: any[] = [];
let sevenSubscriptionList: any[] = [];
let bgType: 'iframe'|'image'|'color' = 'image';
let bgSource: string = '';
let phraseListSizeMode: ConversationSizeMode;
let phraseListDisplayAnchor: ConversationDisplayAnchor;
let showChatbox: boolean = true;
let showFromHiding: boolean = false;
let omniconToggleShownMenuItem: TOmniconMenuItem;
onMount(() => {
    PhraseListUIStore.enableNext();
    subscriptionList.push(MachineStore.Conversation.currentPhraseListState.currentSizeMode.subscribe((v) => {
        console.log(v);
        phraseListSizeMode = v;
    }));
    subscriptionList.push(MachineStore.Conversation.currentPhraseListState.currentDisplayAnchor.subscribe((v) => {
        phraseListDisplayAnchor = v;
    }));
    subscriptionList.push(MachineStore.Conversation.currentPhrases.subscribe((v) => {
        PhraseListUIStore.showFromHiding = false;
        phraseList = v;
    }));
    subscriptionList.push(MachineStore.Conversation.currentBackground.subscribe((v) => {
        bgType = v.type;
        bgSource = v.type === 'image'? v.url
        : v.type === 'iframe'? v.url
        : v.color;
    }));
    subscriptionList.push(PhraseListUIStore.isNextButtonAvailable.subscribe((v) => {
        nextKeyLocked = !v;
    }));
});

OmniconStore.add({
    title: '显示/隐藏对话框',
    callback: () => {
        if (!showChatbox) {
            showFromHiding = true;
            showChatbox = true;
        } else {
            showChatbox = false;
        }
        
        return true;
    }
});
onDestroy(() => {
    subscriptionList.forEach((v) => v());
    sevenSubscriptionList.forEach((v) => v.unsubscribe());
});

function nextPhrase() {
    if (!nextKeyLocked) {
        MACHINE.step();
    }
}

let phraseListElement: HTMLDivElement;
afterUpdate(() => {
    phraseListElement && phraseListElement.scrollTo({
        behavior: PhraseListUIStore.showFromHiding? undefined : 'smooth',
        top: phraseListElement.scrollHeight
    });
});

</script>

<div class={`phrase-list-container phrase-list-container-${phraseListSizeMode}`}>
    <PhraseListBackground mode={phraseListSizeMode} type={bgType} source={bgSource} />
    {#if showChatbox}
        <div class={`phrase-list phrase-list-${phraseListSizeMode} phrase-list-${phraseListSizeMode}-${phraseListDisplayAnchor}`} bind:this={phraseListElement}>
            {#if phraseList}
                {#each phraseList as phrase}
                    {#if phrase.type === 1}
                        <NarratorPhrase phraseDescriptor={phrase} />
                    {:else if phrase.type === 2}
                        <NormalPhrase phraseDescriptor={phrase} />
                    {:else if phrase.type === 3}
                        <HeaderPhrase phraseDescriptor={phrase} />
                    {:else if phrase.type === 4}
                        <BranchingPhrase phraseDescriptor={phrase} />
                    {/if}
                {/each}
            {:else}
            Empty.
            {/if}
        </div>
        <div id="phrase-list-next" class={`phrase-list-next phrase-list-next-${phraseListSizeMode} phrase-list-next-${phraseListSizeMode}-${phraseListDisplayAnchor} phrase-list-next-${nextKeyLocked}`} on:click={nextPhrase}>
            <span>&rarr;</span>
        </div>
    {/if}
</div>

<style>
    .phrase-list-container {
        font-family: 'Times New Roman', Times, serif;
        z-index: 100000;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
    .phrase-list-container-halfview {
        right: 60% !important;
    }
    .phrase-list {
        z-index: 100010;
        position: fixed;
        top: 2em;
        bottom: 2.75em;
        background-color: #0000009f;
        color: white;
        padding: 2em;
        padding-left: 2em;
        padding-right: 2em;
        overflow: auto;
        scrollbar-color: white black;
    }
    .phrase-list-fullview {
        left: 20%;
        right: 20%;
    }
    .phrase-list-chatbox {
        position: fixed;
        background-color: #0000009f;
        color: white;
        padding: 2em;
        padding-left: 2em;
        padding-right: 2em;
        overflow: auto;
        scrollbar-color: white black;
        height: 50%;
    }
    .phrase-list-chatbox-bottom_left {
        top: initial;
        left: 1em;
        right: 66%;
        bottom: 2.5em;
    }
    .phrase-list-chatbox-bottom_right {
        top: initial;
        right: 1em;
        left: 66%;
        bottom: 2.5em;
    }
    .phrase-list-chatbox-top_left {
        top: 1em;
        bottom: initial;
        left: 1em;
        right: 66%;
    }
    .phrase-list-chatbox-top_right {
        top: 1em;
        bottom: initial;
        right: 1em;
        left: 66%;
    }
    .phrase-list-halfview {
        left: 0% !important;
        right: 60% !important;
        top: 0;
        bottom: 1.5em !important;
    }


    .phrase-list-next {
        z-index: 100011;
        position: fixed;
        bottom: 1.25em;
        line-height: 1.5em;
        background-color: #000000df;
        color: white;
        user-select: none;
        text-align: center;
    }
    .phrase-list-next-fullview {
        left: 20%;
        right: 20%;
    }
    .phrase-list-next-chatbox-bottom_left {
        left: 1em;
        bottom: 1em;
        right: 66%;
    }
    .phrase-list-next-chatbox-bottom_right {
        right: 1em;
        bottom: 1em;
        left: 66%;
    }
    .phrase-list-next-chatbox-top_left {
        left: 1em;
        top: calc(50% + 5em);
        bottom: initial;
        right: 66%;
    }
    .phrase-list-next-chatbox-top_right {
        right: 1em;
        top: calc(50% + 5em);
        bottom: initial;
        left: 66%;
    }
    .phrase-list-next-halfview {
        left: 0% !important;
        right: 60% !important;
        bottom: 0 !important;
    }


    @media (max-width: 1366px) {
        .phrase-list-container-halfview {
            right: 55% !important;
        }
        .phrase-list-halfview {
            right: 55% !important;
        }
        .phrase-list-next-halfview {
            right: 55% !important;
        }
    }
    @media (max-width: 1024px) {
        .phrase-list-container-halfview {
            right: 50% !important;
        }
        .phrase-list-halfview {
            right: 50% !important;
        }
        .phrase-list-next-halfview {
            right: 50% !important;
        }
    }
    .phrase-list-next-true {
        color: #7f7f7f;
    }
    /* TODO: this css is freaking slow. fix this. */
    @media (max-width: 720px) {
        .phrase-list-chatbox-bottom_left { left: 1em !important; right: 50% !important; }
        .phrase-list-chatbox-bottom_right { right: 1em !important; left: 50% !important; }
        .phrase-list-chatbox-top_left { left: 1em !important; right: 50% !important; }
        .phrase-list-chatbox-top_right { right: 1em !important; left: 50% !important; }
        
        .phrase-list-next-chatbox-bottom_left { left: 1em !important; right: 50% !important; }
        .phrase-list-next-chatbox-bottom_right { right: 1em !important; left: 50% !important; }
        .phrase-list-next-chatbox-top_left { left: 1em !important; right: 50% !important; }
        .phrase-list-next-chatbox-top_right { right: 1em !important; left: 50% !important; }
        .phrase-list {
            left: 15%;
            right: 15%;
        }
    }
    @media (max-width: 640px) {
        .phrase-list-chatbox-bottom_left { left: 1em !important; right: 33% !important; }
        .phrase-list-chatbox-bottom_right { right: 1em !important; left: 33% !important; }
        .phrase-list-chatbox-top_left { left: 1em !important; right: 33% !important; }
        .phrase-list-chatbox-top_right { right: 1em !important; left: 33% !important; }
        
        .phrase-list-next-chatbox-bottom_left { left: 1em !important; right: 33% !important; }
        .phrase-list-next-chatbox-bottom_right { right: 1em !important; left: 33% !important; }
        .phrase-list-next-chatbox-top_left { left: 1em !important; right: 33% !important; }
        .phrase-list-next-chatbox-top_right { right: 1em !important; left: 33% !important; }
        .phrase-list {
            left: 10%;
            right: 10%;
        }
    }
    @media (max-width: 360px) {
        .phrase-list,
        .phrase-list-chatbox,
        .phrase-list-chatbox-bottom_left,
        .phrase-list-chatbox-bottom_right,
        .phrase-list-chatbox-top_left,
        .phrase-list-chatbox-top_right {
            height: 33% !important;
            bottom: 1.5em !important;
            left: 0 !important;
            right: 0 !important;
            top: auto;
        }
        .phrase-list-next,
        .phrase-list-next-chatbox-bottom_left,
        .phrase-list-next-chatbox-bottom_right,
        .phrase-list-next-chatbox-top_left,
        .phrase-list-next-chatbox-top_right {
            bottom: 0 !important;
            line-height: 1.5em !important;
            left: 0 !important;
            right: 0 !important;
            top: auto;
        }
    }
    ::-webkit-scrollbar {
        background-color: black;
    }
    ::-webkit-scrollbar-thumb {
        background-color: white;
    }

</style>