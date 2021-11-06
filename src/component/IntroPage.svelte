<script lang="ts">

    import { SYSTEM_NAME, SYSTEM_VER } from '@src/common/Constants';
    import { push } from 'svelte-spa-router'

    let url: string;

    function handlePreview(e) {
        push(`/preview/direct/data-service?url=${window.encodeURIComponent(url)}`);
    }
</script>


<div class="intropage">
    <div class="intropage-header">
        {SYSTEM_VER}<br />
        CAI System<br />
        <span class="intropage-header-name">"{SYSTEM_NAME.toLocaleUpperCase()}"</span>
    </div>
    

    <div class="intropage-description">This system is clepub-only.</div>

</div>

<style>

    .intropage {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 1em;
        font-family: Didot, 'Noto Serif Display', 'Source Han Serif', 'Times New Roman', Times, serif;
        background-color: #001f0a;
        color: white;
    }
    .intropage-header {
        color: white;
        position: fixed;
        bottom: 1rem;
        left: 1rem;
        font-size: 3rem;

    }
    .intropage-header-name {
        font-size: 10rem;
    }
    .intropage-description {
        font-family: serif;
        font-style: italic;
    }
    @font-face {
        font-family: Didot;
        src: url("../assets/Didot-HTF-L42-Light.ttf");
    }
    @font-face {
        font-family: Didot;
        src: url("../assets/Didot-HTF-L42-Light-Ital.ttf");
        font-style: italic;
    }
    @media (min-width: 640px) {
        .intropage {
            max-width: none;
        }
    }
    
    @media screen and (max-width: 1920px) {
        .intropage-header-name {
            font-size: 10rem !important;
        }
    }
    @media screen and (max-width: 1280px) {
        .intropage-header-name {
            font-size: 8rem !important;
        }
    }
    @media screen and (max-width: 1150px) {
        .intropage-header-name {
            font-size: 7rem !important;
        }
        .intropage-header {
            font-size: 2.5rem !important;
        }
    }
    
</style>
