<script lang="ts">
import { GlobalLoadCourseData } from "@src/seven/Common";

import MachineStore from "@src/store/Machine.Store";

import { TTableOfContentsBackgroundDescriptor, TTableOfContentsItem } from "@src/store/machine/TableOfContents.Store";
import SystemStateStore from "@src/store/SystemState.Store";
import { onDestroy, onMount } from "svelte";
import { Unsubscriber } from "svelte/store";



let background: TTableOfContentsBackgroundDescriptor = MachineStore.TableOfContents.currentBackground.getValue();
let contentList: TTableOfContentsItem[] = MachineStore.TableOfContents.currentData.getValue();
let documentTitle: string = '';

let subscriptionList: Unsubscriber[] = [];
onMount(() => {
    subscriptionList.push(
        MachineStore.TableOfContents.currentBackground.subscribe((v) => {
            background = v;
        }),
        MachineStore.TableOfContents.currentData.subscribe((v) => {
            contentList = v;
        }),
        SystemStateStore.currentDocumentTitle.subscribe((v) => {
            documentTitle = v;
        }),
    );
});
onDestroy(() => {
    subscriptionList.forEach((v) => v());
});

function handleTOCItemClick(x: number) {
    return (e) => {
        let currentSession = (window as any).__SESSION;
        GlobalLoadCourseData(currentSession[contentList[x].file]);
    }
}

</script>


<div id="clite-toc">

    {#if background.type === 'image'}
    <img class={`toc-background-image`} src={background.url} alt="toc background" />
    {:else if background.type === 'color'}
    <div class={`toc-background-image`} style={`background-color:${background.color}`}>&nbsp;</div>
    {/if}

    <div id="clite-toc-container">
        {#each contentList as content, i}
            <div class="clite-toc-item"
                on:click={handleTOCItemClick(i)}
            >
                <h2 style="margin:0;">{content.title}</h2>
                <p>{content.description||''}</p>
            </div>
        {/each}
    </div>

    <div id="clite-toc-ornament">
        &#9753; <i>{documentTitle}</i> &#10087;
    </div>
    
</div>

<style>
    #clite-toc {
        font-family: 'Times New Roman', Times, serif;
        z-index: 100000;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }

    .toc-background-image {
        z-index: 100001;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        width: 100%;
        object-fit: cover;
    }

    .clite-toc-item {
        border-bottom: 1px white solid;
        padding: 0.5rem;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
    }
    .clite-toc-item:hover {
        background-color: white;
        color: black;
    }


    #clite-toc-container {
        z-index: 100010;
        position: fixed;
        left: 20%;
        right: 20%;
        top: 2em;
        bottom: 3.75em;
        background-color: #0000009f;
        color: white;
        padding: 2em;
        padding-left: 2em;
        padding-right: 2em;
        overflow: auto;
        scrollbar-color: white black;
    }
    #clite-toc-ornament {
        z-index: 100020;
        position: fixed;
        left: 20%;
        right: 20%;
        bottom: 2em;
        background-color: #0000009f;
        color: white;
        height: 2rem;
        overflow: auto;
        text-align: center;
        font-size: 1rem;
        font-family: Didot, 'Times New Roman', Times, serif;
    }

    @media (max-width: 720px) {
        #clite-toc-container {
            left: 15%;
            right: 15%;
        }
    }
    @media (max-width: 640px) {
        #clite-toc-container {
            left: 10%;
            right: 10%;
        }
    }
    ::-webkit-scrollbar {
        background-color: black;
    }
    ::-webkit-scrollbar-thumb {
        background-color: white;
    }
    #clite-toc-container :global(a) {
        color: white !important;
        text-decoration: underline;
    }
</style>

