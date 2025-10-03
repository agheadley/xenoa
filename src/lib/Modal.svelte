<script>
	import * as icon from '$lib/icon';
    import {goto} from '$app/navigation';

	let { showModal = $bindable(), header, children } = $props();

	let dialog = $state(); // HTMLDialogElement

	$effect(() => {
		if (showModal) {
            dialog.showModal();
           
          
        } else {
           dialog.close();
           //goto ('/');
        }
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onclick={(e) => { if (e.target === dialog) dialog.close(); }}
>
	<div>
        <div class="flex">
            <div>{@render header?.()}</div>
            	
            <div><a href={'javascript:void(0)'} onclick={() => dialog.close()}>{@html icon.xCircle()}</a></div>
        </div>
		
		<hr />
	<div class="wrapper">
		{@render children?.()}
	</div>
	
		
	</div>
</dialog>

<style>

    a:focus {
        outline: none;
    }

	.wrapper {
		max-height:60vh;
		overflow-y:auto;
       
	}
    .flex {
		
        display:flex;
        justify-content: space-between;
        align-items: top;
		
    }
	dialog {
		width: 40rem;
		border-radius: 0.2em;
		border: none;
		padding: 0;
		outline:none;
		color:#5b6160;
		font-weight:300;
		
		margin:auto;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.1);
	}

   

	dialog > div {
		padding: 2rem;
       
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        border:none;
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}



</style>