<script lang="ts">
import {supabaseB} from '$lib/supabaseClient.js';
import {alert} from '$lib/state.svelte';
import {log} from '$lib/util';

let { isUpdate = $bindable(),account} = $props();

let details=$state({email:'',password:'',passwordB:'',first_name:'',last_name:'',institution:'',isValid:false,isValidPassword:false,isValidEmail:false});

const updateDb=async():Promise<{isOK:boolean,msg:string}>=>{
    const { data, error } = await supabaseB.auth.signUp({
        email: details.email,
        password: details.password,
        options: {
            data: {
            first_name: details.first_name,
            last_name: details.last_name,
            institution:details.institution
            },
        },
    });
    console.log(data,error);
    if(!data?.user?.email)  return {isOK:false,msg:'error creating user'};

    let res=await log(account.id,account.email,'profiles',`New User ${details.email} ${details.first_name} ${details.last_name}`);
    if(!res.isOK) return {isOK:false,msg:'user added, but error logging user creation'};

    return {isOK:true,msg:'user created'}

};


const addUser = async() => {
    let res=await updateDb();
    if(!res.isOK) {
        alert.type='error'
        alert.msg=res.msg;
    } else {
        alert.msg=res.msg; 
        clearData();

        isUpdate=true;
    }
};


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

    details.isValid=details.first_name?.length>1 && details.last_name?.length>1 && details.institution?.length>1 && details.isValidEmail && details.isValidPassword ? true : false;
    //console.log(details);
};

let clearData=()=>{
    details={email:'',password:'',passwordB:'',first_name:'',last_name:'',institution:'',isValid:false,isValidPassword:false,isValidEmail:false};

};


</script>


    <div class="row">
        <div class="col-2"></div>
        <div class="col-8">

      

    <h3>Create a new user</h3>
    <p></p>
    <p>
    <label for="email">Email</label>
    <input type={'text'} class={details.email.length && details.email.length >0 ? details.isValidEmail ? 'input-success' :'input-error' :''} id="email" bind:value={details.email} oninput={validateUser} name="email" placeholder=""/>
    <label for="password">Password</label>
    <input id="password" class={details.password.length && details.password.length >0 ? details.isValidPassword ? 'input-success' :'input-error' :''} type='text' bind:value={details.password} oninput={validateUser} name="password" placeholder="8+ characters, upper,lower,special"/>

    <label for="first_name">First name</label>
    <input type={'text'} id="first_name" bind:value={details.first_name} name="first_name" placeholder="2+ characters" oninput={validateUser}/>
    <label for="first_name">Last name</label>
    <input type={'text'} id="last_name" bind:value={details.last_name} name="last_name" placeholder="2+ characters" oninput={validateUser}/>
     
    <label>Hospital/Clinic
    <input bind:value={details.institution} name="institution" type="text" placeholder="2+ characters" required oninput={validateUser} />
    </label>


    </p>
    <p>
    </p>
    <p>
    <button onclick={addUser} disabled={!details.isValid} class="button primary">Add User</button>
    <button class="button outline" onclick={clearData}>Cancel</button>  
    </p>
   
     </div>
        <div class="col-2"></div>
    </div>

         


<style>

</style>