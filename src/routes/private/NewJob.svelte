<script lang="ts">

import { onMount } from 'svelte';
import * as icon from '$lib/icon';
import Modal from '$lib/Modal.svelte';
import {alert} from '$lib/state.svelte';
import {email} from '$lib/util';
	
let { isUpdate = $bindable(),supabase,config,account,profiles} = $props();

let job = $state({customer_id:'',type:'',first_name:'',last_name:'',customer_ref:'',customer_email:''});
let customerIndex:number=$state(0);
let showModal=$state(false);

const updateDb=async():Promise<{isOK:boolean,msg:string}>=>{

    const { data:req,error:ereq } = await supabase.from('jobs').insert(job).select();
    
    console.log(req,ereq);
    if (ereq) return {isOK:false,msg:'error creating order'};
    //else console.log('job inserted',req);

    let prescriptions=config.prescriptions.map((el: any)=>({...el,customer_id:job.customer_id,job_id:req?.[0].id}));
    console.log(prescriptions);
    const { data:pres,error:epres } = await supabase.from('prescriptions').insert(prescriptions).select();
    console.log(pres,epres);

    if (epres) return {isOK:false,msg:'error creating order'};
    

    return {isOK:true,msg:'order created'};
};

const createjob=async():Promise<void>=>{
     if(account.isStaff || account.isAdmin) {   
        job.customer_id=profiles[customerIndex].id;
        job.customer_email=profiles[customerIndex].email;
        job.first_name=profiles[customerIndex].first_name;
        job.last_name=profiles[customerIndex].last_name;
    } else {
        job.customer_id=account.id;
        job.customer_email=account.email;
        job.first_name=account.first_name;
        job.last_name=account.last_name;
    }

    let res =await updateDb();
    console.log(res);
     if(!res.isOK) {
        alert.type='error';
        alert.msg=res.msg;
    } else {
         const content =`
            <p>New order : ${job.type} ${job.customer_ref}</p><p>${job.first_name} ${job.last_name} (${job.customer_email})</p>
            <p>&nbsp;</p>
            <p><a href="https://portal.implantify.eu">Sign in</a> to access this order</p>
            `;

            const response = await fetch('/private/api/admins', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: {'content-type': 'application/json'}
            });
            const cc= await response.json();

          
            let res=await email([job.customer_email,...cc],`New order, ${job.customer_ref} `,content);

            if(!res.isOK) {
                 alert.type='error';
                 alert.msg='order creatd. error emailing staff';
            }

    }

    
    job = {customer_id:'',type:'',first_name:'',last_name:'',customer_ref:'',customer_email:''};
    customerIndex=0;
    showModal=false;

   
    alert.msg=res.msg;
    isUpdate=true;
   

};



$effect(() => {
    if(!showModal) {
        job = {customer_id:'',type:'',first_name:'',last_name:'',customer_ref:'',customer_email:''};
        customerIndex=0;
    }
});




onMount(async() => {
   
    
});

</script>


<button class="button primary icon" onclick={()=>showModal=true}>{@html icon.plusCircle()}&nbsp;Order</button>


{#if showModal}
<Modal bind:showModal>
  {#snippet header()}
  <h3>Create Order</h3>
  {/snippet}
      <p>
 
  <label>Implant Type
      <select name="type" bind:value={job.type}>
          {#each config.types as row}
          <option value={row}>{row}</option>
          {/each}
      </select>
  </label>
  {#if account.isStaff || account.isAdmin}
  <label>Customer
  <select name="customer" bind:value={customerIndex}>
     {#each profiles as profile,profileIndex}
     <option value={profileIndex}>{profile.last_name}, {profile.first_name} {profile.email} </option>
     {/each}
  </select>
</label>
{/if}
<label>Customer Reference
  <input type=text name="ref" bind:value={job.customer_ref}/>
</label>

  </p>

<p>
  <button disabled={job.type==='' || job.customer_ref===''}  onclick={createjob} class="button primary">Create Order</button>
  <button class="button outline" onclick={()=>showModal=false}>Cancel</button>
</p>


</Modal>
{/if}


<style>

</style>