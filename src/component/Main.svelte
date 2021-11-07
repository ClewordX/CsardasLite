<script lang="ts">

    import type { Unsubscriber } from "svelte/store";
    import { SystemCurrentStatus } from "@src/store/SystemState.Store";
    import SystemStateStore from "@src/store/SystemState.Store";
    import { onDestroy, onMount } from "svelte";
    import ErrorScreen from "./ErrorScreen.svelte";
    import Machine from "./Machine.svelte";
    import WaitingScreen from "./WaitingScreen.svelte";
import { MACHINE } from "@src/seven/Machine";
import { jit } from "@src/jit/JIT";
import MachineStore from "@src/store/Machine.Store";



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
        let data = (window as any).__SESSION = e.data.docsJson;
        let entry = (window as any).__ENTRY = e.data.main;
        SystemStateStore.notReady();
        let jitted = jit(data[entry]);
        MACHINE.loadProgram(jitted);
        MACHINE.unlock();
        SystemStateStore.ready();
        MACHINE.step();        
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


