<script lang="ts">
import { MACHINE } from "@src/seven/Machine";

import MachineStore from "@src/store/Machine.Store";

import { SegueTitlePosition } from "@src/store/machine/Segue.Store";
import { isLightColor } from "@src/utils/Predicates";

import { onDestroy, onMount } from "svelte";
import EnterPrompt from "../common/EnterPrompt.svelte";




let title: string;
let topTitle: string;
let bgColor: string;
let isBgColorLight: boolean|undefined;
let bgUrl: string;
let position: SegueTitlePosition;
let description: string;


let subscriptionList: any[] = [];
onMount(() => {
    subscriptionList.push(MachineStore.Segue.subscribe((v) => {
        position = v.currentPosition;
        title = v.currentTitle;
        topTitle = v.currentTopTitle;
        bgColor = v.currentBgColor;
        isBgColorLight = isLightColor(bgColor);
        console.log('isbgcolor', isBgColorLight);
        bgUrl = v.currentBgUrl;
        console.log(v);
        description = v.currentDescription;
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
    <img class="segue-background-image" src={bgUrl} alt="segue background" />
    {:else if bgColor}
    <div class={`segue-background-image`} style={`background-color:${bgColor}`}>&nbsp;</div>
    {/if}
    <div id="segue-title-container" class={`segue-title-container-${position}`}>
        <h2 id="segue-top-title">{topTitle}</h2>
        <span id="segue-title">{title}</span>
    </div>

    <span id="segue-next" style={bgUrl||isBgColorLight===undefined?'-webkit-text-stroke: 1px black;color:white;':`color:${isBgColorLight?'black':'white'} !important;`}>
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
        font-family: Didot, 'Noto Serif Display', 'Times New Roman', Times, serif;
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
        /* -webkit-text-stroke: 1px black; */
    }
    #segue-top-title {
        color: white;
        margin: 0;
        font-size: 1.5rem;
    }
    #segue-next {
        z-index: 100010 !important;
        position: fixed !important;
        bottom: 1rem !important;
        right: 1rem !important;
        font-size: 4rem !important;
    }

    .segue-background-image {
        z-index: 100001;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        width: 100%;
        object-fit: cover;
        filter: brightness(0.7);
    }
</style>

