<script lang="ts">
import MachineStore from "@src/store/Machine.Store";
import { ConversationHalfviewDescriptor, ConversationSizeMode } from "@src/store/machine/Conversation.Store";

import { onDestroy, onMount } from "svelte";
import ConversationHalfview from "./ConversationHalfview.svelte";

import PhraseList from "./PhraseList.svelte";

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
    console.log(halfViewElement);
});

onDestroy(() => {
    subscriptionList.forEach((v) => v());
});

</script>


<PhraseList />
{#if sizeMode === 'halfview'}
<ConversationHalfview descriptor={halfView} bind:this={halfViewElement} />
{/if}