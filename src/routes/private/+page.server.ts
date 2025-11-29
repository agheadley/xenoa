import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends,params,locals: { supabase }}) => {
    depends('supabase:db:jobs');

    
    const { data: jobs} = await supabase.from('jobs').select('*,transactions(*)').order('created_at',{ ascending: false });
    
    interface Transaction {
        id:number,
        job_id:number,
        customer_id:string,
        user_email:string,
        created_at:string,
        file_name:string,
        is_new:boolean,
        type:string,
        log:string
    };

    interface Prescription {
        id:number,
        job_id:number,
        customer_id:string,
        created_at:string,
        section:string,
        item:string,
        sort:number,
        choice:string,
        denture:{i:string,l:string,q:string,r:boolean}[]
    };

    interface Job {
        id:number,
        staff_id:string,
        staff_email:string,
        customer_id:string,
        customer_email:string,
        customer_ref:string,
        first_name:string,
        last_name:string,
        type:string,
        created_at:string,
        levels:number[],
        total:number,
        transactions:Transaction[],
        prescriptions:Prescription[]

    };


    const jobData:Job[] = jobs?.[0] ? jobs.map(el=>({...el,prescriptions:[],total:el.levels.reduce((acc: number,curr:number)=>acc+curr,0)})) : [];
    
    return {
       jobData:jobData??[]
    };

};


