<script lang="ts">
import { invalidate ,goto} from '$app/navigation';
import { onMount } from 'svelte';

import * as icon from '$lib/icon';

let { data } = $props();
let { account,profiles,supabase,job,fileList,job_data} = $derived(data);

let showModal : boolean = $state(true);
let isUpdate : boolean  = $state(false);


const download=async(fn:string)=>{
    let t=Date.now();
    //console.log('supabase download started',t/1000);
    const { data } = await supabase.storage
    .from('order-files')
    .createSignedUrl(`${job.customer_id}/${fn}`,120, {
        download: true,
    });
    //console.log('supabase download finished',Date.now()/1000-t/1000,data);
    if(data) {


		let a = document.createElement('a');
		a.href = data.signedUrl.toString();
		a.download = fn;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
     
	}
};

$effect(() => {
     if(isUpdate) {
		isUpdate=false;
		invalidate('supabase:db:reqests');
	 }
});


onMount(async() => {
  console.log(job_data);
   
   
});










</script>

<svelte:head>
	<title>Orders</title>
	<meta name="description" content="Implantify" />
</svelte:head>

<div class="row">
   
     <div class="col is-right">
        <button class="button primary icon">{@html icon.messageCircle()}&nbsp;Messages</button>
    </div>
</div> 	

{#each job_data as row,rowIndex}
	<div class="wrapper">
		<div class={row.level===2 ? 'title-box title-completed' : row.level===1 ? 'title-box title-progress' : 'title-box'}><div class="title">{row.type}</div></div>
		<div class="content-wrapper">
			<div class="content">
			
				<div>
					{#each row.files as f,fIndex}
						<p class="small">
							 <a href={'javascript:void(0)'}  onclick={()=>download(f.name)}>{@html icon.download(10)} {f.name}</a>
        
						</p>
					{/each}
				</div>
			
			
			</div>
		</div>
		
	</div>
	<p></p>


{/each}


	
	
 


<style>


.wrapper {
	display:flex;
	flex-direction:row;
	margin:0;
	padding:0;
	align-content: space-between;
   
}

.title-box {
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
	border:1px solid var(--color-red);
	background: var(--color-red);
	color:#fff;
}

.title-progress {
	border:1px solid var(--color-amber);
	background: var(--color-amber);
}

.title-completed {
	border:1px solid var(--color-green);
	background: var(--color-green);
}

.title {
	writing-mode: vertical-rl;
   text-orientation: mixed;
   text-transform:uppercase;
   height:15rem;
   padding:1rem;
	align-content: center;
}

.content-wrapper {
	border-top:1px solid var(--color-grey);
	border-bottom:1px solid var(--color-grey);
	border-right:1px solid var(--color-grey);
	flex-grow:1;
	padding:1rem;
	border-top-right-radius: 4px;
	border-bottom-right-radius: 4px;

	
}

.content {
	display:flex;
	height:100%;
	flex-direction:column;
	justify-content: space-between;
}

.latest {
	max-height:5rem;
	overflow:hidden;
	font-size:1rem;
}

.small {
	font-size:1rem;
}


.strong {
	font-weight:500;
}

.upper {
	text-transform: uppercase;
}





</style>
