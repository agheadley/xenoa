import { ODOO_API_KEY } from '$env/static/private';
import { ODOO_URL } from '$env/static/private';
import { ODOO_DB} from '$env/static/private';

import { json } from '@sveltejs/kit';

import { Client } from "@pcassima/odoo-jsonrpc";




export const config = {
    runtime: 'edge', // this is a pre-requisite
};

const client = new Client({
    host: ODOO_URL,
    db: ODOO_DB,
    port:443,
    username: 'info@attenborough.com',
    password: ODOO_API_KEY,
});



/* req.type is_staff or is_admin */

export async function POST({request}) {
   // const req = await request.json();
  const recordIds = await client.search(
    'sale.order',
    [['id', '=', 1]],
);

 return json({data:'hello from db/test'});
   

}