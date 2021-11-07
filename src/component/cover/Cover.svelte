<script lang="ts">
import { MACHINE } from "@src/seven/Machine";

import MachineStore from "@src/store/Machine.Store";

import { CoverTitlePosition } from "@src/store/machine/Cover.Store";
import { isLightColor } from "@src/utils/Predicates";

import { onDestroy, onMount } from "svelte";
import EnterPrompt from "../common/EnterPrompt.svelte";
import * as Marked from 'marked';



let title: string;
let topTitle: string;
let bgColor: string;
let isBgColorLight: boolean|undefined;
let bgUrl: string;
let position: CoverTitlePosition;
let description: string;


let subscriptionList: any[] = [];
onMount(() => {
    subscriptionList.push(MachineStore.Cover.subscribe((v) => {
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

<div id="cover" class="cover">
    {#if bgUrl}
    <img class="cover-background-image" src={bgUrl} alt="cover background" />
    {:else if bgColor}
    <div class={`cover-background-image`} style={`background-color:${bgColor}`}>&nbsp;</div>
    {/if}
    {#if description && description.trim()}
    <div id="cover-description">
        {@html Marked.parse(description)}
    </div>
    {/if}
    <div id="cover-title-container" class={`cover-title-container-${position}`}>
        <h2 id="cover-top-title">{topTitle}</h2>
        <span id="cover-title">{title}</span>
    </div>

    <span id="cover-next" style={bgUrl||isBgColorLight===undefined?'-webkit-text-stroke: 1px black;color:white;':`color:${isBgColorLight?'black':'white'} !important;`}>
        <EnterPrompt onClick={()=>{MACHINE.step();}}/>
    </span>
</div>

<style>
    #cover {
        font-family: 'Times New Roman', Times, serif;
    }
    #cover-title-container {
        position: fixed;
        z-index: 100010;
        font-size: 200%;
        font-family: Didot, 'Noto Serif Display', 'Times New Roman', Times, serif;
    }
    
    .cover-title-container-bottom_left {
        bottom: 3rem;
        left: 2rem;
    }
    .cover-title-container-center {
        bottom: auto;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #cover-description {
        z-index: 100020;
        position: fixed;
        top: 2rem;
        left: 2rem;
        background-color: #0000008f;
        color: white;
        padding: 1rem;
    }
    :global(#cover-description a) {
        color: white;
        text-decoration: underline;
    }
    #cover-title {
        z-index: 100010;
        color: white;
        line-height: 1.2em;
        margin: 0;
        font-size: 7rem;
        /* -webkit-text-stroke: 1px black; */
    }
    #cover-top-title {
        color: white;
        margin: 0;
        font-size: 1.5rem;
    }
    #cover-next {
        z-index: 100010 !important;
        position: fixed !important;
        bottom: 1rem !important;
        right: 1rem !important;
        font-size: 4rem !important;
    }

    .cover-background-image {
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

