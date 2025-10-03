import { json } from '@sveltejs/kit';
import {RESEND_KEY} from '$env/static/private'
import { Resend } from 'resend';





/* req.type is_staff or is_admin */

export async function POST({request}) {
    const req = await request.json();

   
   



    const resend = new Resend(RESEND_KEY);

    //console.log(req);

    const { data, error } = await resend.emails.send({
        from: 'noreply@portal.implantify.eu',
        to: req.to,
        subject: req.subject,
        html: `<p><img style="margin: 0; border: 0; padding: 0; display: block;" width="300" src="https://portal.implantify.eu/_app/immutable/assets/logo.2wviG-VA.png"/></p>${req.html}`,
        cc:req.cc
    });



    return json({error:error,data:data});

   
}