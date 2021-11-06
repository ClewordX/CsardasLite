<script lang="ts">

    import type { Unsubscriber } from "svelte/store";
    import { SystemCurrentStatus } from "@src/store/SystemState.Store";
    import SystemStateStore from "@src/store/SystemState.Store";
    import { onDestroy, onMount } from "svelte";
    import ErrorScreen from "./ErrorScreen.svelte";
    import Machine from "./Machine.svelte";
    import WaitingScreen from "./WaitingScreen.svelte";



    let currentStatus: SystemCurrentStatus;

    let subscriptionList: Unsubscriber[] = [];
    onMount(() => {
        subscriptionList.push(SystemStateStore.currentStatus.subscribe((v) => {
            if (currentStatus !== v) { currentStatus = v; }
        }));
    });
    onDestroy(() => {
        subscriptionList.forEach((v) => v());
    });

</script>

{#if currentStatus === SystemCurrentStatus.ERROR}
<ErrorScreen />
{:else if currentStatus === SystemCurrentStatus.WAITING}
<WaitingScreen />
{:else}
<Machine />
{/if}

<style>

</style>


