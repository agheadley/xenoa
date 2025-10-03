import type { PageServerLoad } from './$types';
import {supabaseB} from '$lib/supabaseClient.js';

//import { createClient } from '@supabase/supabase-js';
export const load: PageServerLoad = async ({ depends, locals: { supabase } }) => {
  depends('supabase:db:profiles');



  
  
  /* harvest data */
  const { data : customers} = await supabase.from('profiles').select().order('is_approved', { ascending: true }).order('last_name',{ascending:true});

  //console.log({customers});

   
  return {
    profiles:customers ?? []
  

  };
}
