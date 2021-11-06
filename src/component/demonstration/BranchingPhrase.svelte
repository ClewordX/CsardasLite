<script lang="ts">
import { MACHINE } from "@src/seven/Machine";
import { ConversationBranchingDescriptor } from "@src/store/machine/Conversation.Store";
    
    export let phraseDescriptor: ConversationBranchingDescriptor;

    function branchTo(x: number) {
        MACHINE.goto(x);
    }
    </script>
    

    <div class="conversation-branch">
        {#each phraseDescriptor.choice as ch}
        <div class="conversation-branch-choice" on:click={(e) => branchTo(ch.target)}>
            &RightTriangle; {ch.text}
        </div>
        {/each}
    </div>
    

<style>
    .conversation-branch {
        background-color: #0000007f;
        color: white;
        padding: 0.5em;
    }
    .conversation-branch-choice {
        background-color: #0000009f;
        color: white;
        padding: 0.25em;
        margin: 0.5em;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
    }
    .conversation-branch-choice:hover {
        background-color: white;
        color: black;
    }
</style>