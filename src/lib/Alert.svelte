<script lang="ts">
    import { alert } from "$lib/state.svelte";
    import {xCircle} from '$lib/icon';
    let timeout:any;
    
    let review=(msg:string)=>{
        clearTimeout(timeout);
        if (alert.ms > 0 && msg) timeout = setTimeout(() => {
            alert.msg='';
            alert.type='';
        
        }, alert.ms);
        
    };
    

    const reset=()=>{
        alert.msg='';
        alert.type='';
        alert.ms=3000;
        clearTimeout(timeout);

    };

    $effect(() => {
        if(alert.type==='error') alert.ms=0;
        else alert.ms=3000;
        review(alert.msg);
    });



    
    </script>


    {#if alert.msg}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div role="button" tabindex="-1" class="alert-page"  onclick={reset}>
            <div class={alert.type==='error' ? `alert-box error` : `alert-box`}>
                <div class={'alert-msg'}>{alert.msg}</div>
                <div class="alert-msg"><a href={'javascript:void(0)'} style="color:white;" onclick={reset}>{@html xCircle()}</a></div>
        
            </div>
          </div>
    {/if}
    

      <style>


        .alert-page {
            position: fixed;
            cursor: pointer;
            display:flex;
            flex-direction:column;
            align-items: center;
            justify-content: start;
            background:rgba(0,0,0,0);/*#28bd14;*/
            color:#fff;/*#f3f3f6;*/
            margin-right:0;
            margin-top:0;
            right:0;
            top:0;
            width:30rem;
            min-height:100vh;
            min-width:100vw;
            z-index:2000;
        }

        .alert-box {
            height:4rem;
            line-height:4rem;
            /*background:rgba(34,139,34,0.9);*/
            background:#333;/*#7acc88;*/ /*#28bd14;*/ /* #14854fa1*/
            min-width:50%;
            margin-top:20vh;
            display:flex;
            justify-content:space-between;
            align-items:center;
            border-radius: 0.2em;

        }

        .error {
            /*background:rgba(178,34,34,0.9);*/
            background:#cc7e7a;/*#d43939;*/ /* #d43939a1*/

        }

        .alert-msg {
            padding:0rem 2rem;
            border:0px solid #fff;
            text-transform: uppercase;
           
        }

       
      </style>