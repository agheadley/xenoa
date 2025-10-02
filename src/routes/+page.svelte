






<script lang="ts">
import type { PageData } from './$types';
let { data }: { data: PageData } = $props();

let showModal : boolean = $state(true);

let authType=$state({list:['Email Link','Password','Sign Up'],index:0});

let next='/xyz';




let details=$state({email:'',password:'',passwordB:'',first_name:'',last_name:'',institution:'',isValid:false,isValidPassword:false,isValidEmail:false});


let isUpdate=$state(false);
const validateUser=()=>{

	details.isValidEmail=false;
	details.isValidPassword=false;
	details.isValid=false;

	details.isValidEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email);     
	
	/* https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a */
	/* 1x upper case, 1x lower case, 1x number, 1x special character */
	details.isValidPassword=/[\.\@\#\$\%\^\&\*\(\)\_\+\!]/.test(details.password) && /[a-z]/.test(details.password) && /[0-9]/.test(details.password) && /[A-Z]/.test(details.password);
	details.isValidPassword =  details.password?.length<8 ? false : details.isValidPassword;
	details.isValidEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email);

	details.isValid=details.institution?.length>1 && details.first_name?.length>1  && details.last_name?.length>1 && details.isValidEmail && details.isValidPassword ? true : false;
	console.log(details.isValid);
};



let swap=(index:number)=>{
	
	authType.index=index;
	console.log(authType.index);
}

</script>

<svelte:head>
	<title>Sign In</title>
	<meta name="description" content="Implantify" />
</svelte:head>


<p>&nbsp;</p>
<h4>Customer Portal</h4>
<p>&nbsp;</p>



<div class="row">
	<div class="col-1">

	</div>
	<div class="col-10">


		<nav class="tabs is-full">
		{#each authType.list as item,index}
		<a onclick={()=>authType.index=index} class={authType.index===index ? 'active' : ''} href={'javascript:void(0)'} >{authType.list[index]}</a>
		{/each}
		
		</nav>

		</div>
	<div class="col-1">
		
	</div>
</div>
		
	 	<form method="POST" action={`?/login`} >
		

		{#if authType.list[authType.index]==='Email Link'}
		<p>Send an Email Sign In Link</p>
		<p>
			<input name="email" type="email" placeholder="email" autocomplete="on"/>
        </p>
		<button class="button primary" formaction="?/link&next=/private">Send Email</button>

		{/if}

		{#if authType.list[authType.index]==='Password'}
		<p>Sign In with Email/Password</p>
              
        <p>
			<input name="email" type="email" placeholder="email" autocomplete="on"/>
        </p>
        <p>
        	<input name="password" type="password" placeholder="Password"/>
      	</p>
        <p>
        	<button  class="button primary" formaction={`?/login`}>Sign In</button>
			
		</p>
		<p>
			<button class="button outline" formaction="?/reset&next=/private/account">Forgotten Password ?</button>
		</p>
        
    

		{/if}

		{#if authType.list[authType.index]==='Sign Up'}
	  		<p>Apply to Become a Portal User</p>
				 <p>
		
		<label for="email">Email</label>
		<input type={'text'} class={details.email.length && details.email.length >0 ? details.isValidEmail ? '' :'input-error' :''} id="email" bind:value={details.email} oninput={validateUser} name="email" placeholder=""/>
		<label for="password">Password</label>
		<input id="password" class={details.password.length && details.password.length >0 ? details.isValidPassword ? 'i' :'input-error' :''} type='password' bind:value={details.password} oninput={validateUser} name="password" placeholder="8+ characters, upper,lower,special"/>
		<label for="passwordB">Confirm Password</label>
		<input id="passwordB" class={details.passwordB.length && details.passwordB.length >0 ? details.passwordB===details.password  ? '' :'input-error' :''} type='password' bind:value={details.passwordB} oninput={validateUser} name="passwordB" placeholder=""/>

		<label for="first_name">First name</label>
		<input type={'text'} id="first_name" bind:value={details.first_name} name="first_name" placeholder="2+ characters" oninput={validateUser}/>
		<label for="first_name">Last name</label>
		<input type={'text'} id="last_name" bind:value={details.last_name} name="last_name" placeholder="2+characters" oninput={validateUser}/>
		<label for="institution">Hospital/Clinic</label>
		<input type={'text'} id="institution" bind:value={details.institution} name="institution" placeholder="2+ characters" oninput={validateUser}/>
</p>
	
	


		<p>
			<button  disabled={!details.isValid} class="button primary" formaction={`?/signup`}>Send Application</button>
			
		</p>

		{/if}
		
        </form>
	  	
	

	
	
 


<style>


    /* agh */
  
  .input-error {
    border:2px solid var(--color-error);
}



</style>
