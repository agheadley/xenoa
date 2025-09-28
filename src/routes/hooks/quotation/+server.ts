
import { json } from '@sveltejs/kit';


export const config = {
    runtime: 'edge', // this is a pre-requisite
};





/* req.type is_staff or is_admin */

export async function POST({request}) {
    const req = await request.json();
    
    console.log(req);
   




    
     return json({data:'hello from db/test',req:req});
   
   
}