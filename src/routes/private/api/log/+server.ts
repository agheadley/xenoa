import { json } from '@sveltejs/kit';

export async function POST({request,locals}) {
    const req = await request.json();
    
   

    //console.log('INSERT req',JSON.stringify(req));
    const { data,error } = await locals.supabase.from('log').insert(req.data).select();;
    //console.log('log error',error);
    if(error) return json({isOK:false,msg:error});
    else return json({isOK:true,msg:'log entry created'});
   
};