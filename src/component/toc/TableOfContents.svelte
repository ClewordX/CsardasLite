<script lang="ts">
import MachineStore from "@src/store/Machine.Store";

import { TTableOfContentsBackgroundDescriptor, TTableOfContentsItem } from "@src/store/machine/TableOfContents.Store";
import { onDestroy, onMount } from "svelte";
import { Unsubscriber } from "svelte/store";



let background: TTableOfContentsBackgroundDescriptor = MachineStore.TableOfContents.currentBackground.getValue();
let contentList: TTableOfContentsItem[] = MachineStore.TableOfContents.currentData.getValue();

let subscriptionList: Unsubscriber[] = [];
onMount(() => {
    MachineStore.TableOfContents.currentBackground.subscribe((v) => {
        background = v;
    });
    MachineStore.TableOfContents.currentData.subscribe((v) => {
        contentList = v;
    });
});
onDestroy(() => {
    subscriptionList.forEach((v) => v());
})

</script>


<div id="clite-toc">

    {#if background.type === 'image'}
    <img class={`toc-background-image`} src={background.url} alt="conversation background" />
    {:else if background.type === 'color'}
    <div class={`toc-background-image`} style={`background-color:${background.color}`}>&nbsp;</div>
    {/if}

    <div id="clite-toc-container">
        {#each contentList as content}
            <div id="clite-toc-item">
                <h2>{content.title}</h2>
                <p>{content.description||''}</p>
            </div>
        {/each}
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
    .info-title {
        z-index: 100002;
        position: fixed;
        right: 1em;
        bottom: 1em;
        color: white;
        font-family: 'Source Han Serif', 'Times New Roman', Times, serif;
        background-color: #0000007f;
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

