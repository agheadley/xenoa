<script lang="ts">
import {alert} from '$lib/state.svelte';
import { onMount } from 'svelte';
import Modal from '$lib/Modal.svelte';
import {log,email} from '$lib/util';


let { isUpdate = $bindable(),supabase,profiles,account} = $props();

let showModal=$state(false);


let approveIndex=$state(0);
let approveText=$state('');



const openStatus=(index:number)=>{
    approveIndex=index;
    console.log(profiles[approveIndex]);
    approveText='';
    showModal=true;
};

const updateDbStaff=async():Promise<{isOK:boolean,msg:string}>=>{

    const { data, error } = await supabase
        .from('profiles')
        .update({is_staff:true})
        .eq('id', profiles[approveIndex].id)
        .select();
    if (error) return {isOK:false,msg:'error changing user staff status'};

    let res=await email(profiles[approveIndex].email, 'Implantify User Status Changed to Staff', `<p>You have been promoted to staff</p><p>Login at <a href="https://portal.implantify.eu/auth/signin">Implantify</a></p>`);
    if(!res.isOK) return {isOK:false,msg:'user status staff ok,but error sending email'};

    let l=await log(account.id,account.email,'profiles',`User ${profiles[approveIndex].email} status changed to staff`)
    if(!l.isOK) return {isOK:false,msg:'user status staff ok, but error logging user approval'};
    
    return {isOK:true,msg:'user status changed to staff'};


    
};

const updateDbApprove=async():Promise<{isOK:boolean,msg:string}>=>{
    console.log(profiles[approveIndex].id);
    const { data, error } = await supabase
        .from('profiles')
        .update({is_approved:true})
        .eq('id', profiles[approveIndex].id)
        .select();
    console.log(data,error);

    if (error) return {isOK:false,msg:'error approving user'};

    let res=await email(profiles[approveIndex].email, 'Implantify User Approved', `<p>You have been approved as a user!</p><p>Login at <a href="https://portal.implantify.eu/auth/signin">Implantify</a></p>`);
    if(!res.isOK) return {isOK:false,msg:'user approved,but error sending email'};

    let l=await log(account.id,account.email,'profiles',`User ${profiles[approveIndex].email} approved`)
    //console.log('l log',l);
    if(!l.isOK) return {isOK:false,msg:'user approved, but error logging user approval'};

    return {isOK:true,msg:'user approved'};
};

const updateStatus=async()=>{
     showModal=false;
       
    if(approveText==='approve user') {
        const res=await updateDbApprove();
        //console.log(res);
        if(!res.isOK) {
            alert.type='error';
            alert.msg=res.msg;
            
        } else {
            showModal=false;
            alert.msg=res.msg;
            approveText='';
            approveIndex=0;
            isUpdate=true;
        }
        
    }
    if(approveText==='change to staff') {
        const res=await updateDbStaff();
           
        if(!res.isOK) {
            alert.type='error';
            alert.msg=res.msg;
            
        } else {
            alert.msg=res.msg;
            approveText='';
            approveIndex=0;
            isUpdate=true;
        }
        
    }

    if(approveText==='reject user') {
        console.log('not implemented!!! Needs service role key, perhaps edge function');
        alert.msg='Not implemented';
        isUpdate=true;
    }
       

};


</script>


{#each profiles as row,rowIndex}
  {#if !row.is_staff}
    <div class="card">
        <div class="row">
            <div class="col">{row.first_name} {row.last_name}</div>
            <div class="col">{row.email}</div>
        </div>
        <div class="row">
             <div class="col">{row.institution}</div>
            <div class="col">
                {#if account.isAdmin}
                  <a href={'javascript:void(0)'} onclick={()=>openStatus(rowIndex)}><span class="strong">STATUS</span></a>
                {/if}
                {#if !row.is_approved}
                <span class="tag is-small text-error">NOT APPROVED</span>
                {:else}
                 <span class="tag is-small">APPROVED</span>
                {/if}

                
            </div>
           
            
        </div>
        
    </div>
    <p></p>
    {/if}
{/each}


{#if showModal}
<Modal bind:showModal>
    {#snippet header()}
    <h3>Change Customer Status</h3>
    {/snippet} 
        <p>{profiles[approveIndex].first_name} {profiles[approveIndex].last_name} <b>{profiles[approveIndex].email}</b></p>
        {#if !profiles[approveIndex].is_approved}
        <p>Type <span class="strong">approve user</span> to approve</p>
        {/if}
        <p>Type <span class="strong text-error">reject user</span> to delete user</p>
        {#if profiles[approveIndex].is_approved}
        <p>Type <span class="strong text-error">change to staff</span> if the user is a staff member</p>
        {/if}
        <p>
            <input bind:value={approveText} type="text" />
           
        </p>
          <p>
            <button disabled={approveText!=='approve user' && approveText!=='reject user' && approveText!=='change to staff'} class="button primary" onclick={updateStatus}>Update Status</button>
            <button class="button outline" onclick={()=>showModal=false}>Cancel</button>
            
          </p>
</Modal>
{/if}


<style>

.strong {
    font-weight:500;
}
</style>