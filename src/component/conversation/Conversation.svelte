<script lang="ts">
import MachineStore from "@src/store/Machine.Store";
import type { ConversationHalfviewDescriptor, ConversationSizeMode } from "@src/store/machine/Conversation.Store";

import { onDestroy, onMount } from "svelte";
import OmniconStore from "../omnicon/Omnicon.Store";
import ConversationHalfview from "./ConversationHalfview.svelte";

import PhraseList from "./PhraseList.svelte";
import PhraseListUIStore from "./PhraseListUI.Store";

let subscriptionList: any[] = [];
let sizeMode: ConversationSizeMode;
let halfView: ConversationHalfviewDescriptor;
let halfViewElement;

onMount(() => {
    subscriptionList.push(MachineStore.Conversation.currentPhraseListState.currentSizeMode.subscribe((v) => {
        sizeMode = v;
    }));
    subscriptionList.push(MachineStore.Conversation.currentHalfview.subscribe((v) => {
        halfView = v;
    }));
});

onDestroy(() => {
    subscriptionList.forEach((v) => v());

    OmniconStore.removeById('TOGGLE_CHATBOX_VISIBILITY');
});

</script>


<PhraseList />
{#if sizeMode === 'halfview'}
<ConversationHalfview descriptor={halfView} bind:this={halfViewElement} />
{/if}