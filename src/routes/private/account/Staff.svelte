<script lang="ts">
import {alert} from '$lib/state.svelte';
import Modal from '$lib/Modal.svelte';
import {log} from '$lib/util';

let { isUpdate = $bindable(),supabase,profiles,account} = $props();

let showModal=$state(false);

let staffIndex=$state(0);

let route:'admin'|'delete'=$state('admin');

let deleteText=$state('');
let statusText=$state('');


const showAdmin=(index:number):void=>{
    staffIndex=index;
    route='admin';
    showModal=true;
};


const showDelete=(index:number):void=>{
    staffIndex=index;
    route='delete';
    showModal=true;
};

const deleteUser=async()=>{
    console.log('not implemented!!! Needs service role, perhaps edge function');
    deleteText='';
    showModal=false;
    alert.msg='Not implemented';
    isUpdate=true;
};

const updateStatus=async()=>{
    //console.log('not implemented!!!');

    const is_admin = statusText==='add admin status' ? true : false;

     const { error } = await supabase
        .from('profiles')
        .update({is_admin:is_admin})
        .eq('id', profiles[staffIndex].id);
        console.log(error);
    
    statusText='';
    showModal=false;

    if(error) {
        alert.type='error';
        alert.msg='Error updating admin status';
        
    } else {
        alert.msg='Admin status updated';

        let res=await log(account.id,account.email,'profiles',`${profiles[staffIndex].email} status change is_admin:${is_admin}`);
        if(!res.isOK) {
            alert.type='error';
            alert.msg='admin status updated, but error logging change';
        }

    }
       
    isUpdate=true;

};
</script>


{#each profiles as row,rowIndex}
  {#if row.is_staff}
    <div class="card">
        <div class="row">
            <div class="col">{row.first_name} {row.last_name}</div>
            <div class="col">{row.email}</div>
        </div>
        <div class="row">
            <div class="col">
                {#if row.is_staff}<span class="tag is-small text-error">STAFF</span>{/if}
                {#if row.is_admin}<span class="tag is-small text-error">ADMIN</span>{/if}
                
                
            </div>
            <div class="col">
                {#if account.isAdmin && row.id!==account.id}
                <a href={'javascript:void(0)'} onclick={()=>showAdmin(rowIndex)}><span class="strong">ADMIN</span></a>&nbsp;
                <a href={'javascript:void(0)'} onclick={()=>showDelete(rowIndex)}><span class="strong">DELETE</span></a>
            
                {/if}
               </div>
             
        </div>
        
    </div>
    <p></p>
    {/if}
{/each}


{#if  showModal && route==='admin'}
<Modal bind:showModal>
    {#snippet header()}
    <h3>Change Admin Status</h3>
    {/snippet} 
        <p>{profiles[staffIndex].first_name} {profiles[staffIndex].last_name} <b>{profiles[staffIndex].email}</b></p>
        <p>Type <span class="strong">add admin status</span> to add</p>
        <p>Type <span class="strong">remove admin status</span> to remove</p>
        
        <p>
            <input bind:value={statusText} type="text" />
           
        </p>
          <p>
            <button disabled={statusText!=='add admin status' && statusText!=='remove admin status' } class="button primary" onclick={updateStatus}>Change Status</button>
            <button class="button outline" onclick={()=>showModal=false}>Cancel</button> 
          </p>
</Modal>
{/if}


{#if  showModal && route==='delete'}
<Modal bind:showModal>
    {#snippet header()}
    <h3>Delete User</h3>
    {/snippet} 
        <p>User {profiles[staffIndex].first_name} {profiles[staffIndex].last_name} <b>{profiles[staffIndex].email}</b></p>
        <p></p>
        <p><span class="tag text-error">Warning - Can't be undone</span></p>
        <p>Type <span class="strong">delete {profiles[staffIndex].email}</span></p>
        <p>
            <input bind:value={deleteText} type="text" />
           
        </p>
          <p>
            <button disabled={deleteText!==`delete ${profiles[staffIndex].email}`} class="button error" onclick={deleteUser}>Delete</button>
            <button class="button outline" onclick={()=>showModal=false}>Cancel</button>
            
          </p>
</Modal>
{/if}


<style>

.strong {font-weight:500;}
</style>