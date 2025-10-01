<script lang="ts">
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import '../app.css';

	import * as icon from '$lib/icon';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte'
	import Alert from '$lib/Alert.svelte';
	let { data, children } = $props()
	let { session, supabase } = $derived(data)

	


	$effect(()=>{
	//console.log(session);
});

onMount(() => {

	console.log('/+layout.svelte');
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })
    return () => data.subscription.unsubscribe()
})

</script>
<Alert></Alert>
<div class="app">
	{#key session}
	<Header bind:session/>
	{/key}


	<main>
		<div class="container">
			{@render children()}
		</div>
		
	</main>

	<Footer />

	
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background:white;
	}




	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 7rem auto;
		box-sizing: border-box;
		font-size:1.6rem;
		
	}

	

	
</style>
