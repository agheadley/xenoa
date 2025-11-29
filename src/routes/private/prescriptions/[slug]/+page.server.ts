import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends,params,locals: { supabase}}) => {
    depends('supabase:db:prescriptions');

    
  
    const { data: job,error} = await supabase.from('jobs').select(`*,transactions(*),prescriptions(*)`).eq('id',Number(params.slug)).single();
    //console.log('/order/[slug]/PageServerLoad',order);

     const { data:fileList, error:ferr } = await supabase.storage.from('order-files').list(job?.customer_id, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
     let files = fileList ? 
        fileList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(el=>({name:el.name,id:el.id,created_at:el.created_at}))
        : [];

    
  
    if(error) console.log('/order/[slug]/PageServerLoad error:',error);

    //console.log(request);

    return {
        job : job ?? {},
        fileList:fileList ?? []
    };

};


