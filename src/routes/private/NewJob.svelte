<script lang="ts">

import { onMount } from 'svelte';
import * as icon from '$lib/icon';
import Modal from '$lib/Modal.svelte';
import {alert} from '$lib/state.svelte';
//import {emailAdminList} from '$lib/util';

let { isUpdate = $bindable(),supabase,config,account,profiles} = $props();

let request = $state({customer_id:'',type:'',first_name:'',last_name:'',customer_ref:'',customer_email:''});

let customerIndex:number=$state(0);

let showModal=$state(false);

$effect(() => {
    if(!showModal) {
        request = {customer_id:'',type:'',first_name:'',last_name:'',customer_ref:'',customer_email:''};
        customerIndex=0;
    }
});


onMount(async() => {
   
    
});

</script>