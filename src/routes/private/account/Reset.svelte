<script lang="ts">
import {alert} from '$lib/state.svelte';
import {email,log} from '$lib/util';
import {PUBLIC_URL} from '$env/static/public';

let { isUpdate = $bindable(),supabase,account} = $props();

let details=$state({email:'',password:'',passwordB:'',first_name:'',last_name:'',institution:'',isValid:false,isValidPassword:false,isValidEmail:false});



const clearData=()=>{
    details={email:'',password:'',passwordB:'',first_name:'',last_name:'',institution:'',isValid:false,isValidPassword:false,isValidEmail:false};

};

const updateDb=async():Promise<{isOK:boolean,msg:string}>=>{
    const { data, error } = await supabase.auth.updateUser({password:details.password});
    console.log(data,error);
    if(data.error)  return {isOK:false,msg:'error reseting password'};

   

    let res=await email(account.email, 'Implantify Password Changed', `<p>You have changed your password for the Implantify Portal</p><p>Sign In at <a href="${PUBLIC_URL}">Implantify</a></p><p>If this wasn't you please contact the implantify team. You can use the Email Link sign in to access the portal and change your password.</p>`);
    if(!res.isOK) return {isOK:false,msg:'password changed, but error sending email'};

    let l=await log(account.id,account.email,'users',`Password Change ${account.email} , ${account.id}`)
    if(!l.isOK) return {isOK:false,msg:'password changed, but error logging user approval'};

    return {isOK:true,msg:'password reset'};

};

const resetPassword=async()=>{
   let res=await updateDb();
    if(!res.isOK) {
        alert.type='error';
        alert.msg=res.msg;
    } else {
        alert.msg=res.msg;
        clearData();
        isUpdate=true;
    }
 

};

const validateReset=()=>{
    details.isValidPassword=/[\.\@\#\$\%\^\&\*\(\)\_\+\!]/.test(details.password) && /[a-z]/.test(details.password) && /[0-9]/.test(details.password) && /[A-Z]/.test(details.password);
    details.isValidPassword = details.password?.length<8 ? false : details.isValidPassword;
    details.isValid=details.isValidPassword && details.password===details.passwordB ? true : false;

};



</script>



 <div class="row">
        <div class="col-2"></div>
        <div class="col-8">


<h3>Reset Password</h3>
     <p></p>
                <p>
                <label>Password
                <input class={details.password.length && details.password.length >0 ? details.isValidPassword ? 'input-success' :'input-error' :''} type='text' bind:value={details.password} oninput={validateReset} name="password" placeholder="8+ characters, upper,lower,special"/>
                </label>
                <label>Confirm Password
                <input  class={details.isValid ? '' :'input-error'} type='text' bind:value={details.passwordB} oninput={validateReset} name="password" placeholder=""/>
                </label>
                </p>
                <p>
                <button onclick={resetPassword} disabled={!details.isValid} class="button primary">Reset Password</button>
                <button class="button outline" onclick={clearData}>Cancel</button> 
                </p>
          
  </div>
        <div class="col-2"></div>
    </div>



<style>

</style>