<script lang="ts">
import MachineStore from "@src/store/Machine.Store";

import { onDestroy, onMount } from "svelte";


let pageListLength;
let currentPageNum;

let subscriptionList = [];

onMount(() => {
    subscriptionList.push(MachineStore.Info.currentPage.subscribe((v) => {
        currentPageNum = v;
    }));
    subscriptionList.push(MachineStore.Info.pages.subscribe((v) => {
        pageListLength = v.length;
    }));
    pageListLength = MachineStore.Info.pages.getValue().length;
    currentPageNum = MachineStore.Info.currentPage.getValue();
});

onDestroy(() => {
    subscriptionList.forEach((v) => v());
});

</script>

<div class="info-page-indicator">
<span class={`info-page-indicator-button ${currentPageNum > 0?'':'disabled'}`} on:click={MachineStore.Info.prevPage}>&larr;</span>
{currentPageNum+1} &Dagger; {pageListLength}
<span class={`info-page-indicator-button ${currentPageNum+1 < pageListLength?'':'disabled'}`} on:click={MachineStore.Info.nextPage}>&rarr;</span>
</div>


<style>
.info-page-indicator-button {
    background-color: #0000008f;
    border-radius: 50%;
    line-height: 100%;
    width: 32px;
    height: 32px;
    margin: 0;
    padding: 0;
    display: inline-block;
    font-size: 32px;
}
.info-page-indicator {
    z-index: 100011;
    position: fixed;
    left: 20%;
    right: 20%;
    font-size: 1.5em;
    bottom: 1.25em;
    background-color: #000000df;
    color: white;
    user-select: none;
    text-align: center;
}
@media (max-width: 720px) {
        .info-page-indicator {
            left: 15%;
            right: 15%;
        }
    }
    @media (max-width: 640px) {
        .info-page-indicator {
            left: 10%;
            right: 10%;
        }
    }
.disabled {
    color: #ffffff7f;
}
</style>
