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



    let to = req.isToAdmin ? [req.to, ...ADMIN_EMAILS.split(',')] : [req.to];

    //console.log(req,to);

    const { data, error } = await resend.emails.send({
        from: 'noreply@portal.implantify.eu',
        to: to,
        subject: req.subject,
        html: `<p>
        <img style="margin: 0; border: 0; padding: 0; display: block;" width="300" src="https://portal.implantify.eu/_app/immutable/assets/logo.2wviG-VA.png"/>
        </p>${req.html}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>Customer Portal <a href="${PUBLIC_URL}">Sign In</a> to track order progress or send us a message</p>
        <p>&nbsp;</p>
        <p>Best wishes</p>
        <p>The Implantify Team</p>`
    });



    return json({error:error,data:data});

   
}