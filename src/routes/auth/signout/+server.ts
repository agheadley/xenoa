import { redirect } from '@sveltejs/kit'

import type { RequestHandler } from './$types'


export const GET: RequestHandler = async ({ locals: { supabase } }) => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('signout error',error)
      redirect(303,'/auth/error');
    }
    else console.log('signed out...');
    redirect(303, '/');
}