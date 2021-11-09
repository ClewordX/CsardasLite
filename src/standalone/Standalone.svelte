<script lang="ts">
import BasicRepl from "./basicRepl/BasicREPL.svelte";
import Katex from "./katex/Katex.svelte";

    export let params: any;

console.log(params);
</script>


{#if params.componentName === 'katex'}
<Katex />
{:else if params.componentName === 'basic-repl'}
<BasicRepl />
{/if}
