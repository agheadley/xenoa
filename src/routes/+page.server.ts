import { redirect } from '@sveltejs/kit';
//import { error } from '@sveltejs/kit';
import { CALLBACK_URL } from '$env/static/private';
import type { Actions } from './$types';

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const institution = formData.get('institution') as string


  
       
         const { error } = await supabase.auth.signUp({ email, password , 
            options: {
            data: {
                first_name: first_name,
                last_name :last_name,
                institution:institution
            }
        }});

        if (error) {
            console.error(error)
            redirect(303, '/auth/error')
        } else {
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

    console.log('reset password',CALLBACK_URL);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${CALLBACK_URL}?next=${next}`//`${CALLBACK_URL}?next=/private/account`,

    });
    //console.log(data,error);
    
    if (error) {
      //console.error(error)
      redirect(303, '/auth/error')
    } else {
      console.log(data)
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