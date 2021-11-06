<script lang="ts">
import { onDestroy, onMount } from "svelte";

import * as Gemtext from 'gemtext';
import InfoPageIndicator from "./subcomponent/InfoPageIndicator.svelte";
import * as Marked from 'marked';
import EnterPrompt from "../common/EnterPrompt.svelte";
import MachineStore from "@src/store/Machine.Store";
import SystemErrorStore from "@src/store/SystemError.Store";
import { MACHINE } from "@src/seven/Machine";
import { InfoPage } from "@src/store/machine/Info.Store";
import SystemStateStore from "@src/store/SystemState.Store";

    let contentPageList: any[] = MachineStore.Info.pages.getValue();
    let currentPage = 0;
    let subscriptionList = [];
    let backgroundImageUrl;
    let documentTitle = '';

    let displayedContent = '';

    let isFinalPage = false;

    onMount(() => {
        subscriptionList.push(MachineStore.Info.currentPage.subscribe((v) => {
            currentPage = v;
            displayedContent = preprocessCurrentPage();
            if (contentPageList[currentPage] && contentPageList[currentPage].backgroundImageUrl) {
                backgroundImageUrl = contentPageList[currentPage].backgroundImageUrl;
            }
            isFinalPage = v === contentPageList.length - 1;
        }));
        subscriptionList.push(MachineStore.Info.pages.subscribe((v) => {
            contentPageList = v;
            displayedContent = preprocessCurrentPage();
            if (contentPageList[currentPage] && contentPageList[currentPage].backgroundImageUrl) {
                backgroundImageUrl = contentPageList[currentPage].backgroundImageUrl;
            }
        }));
        subscriptionList.push(SystemStateStore.currentDocumentTitle.subscribe((v) => {
            console.log(v);
            documentTitle = v;
        }));
    });

    onDestroy(() => {
        subscriptionList.forEach((v) => v());
    });

    function preprocess(infoPage: InfoPage) {
        switch (infoPage.format) {
            case 'html': {
                return infoPage.content;
            }
            case 'gemtext': {
                return Gemtext.parse(infoPage.content).generate(Gemtext.HTMLGenerator);
            }
            case 'markdown': {
                return Marked.parse(infoPage.content);
            }
            default: {
                SystemErrorStore.error('Unknown info page format.', `Unknown info page format: ${infoPage.format}.`);
                return undefined;
            }
        }
    }

    function preprocessCurrentPage() {
        let currentInfoPage = contentPageList[currentPage];
        if (!currentInfoPage) {
            SystemErrorStore.error(
                'Info page not found.',
                `Trying to find page ${currentPage+1} in a series of ${contentPageList.length} pages.
                 Related data:
                 <pre>${JSON.stringify(contentPageList, undefined, '    ')}</pre>`
            );
            console.log('error');
            return undefined;
        }
        return preprocess(currentInfoPage)||'';
    }

    function leave() {
        MACHINE.unlock();
        MACHINE.step();
    }

</script>

<svelte:head>
    {#each MachineStore.Info.currentBgUrl as url}
        <link rel="preload" href={url} as="image" />
    {/each}
</svelte:head>
<div class="info">
    {#if backgroundImageUrl}
    <img class="info-background-image" src={backgroundImageUrl} alt="info background" />
    {/if}
    <div class="info-content">
        {@html displayedContent}
        {#if isFinalPage}
        <EnterPrompt ornament="&rarr;" onClick={leave}/>
        {/if}
    </div>
    <InfoPageIndicator />
    <span class="info-title"><i>{documentTitle}</i></span>

</div>

<style>
    .info {
        font-family: 'Times New Roman', Times, serif;
        z-index: 100000;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
    }
    .info-background-image {
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
    .info-content {
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
        .info-content {
            left: 15%;
            right: 15%;
        }
    }
    @media (max-width: 640px) {
        .info-content {
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
    .info-content :global(a) {
        color: white !important;
        text-decoration: underline;
    }
</style>

