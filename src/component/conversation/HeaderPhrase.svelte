<script lang="ts">
import { ConversationHeaderDescriptor } from "@src/store/machine/Conversation.Store";


    
    
        export let phraseDescriptor: ConversationHeaderDescriptor;
    </script>
    
    {#if phraseDescriptor.level === 1}
    <h1>{phraseDescriptor.text}</h1>
    {:else if phraseDescriptor.level === 2}
    <h2>{phraseDescriptor.text}</h2>
    {:else if phraseDescriptor.level === 3}
    <h3>{phraseDescriptor.text}</h3>
    {/if}
    
    
    <style>
    </style>
    