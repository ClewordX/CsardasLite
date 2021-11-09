<script lang="ts">

    import type { Unsubscriber } from "svelte/store";
    import { SystemCurrentStatus } from "@src/store/SystemState.Store";
    import SystemStateStore from "@src/store/SystemState.Store";
    import { onDestroy, onMount } from "svelte";
    import ErrorScreen from "./ErrorScreen.svelte";
    import Machine from "./Machine.svelte";
    import WaitingScreen from "./WaitingScreen.svelte";
import { GlobalLoadCourseData, InitializeDocumentGroup, RetrieveDocument } from "@src/seven/Common";



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

    window.addEventListener('message', (e) => {
        console.log('message', e);
        if (e.data.protocol === 'clepub') {
            InitializeDocumentGroup(e.data);
            SystemStateStore.notReady();
            GlobalLoadCourseData(RetrieveDocument(e.data.main));
            SystemStateStore.ready();
        }
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


