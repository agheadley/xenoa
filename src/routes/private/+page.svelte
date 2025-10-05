<script lang="ts">
import { onMount } from 'svelte';
import { invalidate } from '$app/navigation'

import {toSimpleDate} from '$lib/util';
import Modal from '$lib/Modal.svelte';
import {alert} from '$lib/state.svelte';
import {email} from '$lib/util';
import * as icon from '$lib/icon';

import NewJob from './NewJob.svelte';
import Progress from '$lib/Progress.svelte';

let { data } = $props();
let { account,profiles,supabase,config,jobs} = $derived(data);

let sortIndex=$state(1);
let sortList=['Completion Least-Most','New to Old','Old to New'];

let isUpdate=$state(false);

let assignIndex=$state(0);
let staffId=$state('');

let showModal=$state(false);

let menu = $state({list:['All','Me'],index:0});


const sortOrders=()=>{
    //'Completion Least-Most','New to Old','Old to New'

    if(sortList[sortIndex]==='Completion Least-Most') 
        jobs = jobs.sort((a,b)=>a.total-b.total|| (Number(new Date(a.created_at))-Number(new Date(b.created_at))));
    else if(sortList[sortIndex]==='Old to New') 
        jobs= jobs.sort((a,b)=>Number(new Date(a.created_at))-Number(new Date(b.created_at)));
    else jobs= jobs.sort((a,b)=>Number(new Date(b.created_at))-Number(new Date(a.created_at)));
    
};



$effect(() => {
       if(isUpdate) {
            console.log('updating jobs...');
            invalidate('supabase:db:jobs');
            isUpdate=false;
       }
});


onMount(async() => {
  console.log('private/+page.svelte ...');
   
   
});


</script>

<svelte:head>
	<title>Orders</title>
	<meta name="description" content="Implantify" />
</svelte:head>


{#if account.isStaff}
 <div class="row">
     <div class="col-3">
        <NewJob config={config} account={account} supabase={supabase} profiles={profiles.filter(el=>el.is_approved && !el.is_staff && !el.is_admin)} bind:isUpdate></NewJob>
     </div>
    
    <div class="col-5">
      <select name="sort" id='sort' bind:value={sortIndex} onchange={sortOrders}>
        {#each sortList as row,rowIndex}
        <option value={rowIndex}>Sort by {row}</option>
        {/each}
        </select>
    </div>

    <div class="col-4">
        <div class="tabs">
            {#each menu.list as item,index}
                <a href={'javascript:void(0)'} onclick={()=>menu.index=index} class={index===menu.index ? 'active' : ''}>{item}</a>
            {/each}
        </div>
    </div>
</div>
{/if}


{#if !account.isStaff}

<div class="row">
     <div class="col-3">
        <NewJob config={config} account={account} supabase={supabase} profiles={profiles.filter(el=>el.is_approved && !el.is_staff && !el.is_admin)} bind:isUpdate></NewJob>
     </div>
    
    <div class="col-5">
      <select name="sort" id='sort' bind:value={sortIndex} onchange={sortOrders}>
        {#each sortList as row,rowIndex}
        <option value={rowIndex}>Sort by {row}</option>
        {/each}
        </select>
    </div>

   
</div>
{/if}


<p>&nbsp</p>
{#each jobs as row,rowIndex}
    {#if (menu.list[menu.index]==='Me' && account.email===row.staff_email) ||  (account.isStaff && menu.list[menu.index]==='All') || (!account.isStaff)}
    
   
    <div class="card">
        <div class="row">
            <div class="col">
                {row.first_name} {row.last_name}
            </div>
            <div class="col">
                <span class="tag is-small">{toSimpleDate(row.created_at)}</span> <b>{row.customer_ref}</b>
            </div>
        </div>
         <div class="row">
            <div class="col">
                <a href={`/private/orders/${row.id}`}>{@html icon.edit()} {row.type}</a>
            </div>
            <div class="col">
                 <Progress levels={row.levels} cfg={config.stages}></Progress>
            </div>
        </div>
		<!--
        <div class="row">
            <div class="col">
                {#if account.isAdmin}
                {#if row.staff_id!=='' && row.staff_email!==''}
                    <span class="tag is-small">{row.staff_email}</span>
                {:else}
                    <AssignRequest request={row} account={account} supabase={supabase} profiles={profiles.filter(el=>el.is_staff)} bind:isUpdate></AssignRequest>
                {/if}
                {:else}
                {#if row.staff_id!=='' && row.staff_email!==''}
                    <span class="tag is-small">{row.staff_email}</span>
                {:else}
                    <span class="tag is-small text-error">AWAITING STAFF...</span> 
                {/if}
                {/if}
            </div>
            <div class="col">
               
            </div>
        </div>
		-->
        
    </div>
<p></p>

{/if}

{/each}





<style>

</style>

