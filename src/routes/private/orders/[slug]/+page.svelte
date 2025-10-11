<script lang="ts">
import { invalidate ,goto} from '$app/navigation';
import { onMount } from 'svelte';
import {getAdminEmails,email,addTransaction,updateLevel} from '$lib/util';
import * as icon from '$lib/icon';
import {toSimpleDate} from '$lib/util';
import {alert} from '$lib/state.svelte.js';

import Modal from '$lib/Modal.svelte';

let { data } = $props();
let { account,profiles,supabase,job,fileList,job_data,config} = $derived(data);

let showModal : boolean = $state(true);
let isUpdate : boolean  = $state(false);

let isMessage : boolean = $state(false);
let isDelete : boolean = $state(false);
let deleteType : string = $state('');
let deleteName : string=$state('');

let logText:string=$state('');
let deleteText:string=$state('');

interface Transaction {
			id?:number,
			job_id:number,
			customer_id:string,
			user_email:string,
			created_at?:string,
			file_name:string,
			is_new:boolean,
			type:string,
			log:string
		};


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

const openDelete=(fileName:string,type:string)=>{
    deleteName=fileName;
    deleteType=type;
    isDelete=true;
    showModal=true;
};

const openMessages=()=>{
    isMessage=true;
    showModal=true;
};

const removeFile=async()=>{
    console.log('deleting file...',deleteName);
    const { data, error } = await supabase.storage.from('order-files')
        .remove([`${job.customer_id}/${deleteName}`]);
    console.log(data,error);
    if(error) {
        alert.type='error';
        alert.msg='error deleting file';
    } else {
         	let x:Transaction={
			customer_id:job.customer_id,
			type:deleteType,
			log:`deleted file ${deleteName}`,
			user_email:String(account.email),
			job_id:job.id,
			is_new:true,
			file_name:deleteName
		};

        console.log(x);

		let res=await addTransaction(supabase,x,job.type,job.customer_email);
      

        let f=job_data.findIndex(el=>el.type===deleteType);
        let count=f>-1 && job_data[f].files?.length ? job_data[f].files.length : 0;
        if(count<2) {
            console.log('removing last file, returning status level to 0');
             await updateLevel(supabase,config.stages,job.id,deleteType,0);
        } else {
            console.log('other files exist, keep status at level 1');
             await updateLevel(supabase,config.stages,job.id,deleteType,1);
        }
      
    

    }

    invalidate('supabase:db:jobs');

        

    deleteName='';
    deleteText='';
    isDelete=false;
    showModal=false;
};

let addMsg=async()=>{
    
    	

		let x:Transaction={
			customer_id:job.customer_id,
			type:'message',
			log:logText,
			user_email:String(account.email),
			job_id:job.id,
			is_new:true,
			file_name:''
		};

        console.log(x);

		let res=await addTransaction(supabase,x,job.type,job.customer_email);
    

    
        logText='';
        isMessage=false;
        showModal=false;
        isUpdate=true;
};

$effect(() => {
     if(isUpdate) {
		isUpdate=false;
		invalidate('supabase:db:jobs');
	 }

     if(isMessage && !showModal) {
        console.log('clear new activity ....');

        (async () => {
            const { data,error} = await supabase.from('transactions').update({is_new:false}).eq('job_id',job.id);
            if(error) {
                    alert.type='error';
                    alert.msg='error - failed to update transactions';
            }

        })();

    
     }
});


onMount(async() => {
    console.log(job_data,job);
    if(job.transactions.reduce((acc: number,curr: { is_new: any; })=>curr.is_new ? acc+1 : acc,0)>0) openMessages();
    

   
});










</script>

<svelte:head>
	<title>Orders</title>
	<meta name="description" content="Implantify" />
</svelte:head>




{#if isDelete && showModal}
   <Modal bind:showModal>
  {#snippet header()}
  <h3>Delete File</h3>
  {/snippet}
  <p>Deleting a file will reset status so approval will still be required to progress.</p>
  <p>You can upload more files.</p>
  <p>Type <span class="strong text-error">delete {deleteType}</span> to confirm</p>
 <p>
    <input type=text bind:value={deleteText}/>
</p><p>
     <button disabled={deleteText!==`delete ${deleteType}`} class="button error" onclick={removeFile}>Delete</button>
     <button class="button outline" onclick={()=>showModal=false}>Cancel</button>
</p>


</Modal>
{/if}


{#if isMessage && showModal}
    <Modal bind:showModal>
    {#snippet header()}
    <h3>Activity Log</h3>
    {/snippet} 
    <p><textarea rows="4" bind:value={logText}></textarea></p>
    <p><button class="button primary icon"onclick={addMsg}>{@html icon.send()}&nbsp;Send</button></p>
    <div class="msg-wrapper">
    {#each job.transactions as row,rowIndex}
    <div class="msg">
        <div class="row">
             <div class="col small"><b>{row.type}</b></div>  
        </div>
        <div class="row">
             <div class="col small"><span class="">{row.log==='file' ? row.file_name : row.log}</span></div>  
        </div>
        <div class="row">
            <div class="col"><span class="small">{toSimpleDate(row.created_at)}</span></div>
            <div class="col"><span class="small">{row.user_email}</span></div>    
        </div>
    </div>    
    {/each}
    </div>
    <p><button class="button outline" onclick={()=>showModal=false}>Close</button></p>

    </Modal>

{/if}



<div class="row">
     <div class="col">
        {job.type} <i>{job.customer_ref}</i>
     </div>
     <div class="col is-right">
        <button class="button primary icon" onclick={openMessages}>{@html icon.messageCircle()}&nbsp;Activity Log</button>
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
                                <a href={'javascript:void(0)'}><span class="strong">{@html icon.play()}PRODUCE</span></a>
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
                                <a href={'javascript:void(0)'} onclick={()=>openDelete(f.name,row.type)}>{@html icon.trash()}</a>&nbsp;&nbsp;&nbsp;
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

.msg-wrapper {
    overflow-x:hidden;
    overflow-y:auto;
    max-height:60%;
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
