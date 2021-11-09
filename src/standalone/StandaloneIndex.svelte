<script lang="ts">
import { SYSTEM_NAME, SYSTEM_VER } from "@src/common/Constants";




</script>

<div id="standalone-index">
    <div id="standalone-index-description">
        <p>You just reached the index page for standalone mode components of Csárdás Lite.</p>
        <p>Standalone mode components are a series of component that's meant to be embedded with iframes.
            Documents rendered with the CAI system can use them in a plug-and-play manner; this allows
            much more flexibility compared to CAI systems where one can only use the ones provided alongside
            with the main system.
        </p>
    </div>

    <div class="standalone-index-header">
        {SYSTEM_VER}<br />
        CAI System - Standalone Mode Components<br />
        <span class="standalone-index-header-name">"{SYSTEM_NAME.toLocaleUpperCase()}"</span>
    </div>

</div>


<style>

    #standalone-index {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 1em;
        font-family: Didot, 'Noto Serif Display', 'Source Han Serif', 'Times New Roman', Times, serif;
        background-color: black;
        color: white;
    }
    .standalone-index-header {
        color: white;
        position: fixed;
        bottom: 1rem;
        left: 1rem;
        font-size: 3rem;

    }
    .standalone-index-header-name {
        font-size: 10rem;
    }
    #standalone-index-description {
        z-index: 100020;
        position: fixed;
        top: 2rem;
        left: 2rem;
        /* background-color: #0000008f; */
        color: white;
        padding: 1rem;
        font-family: 'Times New Roman', Times, serif;
    }
    :global(#standalone-index-description a) {
        color: white;
        text-decoration: underline;
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
        #standalone-index {
            max-width: none;
        }
    }
    
    @media screen and (max-width: 1920px) {
        .standalone-index-header-name {
            font-size: 10rem !important;
        }
    }
    @media screen and (max-width: 1280px) {
        .standalone-index-header-name {
            font-size: 8rem !important;
        }
    }
    @media screen and (max-width: 1150px) {
        .standalone-index-header-name {
            font-size: 7rem !important;
        }
        .standalone-index-header {
            font-size: 2.5rem !important;
        }
    }
    
</style>
