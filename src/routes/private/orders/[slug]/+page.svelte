<script lang="ts">
import { invalidate ,goto} from '$app/navigation';
import { onMount } from 'svelte';

import * as icon from '$lib/icon';
import {toSimpleDate} from '$lib/util';

import Modal from '$lib/Modal.svelte';

let { data } = $props();
let { account,profiles,supabase,job,fileList,job_data} = $derived(data);

let showModal : boolean = $state(true);
let isUpdate : boolean  = $state(false);

let isMessage : boolean = $state(false);

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

const openMessages=()=>{
    isMessage=true;
    showModal=true;
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


{#if isMessage && showModal}
    <Modal bind:showModal>
    {#snippet header()}
    <h3>{job.customer_ref}</h3>
    {/snippet} 

    {#each job.transactions as row,rowIndex}
    <div class="msg">
        <div class="row">
             <div class="col"><span class="">{row.log==='file' ? row.file_name : row.log}</span></div>  
        </div>
        <div class="row">
            <div class="col"><span class="small">{toSimpleDate(row.created_at)}</span></div>
            <div class="col"><span class="small">{row.user_email}</span></div>    
        </div>
    </div>    
    {/each}

    </Modal>

{/if}



<div class="row">
     <div class="col">
        {job.type} <i>{job.customer_ref}</i>
     </div>
     <div class="col is-right">
        <button class="button primary icon" onclick={openMessages}>{@html icon.messageCircle()}&nbsp;Messages</button>
    </div>
</div> 	

{#each job_data as row,rowIndex}
	<div class="wrapper">
		<div class={row.level===2 ? 'title-box title-completed' : row.level===1 ? 'title-box title-progress' : 'title-box'}><div class="title">{row.type}</div></div>
		<div class="content-wrapper">
			<div class="content">
               
                <div class="row">
                  
                    <div class="col-3">
                        {#if row.type==='prescription'}

                            {#if job.levels[rowIndex]===0}
                                 <a href={`/private/prescriptions/${job.id}`}><span class="strong">{@html icon.edit()}&nbsp;EDIT</span></a>
                            {/if}
                            {#if job.levels[rowIndex]===1}
                                 <a href={'javascript:void(0)'}><span class="strong">{@html icon.checkCircle()}&nbsp;APPROVE</span></a>
                            {/if}
                            
                            {#if job.levels[rowIndex]===2}
                                $nbsp;
                            {/if}
                        


                            
                        {:else if row.type==='manufacture'}
                            
                            {#if job.levels[rowIndex]===0}
                                <a href={'javascript:void(0)'}><span class="strong">{@html icon.play()}PRODUCTION</span></a>
                            {/if}
                            {#if job.levels[rowIndex]===1}
                                 <a href={'javascript:void(0)'}><span class="strong">{@html icon.truck()}&nbsp;SHIP</span></a>
                            {/if}
                            
                            {#if job.levels[rowIndex]===2}
                                &nbsp;
                            {/if}
                            
                             
                        {:else}
                            {#if job.levels[rowIndex]===0}
                                <a href={'javascript:void(0)'}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                            {/if}
                            {#if job.levels[rowIndex]===1}
                                <a href={'javascript:void(0)'}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>&nbsp;
                                <a href={'javascript:void(0)'}><span class="strong">{@html icon.checkCircle()}&nbsp;APPROVE</span></a>
                            {/if}
                            {#if job.levels[rowIndex]===2}
                                <a href={'javascript:void(0)'}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                            {/if}
                             
                        {/if}
                       
                    </div>
                      <div class="col-9">
                         {#each row.files as f,fIndex}
                                <a href={'javascript:void(0)'}>{@html icon.trash()}</a>&nbsp;&nbsp;&nbsp;
                                <a href={'javascript:void(0)'}  onclick={()=>download(f.name)}>{@html icon.download()} {f.name}</a> <span class="tag is small">{toSimpleDate(f.created_at)}</span>
                          <br/>
                        {/each}
                    </div>
                </div>
                       
                   
            
                      
                
				
			
			
			</div>
          
		</div>
        
		
	</div>
	<p></p>


{/each}


	
	
 


<style>

.msg {
     padding: 0.5rem 0.5rem;
     margin-bottom:1rem;
     border:1px solid var(--color-lightGrey);
     border-radius: 4px;
   
}

.strong {
    font-weight:500;
}

.small {
    padding: 0.4rem;
    font-size: 1rem;
}

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
/*   height:15rem; */
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







</style>
