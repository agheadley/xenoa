import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import {SUPABASE_SERVICE_ROLE_KEY} from '$env/static/private';
import { json } from '@sveltejs/kit';
import {RESEND_KEY} from '$env/static/private'
import { Resend } from 'resend';



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
   
    //console.log(res);

    const emails=res.map((/** @type {{ email: any; }} */ el: { email: any; })=>el.email);
    //console.log(emails);

    if(!emails?.[0]) return json({error:'No email addresses found',data:{}});

    const resend = new Resend(RESEND_KEY);

    //console.log(req);

    const { data, error } = await resend.emails.send({
        from: 'noreply@portal.implantify.eu',
        to: emails,
        subject: req.type==='is_admin' ? 'Admin Action Required' : 'Staff Action Required',
        html: `<p><img style="margin: 0; border: 0; padding: 0; display: block;" width="300" src="https://portal.implantify.eu/_app/immutable/assets/logo.2wviG-VA.png"/></p>${req.html}`
    });



     return json({error:error,data:data});
   
   
}