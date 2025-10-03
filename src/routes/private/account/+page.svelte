<script lang="ts">

import {alert} from '$lib/state.svelte';
import type { EventHandler } from 'svelte/elements';
//import {supabaseB} from '$lib/supabaseClient.js';
import { onMount } from 'svelte';
import { invalidate } from '$app/navigation';
//import Modal from '$lib/Modal.svelte';
//import {log,email} from '$lib/util';
import NewUser from './NewUser.svelte';
import Reset from './Reset.svelte';
import Staff from './Staff.svelte';
import Customer from './Customer.svelte';



let { data } = $props();
let { account,profiles,supabase} = $derived(data);

	

let menu = $state({list:['Customers','Add User','Staff','Me'],index:0});



let isUpdate=$state(false);










$effect(() => {
     
    if(isUpdate) {
        isUpdate=false;
        invalidate('supabase:db:profiles');
    }
});

onMount(async() => {
    //console.log(data);
});

</script>



{#if account.isStaff}
<div class="tabs is-full">
    {#each menu.list as item,index}
        <a href={'javascript:void(0)'} onclick={()=>menu.index=index} class={index===menu.index ? 'active' : ''}>{item}</a>
    {/each}
</div>
<p>&nbsp;</p>



{#if menu.list[menu.index]==='Customers'}
<Customer bind:isUpdate={isUpdate} supabase={supabase} profiles={profiles} account={account}></Customer>
{/if}


{#if menu.list[menu.index]==='Add User'}
<NewUser bind:isUpdate={isUpdate} account={account}></NewUser>
{/if}

{#if menu.list[menu.index]==='Staff'}
<Staff bind:isUpdate={isUpdate} supabase={supabase} profiles={profiles} account={account}></Staff>
{/if}

{#if menu.list[menu.index]==='Me'}
    <Reset bind:isUpdate={isUpdate} supabase={supabase} account={account}></Reset>
{/if}
{/if} <!-- /staff-->



{#if !account.isStaff}
     <Reset bind:isUpdate={isUpdate} supabase={supabase} account={account}></Reset>
{/if}





<style>


</style>