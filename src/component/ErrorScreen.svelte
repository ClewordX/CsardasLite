<script lang="typescript">
    import { onMount } from "svelte";
    import { MACHINE } from "@src/seven/Machine";
    import { SYSTEM_NAME } from "@src/common/Constants";
    import SystemErrorStore from "@src/store/SystemError.Store";



    let msg: string = '';
    let header: string = '';

    // NOTE: we must stop executing stuff when an error happened.
    onMount(() => {
        MACHINE.lock();
        msg = SystemErrorStore.getValue().message || '';
        header = SystemErrorStore.getValue().headerMessage || '';
    });

</script>

<div class="error-screen">
    <div class="error-screen-msg-container">
        {#if header}<h3 class="error-screen-header-msg"><i>{header}</i></h3>{/if}
        {@html (msg.replaceAll('\n', '<br />'))}
        <br />
    </div>
    <div class="error-screen-ornament-container">
        <span class="error-screen-prompt">ERROR.</span>
        <span class="error-screen-ornament" alt="Waiting screen ornament">&dagger;</span>
        <br />
        <i>CAI System "{SYSTEM_NAME}"<br /></i>
    </div>
</div>


<style scoped>
    .error-screen {
        /* font-family: 'Source Han Serif', 'Times New Roman', Times, serif; */

        font-family: Didot, 'Noto Serif Display', 'Source Han Serif', 'Times New Roman', Times, serif;
        font-weight: bold;
        z-index: 10000000;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: darkred;
        color: white
    }
    .error-screen-header-msg {
        font-size: 300%;
        line-height: 1em;
        font-variant: small-caps;
        margin: 0;

    }
    .error-screen-msg-container {
        position: fixed;
        z-index: 10000001;
        top: 1em;
        left: 1em;
        height: 100%;
        overflow: auto;
        word-break: break-all;
        scrollbar-width: thin;
        scrollbar-color: white darkred;
    }
    .error-screen-ornament-container {
        position: fixed;
        z-index: 10000010;
        bottom: 3em;
        right: 3em;
    }
    .error-screen-prompt {
        font-size: 300%;
    }
    .error-screen-ornament {
        display: inline-block;
        font-size: 400%;
    }
</style>
