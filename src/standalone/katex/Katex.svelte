<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    
    let data: any;
    let katexContainer: HTMLElement;
    
    function handleMessage(e: MessageEvent) {
        console.log(e);
        if (e.data.protocol === 'csardas') {
            let z = e.data;
            switch (z.data.command) {
                case 'render': {
                    (window as any).katex.render(z.data.data, katexContainer);
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
    
    
    <svelte:head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.min.css" integrity="sha384-RZU/ijkSsFbcmivfdRBQDtwuwVqK7GMOw6IMvKyeWL2K5UAlyp6WonmB8m7Jd0Hn" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.min.js" integrity="sha384-pK1WpvzWVBQiP0/GjnvRxV4mOb0oxFuyRxJlk6vVw146n3egcN5C925NCP7a7BY8" crossorigin="anonymous"></script>
    </svelte:head>
    
    <div id="katex">
        <div id="katex-content" bind:this={katexContainer}>
        </div>
    </div>
    
    
    <style>
        #katex-content {
            position: fixed;
            z-index: 100010;
            font-size: 200%;
            bottom: auto;
            text-align: center;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    </style>
    
