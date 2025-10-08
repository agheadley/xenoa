<script lang="ts">
import { onMount } from 'svelte';
import {alert} from '$lib/state.svelte';

let { denture = $bindable(), cfg,supabase,prescription_id } = $props();

const selectTooth = async(index:number) => {

  console.log('storing change ',denture[index].q,denture[index].i);
  denture[index].r = denture[index].r ? false : true;
 
const {error} = await supabase.from('prescriptions').update({ denture:denture }).eq('id', prescription_id);
if(error) {
    alert.type='error';
    alert.msg=`Error storing denture`;
}	
};

onMount(async() => {
   
  console.log(denture,cfg);
 
   
});

</script>

 <div class="tooth ">
      <svg height="400px" style="position:absolute;top:0:left:0;" width="200px" xmlns='http://www.w3.org/2000/svg'>
        <text style="user-select: none; /* Standard */" font-size="12px" font-weight="bold" fill="#333" x="70" y="130">UR</text>
        <text style="user-select: none; /* Standard */" font-size="12px" font-weight="bold" fill="#333" x="110" y="130">UL</text>
         <text style="user-select: none; /* Standard */" font-size="12px" font-weight="bold" fill="#333" x="70" y="270">LR</text>
        <text style="user-select: none; /* Standard */" font-size="12px" font-weight="bold" fill="#333" x="110" y="270">LL</text>
        {#each cfg as row,rowIndex}
         <text style="user-select: none; /* Standard */" font-size="10px" font-weight="bold" fill="#333" x={row.xl[0]} y={row.xl[1]}>{row.l}</text>
         <text style="user-select: none; /* Standard */" font-size="8px" fill="#747681" x={row.xi[0]} y={row.xi[1]}>{row.i}</text>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    
        <circle role="img" onclick={() => selectTooth(rowIndex)} cx={row.xt[0]} cy={row.xt[1]} r={row.r} fill={'#ffffff00'}/>
   
        {#if denture[rowIndex].r}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        
        <circle role="img" onclick={() => selectTooth(rowIndex)} cx={row.xt[0]} cy={row.xt[1]} r={row.r-2} fill={'#28bd1488'}/>
     
        {/if}
          
        {/each}
       
          
    
      </svg>
    </div>




<style>

.tooth {
    position: relative;
    width:200px;
    height:400px;
    display:inline-block;

    background-image:url('/jaw_200_400.png')

  }
</style>