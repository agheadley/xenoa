import { redirect } from '@sveltejs/kit';
//import { error } from '@sveltejs/kit';
import { CALLBACK_URL,RESEND_KEY } from '$env/static/private';
import {PUBLIC_URL} from '$env/static/public';
import type { Actions } from './$types';
import { Resend } from 'resend';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import {SUPABASE_SERVICE_ROLE_KEY} from '$env/static/private';
import { json } from '@sveltejs/kit';

export const config = {
    runtime: 'edge', // this is a pre-requisite
  };

let headers= {
    'Access-Control-Request-Headers': '*',
    'Content-Type': 'application/json',
    'apikey': `${SUPABASE_SERVICE_ROLE_KEY}`,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
};


/**
 * Return admin emails, uses service role key
 * @returns {string[]}
 */




   
  
  

   



export const actions: Actions = {
  signup: async ({ request, locals: { supabase }, fetch}) => {
    const formData = await request.formData()
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const institution = formData.get('institution') as string


  
    console.log('signup...');
    const { error } = await supabase.auth.signUp({ email, password , 
      options: {
      data: {
          first_name: first_name,
          last_name :last_name,
          institution:institution
      }
    }});

    console.log(error);



    if (error) {
        console.error('signup error',error);
        redirect(303, '/auth/error')
    } else {
        console.log('signup worked.Trying to send email ...');

       

    //console.log(req);

    

    let url  =`${PUBLIC_SUPABASE_URL}/rest/v1/profiles?limit=2000&select=email&is_admin=eq.true`;
    

    let response = await fetch(url,{method: 'GET',headers: headers});
    let res=await response.json();
   
    res = res?.[0] ? res.map((el: { email: any; })=>el.email) : [];


    const resend = new Resend(RESEND_KEY);
    const { data, error } = await resend.emails.send({
        from: 'noreply@portal.implantify.eu',
        to: res,
        subject: 'New Customer Application!',
        html: `<p>
        <img style="margin: 0; border: 0; padding: 0; display: block;" width="300" src="https://portal.implantify.eu/_app/immutable/assets/logo.2wviG-VA.png"/>
        </p>
        <p>Please log into the portal to approve application. Customer can't create an order before approval</p>
        <p>${email}</p>
        <p>${first_name}</p>
        <p>${last_name}</p>
        <p>${institution}</p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p><a href="${PUBLIC_URL}">Sign In</a> to access the customer portal</p>
        <p>&nbsp;</p>
        <p>The Implantify Team</p>`
    });

      
        redirect(303, '/auth/signup')
    }


   
   
  },
  login: async ({ request, locals: { supabase } }) => {
    const urlParams = new URLSearchParams(request.url);
    const next = urlParams.get('next') as string;
    
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      redirect(303, '/auth/error');
    } else {
      redirect(303,`${next!==null && next!=='/' ? next : '/private'}`)
    }
  },
  reset: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const urlParams = new URLSearchParams(request.url);
    
    const next= urlParams.get('next') as string;

    //console.log('reset password',CALLBACK_URL);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${CALLBACK_URL}?next=${next}`//`${CALLBACK_URL}?next=/private/account`,

    });
    //console.log(data,error);
    
    if (error) {
      //console.error(error)
      redirect(303, '/auth/error')
    } else {
      //console.log(data);
      redirect(303, '/auth/link')
    }
  },
  
  link:async ({ request, locals: { supabase } }) => {
    const urlParams = new URLSearchParams(request.url);
    const next= urlParams.get('next') as string;

    const formData = await request.formData()
    const email = formData.get('email') as string
    
    console.log(next);

    const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
        // set this to false if you do not want the user to be automatically signed up
        shouldCreateUser: false,
        emailRedirectTo: `${CALLBACK_URL}?next=${next}`,
        },
    })

  
    console.log(data,error);

    if (error) {
        console.error(error)
        redirect(303, '/auth/error')
      } else {
        redirect(303, '/auth/link')
      }

      
      
  }
}