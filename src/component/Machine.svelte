<script lang="ts">
import MachineStore, { EMode } from "@src/store/Machine.Store";

import { onDestroy, onMount } from "svelte";
import { Unsubscriber } from "svelte/store";
import Demonstration from "./demonstration/Demonstration.svelte";
import Segue from "./segue/Segue.svelte";
import Info from "./info/Info.svelte";
import TableOfContents from "./toc/TableOfContents.svelte";
import Conversation from "./demonstration/Conversation.svelte";


let mode: EMode|undefined = undefined;
let subscriptionList: Unsubscriber[] = [];
onMount(() => {
    subscriptionList.push(MachineStore.currentMode.subscribe((v) => {
        mode = v;
    }));
});
onDestroy(() => {
    subscriptionList.forEach((v) => v());
});
</script>


{#if mode === EMode.TOC}
<TableOfContents />
{:else if mode === EMode.SEGUE}
<Segue />
{:else if mode === EMode.CONVERSATION}
<Conversation />
{:else if mode === EMode.INFO}
<Info />
{/if}

<style>

</style>

