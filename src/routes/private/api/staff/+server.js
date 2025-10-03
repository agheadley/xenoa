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



/* req.type is_staff or is_admin */

export async function POST({request}) {
    const req = await request.json();

    //const url  =`${SUPABASE_URL}/rest/v1/assessment_table?id=eq.${req.id}&select=${select}`;
    let url  =`${PUBLIC_SUPABASE_URL}/rest/v1/profiles?limit=2000&select=email&${req.type}=eq.true`;
    

    let response = await fetch(url,{method: 'GET',headers: headers});
    let res=await response.json();
   
   
    return json(res);
   
}