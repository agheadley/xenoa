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
    
    if (ereq) return {isOK:false,msg:'error creating order'};

    let prescriptions=config.prescriptions.map((el: any)=>({...el,customer_id:job.customer_id,job_id:req?.[0].id}));

    const { data:pres,epres } = await supabase.from('prescriptions').insert(prescriptions).select();
   
    const content =`
    <p>New order created by ${job.first_name} ${job.last_name} (${job.customer_email})</p>
    <p>&nbsp;</p>
    <p><a href="https://portal.implantify.eu">Sign in</a> to ASSIGN STAFF to this order</p>
    `;

    const response = await fetch('/private/api/admins', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {'content-type': 'application/json'}
    });
    const cc= await response.json();

    console.log('sending admin email to ...',cc);

    let res=await email('','Admin action required',content,cc);

    if(!res.isOK) return {isOK:false,msg:'staff created, but wrror sending email to admin staff'}    

    
    


 

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
     if(!res.isOK) {
        alert.type='error';
        alert.msg=res.msg;
        return;
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