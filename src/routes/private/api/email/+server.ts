import { json } from '@sveltejs/kit';
import {RESEND_KEY,ADMIN_EMAILS} from '$env/static/private'
import { Resend } from 'resend';
import {PUBLIC_URL} from '$env/static/public'


/**
 * Send email
 * req.html string
 * req.to string|string[]
 * req.subject string
 * @returns {{isOK:boolean,msg:{}|string}}
 */

export async function POST({request}) {
    const req = await request.json();

    const resend = new Resend(RESEND_KEY);

    //console.log(req);

    const { data, error } = await resend.emails.send({
        from: 'noreply@portal.implantify.eu',
        to: [...req.to,ADMIN_EMAILS],
        subject: req.subject,
        html: `<p>
        <img style="margin: 0; border: 0; padding: 0; display: block;" width="300" src="https://portal.implantify.eu/_app/immutable/assets/logo.2wviG-VA.png"/>
        </p>${req.html}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p><a href="${PUBLIC_URL}">Sign In</a> to access the customer portal</p>
        <p>&nbsp;</p>
        <p>Best wishes</p>
        <p>The Implantify Team</p>`
    });



    return json({error:error,data:data});

   
}