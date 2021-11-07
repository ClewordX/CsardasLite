<script lang="ts">


    export let phraseDescriptor;
</script>

<!-- gotta go semantical guys -->
<p class="narrator-phrase">
    {phraseDescriptor.text}
</p>

<style>
    .narrator-phrase {
        background-color: #000000cd;
        font-size: 0.95em;
        padding: 0.45em;
        position: relative;
    }
</style>
