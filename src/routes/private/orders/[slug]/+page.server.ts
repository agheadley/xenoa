import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends,params,locals: { supabase}}) => {
    depends('supabase:db:jobs');

    
  
    const { data: job } = await supabase.from('jobs').select(`*,transactions(*),prescriptions(*)`).eq('id',Number(params.slug)).single();
    //console.log('/order/[slug]/PageServerLoad',order);
    const { data:fileList, error } = await supabase.storage.from('order-files').list(job?.customer_id, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    job.transactions = job.transactions.sort((a: { created_at: string | number | Date; }, b: { created_at: string | number | Date; }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    let files = fileList ? 
        fileList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(el=>({name:el.name,id:el.id,created_at:el.created_at}))
        : [];

    const { data: config } = await supabase.from('config').select();
   
    const stages=config?.find(el=>el.type==='stages') ? config?.find(el=>el.type==='stages').data : [];
    
    //console.log(stages);
    //console.log(files);
    //const jobData=processJob(job, config.data, fileList ?? []);


    if(error) console.log('/order/[slug]/PageServerLoad error:',error);

    interface Stage {
        type:string,
        level:number,
        files:{name:string,id:string,created_at:string}[]
    };


    let job_data:Stage[]=[];

    stages.forEach((item: { type: any; },i: any)=>{
        let row={type:item.type,level:job.levels[i],files:[]};
        console.log(item.type,i);
        let fns=job.transactions.filter((el: { log: string; type: any; })=>el.log==='file' && item.type===el.type).map((el: { file_name: any; })=>el.file_name).toString();
        let fileData=fileList?.filter(el=>fns.includes(el.name)).map(el=>({name:el.name,id:el.id,created_at:el.created_at}));
        job_data.push({type:item.type,level:job.levels[i],files:fileData?.[0] ? fileData : []}); 
    });

    
    //console.log(job_data);

    //console.log(new Date('2025-10-05T10:56:22.647Z').toLocaleString('en-GB', { day:"numeric",month: 'short',year:"numeric",hour:"2-digit",minute:"2-digit" }));

    return {
        job: job ?? {},
        fileList: fileList ?? [],
        job_data : job_data
        

        
    };

};


