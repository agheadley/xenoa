import type { PageServerLoad } from './$types';
import {processJob} from '$lib/job';

export const load: PageServerLoad = async ({ depends,params,locals: { supabase}}) => {
    depends('supabase:db:reqests');

    
  
    const { data: job } = await supabase.from('jobs').select(`*,transactions(*),prescriptions(*)`).eq('id',Number(params.slug)).single();
    //console.log('/order/[slug]/PageServerLoad',order);
    const { data:fileList, error } = await supabase.storage.from('order-files').list(job?.customer_id, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    let files = fileList ? 
        fileList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(el=>({name:el.name,id:el.id,created_at:el.created_at}))
        : [];

    const { data: config } = await supabase.from('config').select();
   
    const stages=config?.find(el=>el.type==='stages') ? config?.find(el=>el.type==='stages').data : [];
    
    //console.log(stages);
    console.log(files);
    //const jobData=processJob(job, config.data, fileList ?? []);


    if(error) console.log('/order/[slug]/PageServerLoad error:',error);

    interface Stage {
        type:string,
        level:number,
        files:{name:string,id:string,created_at:string}[]
    };

    //console.log(new Date('2025-10-05T10:56:22.647Z').toLocaleString('en-GB', { day:"numeric",month: 'short',year:"numeric",hour:"2-digit",minute:"2-digit" }));

    return {
        job: job ?? {},
        fileList: fileList ?? []
        

        
    };

};


