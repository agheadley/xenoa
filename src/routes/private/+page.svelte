<script lang="ts">
import { onMount } from 'svelte';
import { invalidate } from '$app/navigation'

import {toSimpleDate} from '$lib/util';
import Modal from '$lib/Modal.svelte';
import {alert} from '$lib/state.svelte';
import {email} from '$lib/util';
import * as icon from '$lib/icon';

import NewJob from './NewJob.svelte';

let { data } = $props();
let { account,profiles,supabase,config,requests} = $derived(data);

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
        requests = requests.sort((a,b)=>a.total-b.total|| (Number(new Date(a.created_at))-Number(new Date(b.created_at))));
    else if(sortList[sortIndex]==='Old to New') 
        requests= requests.sort((a,b)=>Number(new Date(a.created_at))-Number(new Date(b.created_at)));
    else requests= requests.sort((a,b)=>Number(new Date(b.created_at))-Number(new Date(a.created_at)));
    
};



$effect(() => {
       if(isUpdate) {
            console.log('updating requests...');
            invalidate('supabase:db:requests');
            isUpdate=false;
       }
});


onMount(async() => {
   console.log('requests',requests);
   
});


</script>

<svelte:head>
	<title>Orders</title>
	<meta name="description" content="Implantify" />
</svelte:head>


{#if account.isStaff}
 Staff section
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






<style>

</style>

