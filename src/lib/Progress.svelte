<script lang="ts">



let { cfg,levels} = $props();

//console.log(cfg);

</script>


<!--
--color-amber:#f0d27a;
    --color-green:#5dba69;
    --color-red:#f07a8a;
-->
<div class="wrapper">
{#each levels as item,index}
    <div class="small item">
        <div class="text">{cfg[index].type}</div>
        <div class="diagram">
            <svg width="5rem" height="2.5rem"  viewBox="0 0 200 100 " xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="50" x2="200" y2="50" stroke="#5b6160" stroke-width="2"/>
                {#if item==1}
                <circle cx="100" cy="50" r="25" stroke="#5b6160" stroke-width="2" fill="#f0d27a"/>
                {:else if item==2}
                 <circle cx="100" cy="50" r="25" stroke="#5b6160"stroke-width="2" fill="#5dba69"/>
                {:else}
                 <circle cx="100" cy="50" r="25" stroke="#5b6160"stroke-width="2" fill="#f07a8a"/>
                {/if}
               
            </svg>
        </div>
    </div>
{/each}
</div>
<style>

.wrapper {
    display:flex;
    flex-direction:row;
}

.item {
   padding:0;
    width:5rem;
    overflow:hidden;
   
}

.text {
 text-align: center;

}


.small {
    font-size:0.7rem;
    text-transform: capitalize;
}
</style>

