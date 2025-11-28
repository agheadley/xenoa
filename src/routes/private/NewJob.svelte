<script lang="ts">

import { onMount } from 'svelte';
import * as icon from '$lib/icon';
import Modal from '$lib/Modal.svelte';
import {alert} from '$lib/state.svelte';
import {addTransaction,getCustomers,email} from '$lib/util';
	
let { isUpdate = $bindable(),supabase,config,account,profiles} = $props();

let job = $state({customer_id:'',type:'',first_name:'',last_name:'',customer_ref:'',customer_email:''});

let newId:number = $state(0);

let customerIndex:number=$state(0);
let showModal=$state(false);


let customers:{id:string,email:string,first_name:string,last_name:string}[]=$state([]);

const updateDb=async():Promise<{isOK:boolean,msg:string}>=>{

    console.log(job);
    const { data:req,error:ereq } = await supabase.from('jobs').insert(job).select();
    console.log(req,ereq);

    if (ereq) return {isOK:false,msg:'error creating order'};
    newId = req?.[0]?.id ? req[0].id : 0;

    let prescriptions=config.prescriptions.map((el: any)=>({...el,customer_id:req?.[0].customer_id,job_id:req?.[0].id}));
    console.log(prescriptions);
    const { data:pres,error:epres } = await supabase.from('prescriptions').insert(prescriptions).select();
    console.log(pres,epres);

    if (epres) return {isOK:false,msg:'error creating order'};
    

    return {isOK:true,msg:'order created'};
};

const createjob=async():Promise<void>=>{

    showModal=false;

     console.log(customers[customerIndex]);

     if(account.isStaff || account.isAdmin) {   
        job.customer_id=customers[customerIndex].id;
        job.customer_email=customers[customerIndex].email;
        job.first_name=customers[customerIndex].first_name;
        job.last_name=customers[customerIndex].last_name;
    } else {
        job.customer_id=account.id;
        job.customer_email=account.email;
        job.first_name=account.first_name;
        job.last_name=account.last_name;
    }

    console.log(job);


    let res =await updateDb();
    console.log(res);
     if(!res.isOK) {
        alert.type='error';
        alert.msg=res.msg;
    } else {

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

        
        let x:Transaction={
            job_id:newId,
            customer_id:job.customer_id,
            user_email:account.email,
            file_name:'',
            is_new:true,
            type:'order',
            log:'New order received'
        };

       
        let html=`
        <p></p>
        <p>New Order Created</p>
        <p>${job.first_name} ${job.last_name} ${job.customer_email}</p>
        <p></p>
        <p>Order <b>${job.type}</b></p>
        <p>Customer Reference <b>${job.customer_ref}</b></p>
        <p></p>
        <p>You will need to complete the prescription and upload scan(s). Please sign in to view advice on required scans.</p>
        <p></p>
        `;
        
        let res=await addTransaction(supabase,x);
        let res2=await email(job.customer_email,'Implantify - New Order',html,true);
       
       
       
        customerIndex=0;
    
    }

    
   

    isUpdate=true;
   

};



$effect(() => {
    
});




onMount(async() => {
    customers=getCustomers(profiles);

   //console.log(profiles);

   //console.log(await getAdminEmails());
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
     {#each customers as profile,profileIndex}
     <option value={profileIndex}>{profile.last_name}, {profile.first_name} {profile.email} </option>
     {/each}
  </select>
</label>
{/if}
<label>Your reference
  <input type=text name="ref" bind:value={job.customer_ref} placeholder='example - your purchase order code'/>
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