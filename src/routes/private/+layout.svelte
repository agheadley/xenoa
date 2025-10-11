<script>

  import { onMount } from 'svelte';

  let { data, children } = $props();
  let { account,config} = $derived(data);
  

  //let { account } = $derived(data)

  onMount(async() => {
    console.log(config);
   
      
  });
</script>



<p>{account.first_name} {account.last_name}&nbsp;{account.email}&nbsp;{#if account.isStaff}<span class="tag is-small text-error">staff</span>{/if}{#if account.isAdmin}<span class="tag is-small text-error">admin</span>{/if}</p>
<p>&nbsp;</p>
{@render children()}
