import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends,params,locals: { supabase }}) => {
    depends('supabase:db:requests');

    
    const { data: jobs} = await supabase.from('jobs').select('*').order('created_at',{ ascending: false });
    
    interface Transaction {
        name:string
    };

    interface Prescription {
        name:string
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


    const jobData:Job[] = jobs?.[0] ? jobs.map(el=>({...el,transactions:[],prescriptions:[],total:el.levels.reduce((acc: number,curr:number)=>acc+curr,0)})) : [];
    
    return {
       jobs:jobData??[]
    };

};


