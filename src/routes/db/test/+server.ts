import { ODOO_API_KEY } from '$env/static/private';
import { ODOO_URL } from '$env/static/private';
import { ODOO_DB} from '$env/static/private';

import { json } from '@sveltejs/kit';


export const config = {
    runtime: 'edge', // this is a pre-requisite
};





/* req.type is_staff or is_admin */

export async function POST({request}) {
    const req = await request.json();
    
     const headers = {
        "Content-Type": "application/json",
        "Authorization": "bearer " + ODOO_API_KEY,
        "X-Odoo-Database": ODOO_DB,
    }
  
    const reqRead = {
        method: "POST",
        headers: headers,
        body: {
            ids: ['*'],
            context: {lang: "en_US"},
            fields: ["*"],
        },
    };
    const resRead = await fetch(ODOO_URL + "/sale.order/read", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({  ids: ['*'],context: { lang: "en_US" },fields: ["*"] })
    });


    //console.log(resRead);

   




    
     return json({data:'hello from db/test'});
   
   
}