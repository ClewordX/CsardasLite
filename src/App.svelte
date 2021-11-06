<script lang="ts">
import Router from 'svelte-spa-router';
import Main from './component/Main.svelte';
import DebugMain from './component/DebugMain.svelte';
import IntroPage from './component/IntroPage.svelte';
import ErrorScreen from './component/ErrorScreen.svelte';
import WaitingScreen from './component/WaitingScreen.svelte';


const routes = {
	'/': IntroPage,
	'/Main': Main,
	'/Debug': DebugMain,
	'/Error': ErrorScreen,
	'/Waiting': WaitingScreen,
}
</script>

<Router {routes} />

<style>
</style>