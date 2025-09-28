<script lang="ts">
import { json } from '@sveltejs/kit';

let headers= {
    'Access-Control-Request-Headers': '*',
    'Content-Type': 'application/json'
};

let body={name:'Leia'};

let test=async()=>{

	 let response = await fetch('hooks/quotation',{method: 'POST',headers: headers,body:JSON.stringify(body)});
	 let res=await response.json();
	 console.log('returned ...',res);
    
};

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>


<p>Hello from sveltekit!</p>
<p><button onclick={test}>Test</button></p>
<style>
	
</style>
