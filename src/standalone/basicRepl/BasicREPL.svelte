<script lang="ts">
import { onDestroy, onMount } from "svelte";


    let editorContent: string = '';
    let replContent: string = '';

    
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
            }
        }
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
</style>