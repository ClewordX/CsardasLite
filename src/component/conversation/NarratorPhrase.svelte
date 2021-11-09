<script lang="ts">

import * as Marked from "marked";
    export let phraseDescriptor;

</script>

<!-- gotta go semantical guys -->
<p class="narrator-phrase">
    {@html Marked.parseInline(phraseDescriptor.text)}
</p>

<style>
    .narrator-phrase {
        background-color: #000000cd;
        font-size: 0.95rem;
        padding: 0.45rem;
        position: relative;
    }
    :global(.narrator-phrase a) {
        color: white;
        text-decoration: underline;
    }
</style>
