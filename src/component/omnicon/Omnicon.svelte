<script lang="ts">
import { SYSTEM_NAME, SYSTEM_VER } from "@src/common/Constants";
import { GlobalLoadCourseData, RetrieveDocument, RetrieveEntryDocument } from "@src/seven/Common";
import { onDestroy, onMount } from "svelte";
import { Unsubscriber } from "svelte/store";
import OmniconStore, { TOmniconMenuItem } from "./Omnicon.Store";



    let isMenuShown: boolean = false;
    let isDragged: boolean = false;

    let customMenuItemList: TOmniconMenuItem[] = [];
    let subscriptionList: Unsubscriber[] = [];

    let element;
    let menuElement;
    let mouseX = 0;
    let mouseY = 0;
    function mouseDownHandler(e) {
        mouseX = element.clientX;
        mouseY = element.clientY;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }
    function mouseMoveHandler(e) {
        let dx = e.clientX - mouseX;
        let dy = e.clientY - mouseY;
        element.style.top = `${element.offsetTop + dy}px`;
        element.style.left = `${element.offsetLeft + dx}px`;
        menuElement.style.top = `${element.offsetTop + dy}px`;
        menuElement.style.left = `${element.offsetLeft + dx+32}px`;
        mouseX = e.clientX;
        mouseY = e.clientY;
        isDragged = true;
    }
    function mouseUpHandler(e) {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        e.preventDefault();
    }
    
    function handleClick(e: MouseEvent) {
        
        if (!isDragged) {
            isMenuShown = !isMenuShown;
        } else {
            isDragged = false;
        }
    }
    
    

    function handleResetOmniconPosition() {
        element.style.top = `1rem`;
        element.style.left = `1rem`;
        menuElement.style.top = `1rem`;
        menuElement.style.left = `calc(1rem + 32px)`;
        isMenuShown = false;
    }

    let isShowingPage: boolean = false;
    let pageHTMLContent: string = '';

    function handleReturnToMenu() {
        isShowingPage = false;
    }

    function handleShowAboutPage() {
        pageHTMLContent = `
        ${SYSTEM_NAME} ${SYSTEM_VER}<br />
        &copy; Sebastian Higgins 2021<br />
        `;
        isShowingPage = true;
    }

    function handleRestart() {
        try {
            GlobalLoadCourseData(RetrieveEntryDocument());
        } catch {
            pageHTMLContent = `
            似乎并没有加载任何文档。<br />
            `;
            isShowingPage = true;
            setTimeout(() => {
                isShowingPage = false;
            }, 3000);
        }
        isMenuShown = false;
    }

onMount(() => {
    element.style.top = `1rem`;
    element.style.left = `1rem`;
    menuElement.style.top = `1rem`;
    menuElement.style.left = `calc(1rem + 32px)`;

    subscriptionList.push(OmniconStore.currentCustomOmniconMenu.subscribe((v) => {
        console.log(`x`, v);
        customMenuItemList = v;
    }));
});

onDestroy(() => {
    subscriptionList.forEach((v) => v());
});
</script>

<div id="clite-omnicon" bind:this={element}
    on:mousedown={mouseDownHandler}
    on:click={handleClick}
>&#10086;</div>
<div id="clite-omnicon-menu" class={`clite-omnicon-menu-${isMenuShown?'visible':'hidden'}`}
    bind:this={menuElement}
>
    {#if isShowingPage}
    <span on:click={handleReturnToMenu}>&larr; 返回</span><br />
    <div id="clite-omnicon-menu-page-container">    
        {@html pageHTMLContent}
    </div>
    {:else}
    <div class="clite-omnicon-menu-item" on:click={handleShowAboutPage}>关于学习系统</div>
    <div class="clite-omnicon-menu-item" on:click={handleRestart}>返回课程主页</div>
    <div class="clite-omnicon-menu-item" on:click={handleResetOmniconPosition}>重置Omnicon位置</div>
        {#if customMenuItemList.length > 0}
            <hr />
            {#each customMenuItemList as customMenuItem}
                <div class="clite-omnicon-menu-item"
                    on:click={(e) => customMenuItem.callback(element, menuElement, e)}
                >{customMenuItem.title}</div>
            {/each}
        {/if}
    {/if}
</div>


<style>
#clite-omnicon {
    position: fixed;
    z-index: 200000;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    background-color: #001f0a;
    border: 1px white solid;
    font-size: 24px;
    line-height: 1em;
    font-family: Didot;
    color: white;
    user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
}
#clite-omnicon-menu {
    position: fixed;
    z-index: 200000;
    max-width: 20rem;
    padding: 0.5rem;
    background: #0000009f;
    color: white;
}
.clite-omnicon-menu-hidden {
    visibility: hidden;
}
.clite-omnicon-menu-item {
    user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
}
.clite-omnicon-menu-item:hover {
    background-color: white;
    color: black;
}
#clite-omnicon-menu-page-container {
    margin-top: 1rem;
    font-family:'Times New Roman', Times, serif;

}
</style>

