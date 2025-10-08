<script lang="ts">
import { onMount } from 'svelte';
import {capitalize} from '$lib/util';
import Denture from '$lib/Denture.svelte';
import {alert} from '$lib/state.svelte.js';
import Modal from '$lib/Modal.svelte';
//import Submit from './Submit.svelte';

let { data } = $props();
let { account,profiles,supabase,config,job} = $derived(data);

interface Prescription {
    id:number,
    job_id:number,
    customer_id:string,
    created_at:string,
    section:string,
    item:string,
    sort:number,
    choice:string,
    denture:{i:string,l:string,q:string,r:boolean}[]
}
let prescriptions:Prescription[]=$state([]);

let showModal:boolean = $state(true);
let isSubmit:boolean=$state(false);

const lock=()=>{
	isSubmit=true;
	showModal=true;
};


const store=async(index:number)=>{
    console.log('store',prescriptions[index].item,prescriptions[index].id,prescriptions[index].choice);
    const {error} = await supabase.from('prescriptions').update({ choice:prescriptions[index].choice }).eq('id', prescriptions[index].id);
	if(error) {
        alert.type='error';
        alert.msg=`Error storing ${capitalize(prescriptions[index].item.replaceAll('_',' '))}`;
    }		
};


onMount(async() => {
   console.log('job',job);
  
  
   
   prescriptions=job.prescriptions.map((el: any)=>({...el}))
    .sort((a: { section: any; sort: number; },b: { section: string; sort: number; })=>b.section.localeCompare(a.section) || a.sort-b.sort);

    let f=prescriptions.findIndex(el=>el.item==='implant_type');
    if(f>-1) prescriptions[f].choice=job.type;
   
    //for(let item of prescriptions) console.log(item.section,item);
});



</script>

{#if showModal && !isSubmit}
    <Modal bind:showModal>
    {#snippet header()}
    <h3>Patient Prescriptions</h3>
    {/snippet} 

	<p>Prescriptions are <b>automatically saved</b> as you enter data.</p>
	
	<p>Use <button disabled class="button primary">Lock & Create Final PDF</button> when you are ready to submit it as a PDF for the Implantify team.</p> 
	
	<p><button class="button outline" onclick={()=>showModal=false}>Close</button></p>

    </Modal>

{/if}



{#if showModal && isSubmit}
	<Modal bind:showModal>
    {#snippet header()}
    <h3>Lock & Create PDF</h3>
    {/snippet} 

	<p>Create a PDF when you have completed the prescription.</p>
	<p><button class="button outline" onclick={()=>showModal=false}>Cancel</button></p>
    </Modal>
{/if}

<div class="row">
	<div class="col">
		   {job.type} <i>{job.customer_ref}</i>
	</div>


</div>

<p>
	<a href={`/private/orders/${job.id}`} class="button outline">Back</a>
	<button class="button primary"  onclick={lock}>Lock & Create Final PDF</button>
</p>
<div class="row">
    <div class="col">
        <h4>Surgeon</h4>
        {#each prescriptions as row,rowIndex}
            {#if row.section==='surgeon'}
            <label>{#if row.item==='code'}Postal/ZIP Code{:else}{capitalize(row.item.replaceAll('_',' '))}{/if}
            {#if row.item!=='country'}
            <input type=text bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {:else}
                 <select bind:value={row.choice} onchange={()=>store(rowIndex)}>
                {#each config.countries.sort() as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
            {/if}
            </label>
            {/if}
        {/each}
    </div>

     <div class="col">
        <h4>Patient</h4>
         {#each prescriptions as row,rowIndex}
            {#if row.section==='patient'}
            <label>{capitalize(row.item.replaceAll('_',' '))}
            {#if row.item.includes('notes')}
              <textarea rows=5 bind:value={row.choice} onblur={()=>store(rowIndex)}></textarea>
           
            {:else if row.item.includes('date')}
             <input type=date bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {:else}
               <input type=text bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {/if}
            </label>
            {/if}
        {/each}
    </div>
</div>
<div class="row">
    <div class="col">
        <h4>Device</h4>
          {#each prescriptions as row,rowIndex}
             {#if row.section==='device'}
            <label>{capitalize(row.item.replaceAll('_',' '))}
            {#if row.item.includes('notes')}
             <textarea rows=5 bind:value={row.choice} onblur={()=>store(rowIndex)}></textarea>
            {:else if row.item==='implant_type'}
               <input disabled type=text bind:value={row.choice}/>
            {:else if row.item==='surface_type'}
                 <select bind:value={row.choice} onchange={()=>store(rowIndex)} >
                {#each ['Mirror','Sandblasted','Anodized'] as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
            {:else if row.item.includes('dentition_type')}
             <select bind:value={row.choice} onchange={()=>store(rowIndex)}>
                {#each ['Provisional Dentition','Definitive Dentition'] as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
            {:else}
               <input type=text bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {/if}
            </label>
            {/if}
        {/each}
    </div>

     <div class="col">
        <h4>Denture</h4>
         {#each prescriptions as row,rowIndex}
             {#if row.section==='denture'}
            <label>{capitalize(row.item.replaceAll('_',' '))}
            {#if row.item==='denture'}
      
             <Denture bind:denture={row.denture} cfg={config.denture} supabase={supabase} prescription_id={row.id}></Denture>
              
            {:else if row.item==='denture_shade'}
             <select bind:value={row.choice} onchange={()=>store(rowIndex)}>
                {#each config.denture_shades as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
            {:else if row.item.includes('notes')}
                 <textarea rows=5 bind:value={row.choice} onblur={()=>store(rowIndex)}></textarea>
            {:else}
                <input type=text bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {/if}
            </label>
            {/if}
        {/each}
    </div>
</div>
<p>
	<a href={`/private/orders/${job.id}`} class="button outline">Back</a>
	<button class="button primary" onclick={lock}>Lock & Create Final PDF</button>
</p>




<style>

</style>