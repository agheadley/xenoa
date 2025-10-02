/**
 * This file is necessary to ensure protection of all routes in the `private`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/

import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession ,supabase}, cookies }) => {
  const { session, user } = await safeGetSession();

  if(session===null || user===null) 
    throw redirect(303, '/?next=/private'); 
  // check user account type from profiles, staff table check
  const account = {isStaff:false,isAdmin:false,first_name:'',last_name:'',email:user?.email,id:user?.id};
  //console.log({account});
  const { data : profiles} = await supabase.from('profiles').select();
  //console.log('+layout.server.ts profiles',profiles);
  
  const f=profiles?.find((el: { id: any; })=>el.id===user?.id)
  if(f) {
    account.first_name = f.first_name;
    account.last_name = f.last_name;
    account.isStaff = f.is_staff;
    account.isAdmin = f.is_admin;
    const isApproved = f.is_approved === true ? true : false;
    //console.log('+layout.server.ts',{isApproved});
    if(!isApproved) redirect(303, '/auth/approve'); 


  
  } else {
      throw redirect(303, '/?next=/private'); 
  }

  
  
  let { data : config} = await supabase.from('config').select();
  config = config?.[0] ? config : [];

  let cfg:any={};

  
  for(let item of config) {
    cfg[item.type]=item.data;
  }
  

  //console.log('+layout.server.ts cgf',cfg);
  


  return {
    session,
    user,
    account:account,
    config:cfg,
    profiles: profiles ?? [],
    cookies: cookies.getAll(),
  }
}

