<script lang="ts">
import { MACHINE } from "@src/seven/Machine";

import MachineStore from "@src/store/Machine.Store";

import { SegueTitlePosition } from "@src/store/machine/Segue.Store";

import { onDestroy, onMount } from "svelte";
import EnterPrompt from "../common/EnterPrompt.svelte";




let title: string;
let topTitle: string;
let subTitle: string;
let bgUrl: string;
let position: SegueTitlePosition;


let subscriptionList: any[] = [];
onMount(() => {
    subscriptionList.push(MachineStore.Segue.subscribe((v) => {
        position = v.currentPosition;
        title = v.currentTitle;
        topTitle = v.currentTopTitle;
        subTitle = v.currentSubTitle;
        bgUrl = v.currentBgUrl;
    }));
});
onDestroy(() => {
    subscriptionList.forEach((v) => v());
});
</script>

<svelte:head>
    {#if bgUrl}
        <link rel="preload" href={bgUrl} as="image" />
    {/if}
</svelte:head>

<div id="segue" class="segue">
    {#if bgUrl}
    <img id="segue-background-image" src={bgUrl} alt="segue background" />
    {/if}
    <div id="segue-title-container" class={`segue-title-container-${position}`}>
        <h2 id="segue-top-title">{topTitle}</h2>
        <h1 id="segue-title">{title}</h1>
        <h2 id="segue-sub-title">{subTitle}</h2>
    </div>

    <span id="segue-next">
        <EnterPrompt onClick={()=>{MACHINE.step();}}/>
    </span>
</div>

<style>
    #segue {
        font-family: 'Times New Roman', Times, serif;
    }
    #segue-title-container {
        position: fixed;
        z-index: 100010;
        font-size: 200%;
    }
    
    .segue-title-container-bottom_left {
        bottom: 3rem;
        left: 2rem;
    }
    .segue-title-container-center {
        bottom: auto;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #segue-title {
        z-index: 100010;
        color: white;
        line-height: 1.2em;
        margin: 0;
        font-size: 7rem;
        -webkit-text-stroke: 2px black;
    }
    #segue-sub-title {
        font-weight: 500;
        color: white;
        margin: 0;
        font-size: 2rem;
    }
    #segue-top-title {
        color: white;
        margin: 0;
        font-size: 1.5rem;
    }
    #segue-next {
        z-index: 100010 !important;
        position: fixed !important;
        color: white !important;
        bottom: 1rem !important;
        right: 1rem !important;
        font-size: 2rem !important;
    }

    #segue-background-image {
        z-index: 100001;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        width: 100%;
        object-fit: cover;
        filter: brightness(0.6);
    }
</style>

