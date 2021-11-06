<script lang="ts">
    export let message: string = "";
    export let ornament: string = "&crarr;";
    export let onClick: ((e: MouseEvent) => any)|undefined = undefined;
</script>

<span class="ui-enterprompt" on:click={onClick}>
    {message} {@html ornament}
</span>
    
    <style scoped>
    .ui-enterprompt {
        font-size: 1em;
        color: white;
        animation-duration: 3s;
        animation-iteration-count: infinite;
        animation-name: fade-in-out;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
    }
    .ui-enterprompt:hover {
        animation: none;
    }
    @keyframes fade-in-out {
        0% {
            opacity: 0%;
        }
        50% {
            opacity: 100%;
        }
        100% {
            opacity: 0%;
        }
    }
    
    </style>
    