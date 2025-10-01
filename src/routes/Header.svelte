<script lang="ts">
	import logo from '$lib/images/logo.png';
	//import logo-white from '$lib/images/logo-white.png';
	import { page } from '$app/state';
	

	import { fade, fly } from 'svelte/transition';
	import * as icon from '$lib/icon';
	import { goto } from '$app/navigation';

	let { session = $bindable() } = $props();
	let showMenu=$state(false);

	function openNav() {
		showMenu=true;
  		//document.getElementById("nav-side").style.width = "300px";
		//document.getElementById("nav-side").style.borderLeft='1px solid rgba(0,0,0,0.55)';
}

/* Set the width of the side navigation to 0 */
function closeNav() {
		showMenu=false;
  		//document.getElementById("nav-side").style.width = "0";
		//document.getElementById("nav-side").style.borderLeft='1px solid white';
}

</script>

<header>
<div class="wrapper">


	<div class="logo">
		<a href="https://implantify.eu">
			<img class="logo-img" src={logo} alt="implantify" />
		</a>
	</div>

	<nav>
		{#if session && session?.user?.email!==''}
				<a href="/private">Orders</a>
				<a href="/private/account">Account</a>
				<a href="https://www.implantify.eu/">Home</a>
		{:else}


		<a href="https://www.implantify.eu/">Home</a>
		<a href="https://www.implantify.eu/medical" target="_blank">Medical</a>
		<a href="https://www.implantify.eu/dental" target="_blank">Dental</a>
		<a href="https://www.implantify.eu/about-us" target="_blank">About us</a>
		<a href="https://www.implantify.eu/contactus" target="_blank">Contact us</a>
		<a href={'javascript:void(0)'}>
			<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 512 512"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg> +32 470 84 39 23
		</a>	
		{/if}
		{#if session && session?.user?.email!==''}
		<a href={'/auth/signout'}>{@html icon.signout(24)}</a>
		{:else}
		<a data-sveltekit-reload href={'/auth/signin'}>{@html icon.signin(24)}</a>
		{/if}

				
	
	</nav>

	{#if showMenu}
	<div class="nav-wrapper" transition:fade={{ duration: 200 }} tabindex="-1" role="button" onkeydown={closeNav} onclick={closeNav}>
		<!-- This div is just to ncapture clicks outside the nav side -->
	<div id="nav-side" class="nav-side" transition:fly={{ x:200, duration: 200 }}>
		<div>
			<div class="nav-close">
				<a href={'javascript:void(0)'} onclick={closeNav}>{@html icon.cross(24)}</a>
			</div>
		
		<ul>
			{#if session && session?.user?.email!==''}
				<li><a href="/private">Orders</a></li>
				<li><a href="/private/account">Account</a></li>
				<li><a href="https://www.implantify.eu/">Home</a></li>
				
			{:else}
					<li><a href="https://www.implantify.eu/">Home</a></li>
					<li><a href="https://www.implantify.eu/medical" target="_blank">Medical</a></li>
					<li><a href="https://www.implantify.eu/dental" target="_blank">Dental</a></li>
					<li><a href="https://www.implantify.eu/about-us" target="_blank">About us</a></li>
					<li><a href="https://www.implantify.eu/contactus" target="_blank">Contact us</a></li>
					<li>
						<a href={'javascript:void(0)'}>
							<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>+32 470 84 39 23
						</a>	
					</li>
			{/if}
			
			{#if session && session?.user?.email!==''}
		
			<li><a href={'/auth/signout'}>{@html icon.signout(24)}</a></li>
			{:else}
			<li><a data-sveltekit-reload href={'/auth/signin'}>{@html icon.signin(24)}</a></li>
			{/if}
			
		

		</ul>
		</div>
	</div>
	</div>
	











	{/if}

	{#if !showMenu}
	<div class="nav-small">
		<a href={'javascript:void(0)'} onclick={openNav} >
			{@html icon.menu(24)}
			
		</a>
	</div>
	{/if}




</div>
</header>
<p></p>
<style>

	header {
	
		position:fixed;
		width:100%;
		z-index:1000;
		background:white;
		font-size:1.5rem;
	
	}

	.wrapper {
		display: flex;
		justify-content: space-between;
		padding-left:5vw;
		padding-right:5vw;
		
		padding-top:1em;
	}

	 
	
	.logo {
		width:20vw;
		align-content: center;
	}

	.logo img {
		width:20vw;
		object-fit: contain;
	}

	@media (max-width: 768px) {
		.logo {
		width:30vw;
		align-content: center;
	}

	.logo img {
		width:30vw;
		object-fit: contain;
	}
	}

	@media (max-width: 400px) {
		.logo {
		width:40vw;
		align-content: center;
	}

	.logo img {
		width:40vw;
		object-fit: contain;
	}
	}

	

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
		align-items:center;
	}

	.nav-small {
		display:none;
	}

	.icon {
		width:1.2rem;
		height:1.2rem;
		stroke:currentColor;
		fill:currentColor;
	}

	.nav-wrapper {
		position:fixed;
		top:0;
		left:0;
		width:100%;
		height:100%;
		background:rgba(0,0,0,0.1);
	}
	.nav-side {
		height: 100%; /* 100% Full-height */
		min-height:100%;
		width: 300px; /* 0 width - change this with JavaScript */
		position: fixed; /* Stay in place */
		z-index: 2000; /* Stay on top */
		top: 0; /* Stay at the top */
		right: 0;
		background-color: #fff; /* Black*/
		overflow-x: hidden; /* Disable horizontal scroll */
		padding-top: 1rem;
		transition: 0.5s; /* 0.5 second transition effect to slide in the sidenav */
		
		box-sizing: content-box;
		transform-origin: right;
		transition-property: all;
		transition-duration: 500ms;
	}

	@media (max-width: 400px) {
		.nav-side {
			width:100%;
		}
	}

	ul {
		list-style-type:none;
		padding-top:2rem;
	}

	li {
		
		padding-bottom:1rem;

	}
	

	@media (max-width: 950px) {
		nav {
			display:none;
		}

		.nav-small {
			display: flex;
			display: flex;
			height: 100%;
			align-items: center;
			padding: 0 0.5rem;
		}
	}

	.nav-close {
		display:flex;
		justify-content: flex-end;
		padding-right: 1em;
	}
	
	/*
	svg {
		width: 2em;
		height: 3em;
		display: block;
	}
		*/



	a,a:hover {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: rgba(0,0,0,0.55);
		font-weight: 500;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: rgba(0,0,0,0.9);
		
	}
</style>

