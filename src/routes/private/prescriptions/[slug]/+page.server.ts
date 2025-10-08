import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends,params,locals: { supabase}}) => {
    depends('supabase:db:prescriptions');

    
  
    const { data: job,error} = await supabase.from('jobs').select(`*,transactions(*),prescriptions(*)`).eq('id',Number(params.slug)).single();
    //console.log('/order/[slug]/PageServerLoad',order);
    
  
    if(error) console.log('/order/[slug]/PageServerLoad error:',error);

    //console.log(request);

    return {
        job : job ?? {}
    };

};


