<script lang="ts">

    import Main from './Main.svelte';
    import * as yaml from 'js-yaml';
    import { jit } from '@src/jit/JIT';
    import { MACHINE } from '@src/seven/Machine';
    import { onDestroy, onMount } from 'svelte';
    import SystemStateStore, { SystemCurrentStatus } from '@src/store/SystemState.Store';
import SystemErrorStore from '@src/store/SystemError.Store';

    // editor.
    let mouseX = 0;
    let mouseY = 0;
    let editorX;
    let editorY;
    let editorVisible = false;
    let elemJitOutput;
    let elemEditor;
    let elemEditorContainer;

    function toggleEditor() {
        editorVisible = !editorVisible;
    }
    
    function mockSourceChange(e) {
        elemJitOutput.value = JSON.stringify(yaml.load(e.target.value), undefined, '    ');
    }

    function loadMockProgram() {
        SystemStateStore.notReady();
        try {
            let jitted = jit(yaml.load(elemEditor.value));
            MACHINE.loadProgram(jitted);
            MACHINE.unlock();
            SystemStateStore.ready();
            MACHINE.step();
        } catch (e) {
            SystemStateStore.currentStatus.set(SystemCurrentStatus.ERROR);
            SystemErrorStore.error('Error while loading data.', e.message);
        }
    }

    function globalKeyHandler(e: KeyboardEvent) {
        if (elemEditor && e.target === elemEditor) { return; }
        toggleEditor();
    }

    onMount(() => {
        document.addEventListener('keypress', globalKeyHandler);
    });
    onDestroy(() => {
        document.removeEventListener('keypress', globalKeyHandler);
    });

    function mouseDownHandler(e) {
        mouseX = elemEditorContainer.clientX;
        mouseY = elemEditorContainer.clientY;

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }
    function mouseMoveHandler(e) {
        let dx = e.clientX - mouseX;
        let dy = e.clientY - mouseY;
        elemEditorContainer.style.top = `${elemEditorContainer.offsetTop + dy}px`;
        elemEditorContainer.style.left = `${elemEditorContainer.offsetLeft + dx}px`;
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
    function mouseUpHandler(e) {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }

</script>
<div class="mock">
    <Main />
    <div bind:this={elemEditorContainer} class="mock-editor-container" style={`visibility:${editorVisible?'visible':'hidden'}`}>
        <div class="mock-editor-toolbar">
            <span on:click={loadMockProgram}>Load</span>
            <div class="mock-editor-actionbar">
                <span on:mousedown={mouseDownHandler}>&ocir;</span>
                <span on:click={toggleEditor}>&Cross;</span>
            </div>
        </div>
        <div class="mock-editor-container-inside">
            <textarea class="mock-editor" id="mock-editor" wrap="off" bind:this={elemEditor} on:change={mockSourceChange}></textarea>
            <textarea class="mock-editor" id="mock-jit-output" wrap="off" bind:this={elemJitOutput}></textarea>
        </div>
    </div>
</div>

<style>
    .mock-editor-container {
        z-index: 900000010;
        position: fixed;
        width: 700px;
        height: 500px;
        bottom: 1em;
        right: 1em;
    }
    .mock-editor-toolbar {
        height: 1.5em;
        margin: 0;
        background-color: black;
        color: white;
        user-select: none;
    }
    .mock-editor-actionbar {
        float: right;
    }
    .mock-editor-container-inside {
        margin: 0;
        height: calc(100% - 1.5em);
    }
    .mock-editor {
        border: 0;
        margin: 0;
        font-family: monospace;
        scrollbar-color: white black;
        border-radius: 0;
    }
    #mock-editor {
        width: 50%;
        height: 100%;
        background-color: #0000009F;
        color: white;
        float: left;
    }
    #mock-jit-output {
        float: left;
        width: 50%;
        height: 100%;
        background-color: #000000EF;
        color: white;
        font-family: monospace;
    }
</style>
