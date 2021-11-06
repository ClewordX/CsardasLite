<script lang="typescript">
    // NOTE: basically we have to fade out afther the wait is completed.
    // this is done by passing a flag store & set it to `true` from the
    // other side.
    import type { Unsubscriber } from "svelte/store";
    import { onDestroy, onMount } from "svelte";
    import SystemWaitingStore from "@src/store/SystemWaiting.Store";
    import { SYSTEM_NAME } from "@src/common/Constants";

    let msg: string[] = [];
    let msgWindow: HTMLDivElement;


    let subscriptionList: Unsubscriber[] = [];
    onMount(() => {
        subscriptionList.push(SystemWaitingStore.message.subscribe((v) => {
            msg = v;
            msgWindow.scrollTo({
                top: msgWindow.scrollHeight - msgWindow.clientHeight,
                behavior: 'smooth'
            });
        }));
        msgWindow.scrollTo({
            top: msgWindow.scrollHeight,
            behavior: 'smooth'
        });
    });
    onDestroy(() => {
        subscriptionList.forEach((v) => v());
    })

</script>

<div class="waiting-screen">
    <div class="waiting-screen-msg-container" bind:this={msgWindow}>
        {#each msg as _msg}
        {_msg}<br />
        {/each}
        <br />
    </div>
    <div class="waiting-screen-ornament-container">
        <span class="waiting-screen-prompt">LOADING...</span>
        <span class="waiting-screen-ornament" alt="Waiting screen ornament">&dagger;</span>
        <br />
        <i>CAI System "{SYSTEM_NAME}"</i>
    </div>
</div>


<style scoped>
    .waiting-screen {
        /* font-family: 'Source Han Serif', 'Times New Roman', Times, serif; */
        font-family: Didot, 'Noto Serif Display', 'Source Han Serif', 'Times New Roman', Times, serif;
        font-weight: bold;
        z-index: 10000000;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: black;
        color: white
    }
    .waiting-screen-msg-container {
        position: fixed;
        z-index: 10000001;
        top: 1em;
        left: 1em;
        width: 40%;
        height: 10em;
        overflow: auto;
        word-break: break-all;
        scrollbar-width: thin;
        scrollbar-color: white black;
    }
    .waiting-screen-ornament-container {
        position: fixed;
        z-index: 10000010;
        bottom: 3em;
        right: 3em;
    }
    .waiting-screen-prompt {
        font-size: 300%;
    }
    .waiting-screen-ornament {
        display: inline-block;
        font-size: 400%;
        animation: 2s infinite ease-in-out rotate;
    }
    @keyframes rotate {
        0% {
            transform: rotateY(0);
        }
        100% {
          transform: rotateY(180deg);
        }
    }
</style>
