<script lang="ts">
import { onDestroy, onMount } from "svelte";


    let editorContent: string = '';
    let replContent: string = '';
    let actions: {
        title: string,
        callback: any
    }[] = [];

    
    function handleMessage(e: MessageEvent) {
        console.log(e);
        if (e.data.protocol === 'csardas') {
            let z = e.data;
            switch (z.data.command) {
                case 'editor': {
                    editorContent = z.data.data;
                    break;
                }
                case 'repl': {
                    replContent = z.data.data;
                    break;
                }
                case 'actions': {
                    actions = z.data.data.map((v) => ({...v, callback: eval(v.callback)}));
                    break;
                }
            }
        }
    }

    function handleActionByIndex(i: number) {
        actions[i].callback();
    }
    onMount(() => {
        window.addEventListener('message', handleMessage);
        
    });
    
    onDestroy(() => {
        window.removeEventListener('message', handleMessage);
    });
    
</script>

<div id="basic-repl">
    <textarea id="basic-repl-editor" bind:value={editorContent}></textarea>
    <div id="basic-repl-actions">
        {#each actions as action, i}
            <button class="basic-repl-action-item"
                on:click={(e) => handleActionByIndex(i)}
            >{action.title}</button>
        {/each}
        <!-- <button  -->
    </div>
    <textarea id="basic-repl-repl" bind:value={replContent}></textarea>
</div>

<style>
    #basic-repl {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    #basic-repl-editor {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: black;
        border: 0;
        color: white;
        height: 50%;
        width: 100%;
    }
    #basic-repl-actions {
        position: fixed;
        top: 50%;
        height: 1rem;
        width: 100%;
        left: 0;
        right: 0;
        background-color: black;
        color: white;
        padding: 0;
    }
    .basic-repl-action-item {
        border: 0;
        background-color: white;
        color: black;
        margin: 0;
        padding: 0;
        padding-left: 1rem;
        padding-right: 1rem;
        line-height: 1rem;
        border-radius: 0;
    }
    .basic-repl-action-item:hover{
        background-color: black;
        color: white;
    }
    #basic-repl-repl {
        position: fixed;
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        border: 0;
        height: calc(50% - 1rem);
        background-color: black;
        color: white;
        margin: 0;
        border-radius: 0;
        width: 100%;
    }
</style>