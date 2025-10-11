import {alert} from '$lib/state.svelte';


export const toSimpleDate=(dateString:string):string=>{
    return new Date(dateString).toLocaleString('en-GB', { day:"numeric",month: 'short',year:"numeric" });
};

export const toSimpleTime=(dateString:string):string=>{
    return new Date(dateString).toLocaleString('en-GB', { hour:"2-digit",minute: '2-digit',second:"2-digit" });
}

export const capitalize=(str:string):string=>{
    if(str?.[0]) return String(str).charAt(0).toUpperCase() + String(str).slice(1);
    else return '';
};

export const getFileExtension=(filename:string):string=>{
    if (!filename.includes('.') || filename.endsWith('.')) return '';
    return filename.slice(filename.lastIndexOf('.') + 1);
}

export const getFileName=(filename:string):string=>{
    if (!filename.includes('.') || filename.endsWith('.')) return filename;
    return filename.split('.')[0];
}

export const getNewFileName=(filename:string,order_id:number):string=>{
    const d=new Date();
    const ext=getFileExtension(filename);
    const fn=getFileName(filename);
    //return `${fn}-${order_id}-${d.toISOString().split('T')[0].replaceAll('-','')}-${d.toLocaleTimeString("en-GB").replaceAll(':','')}${ext!=='' ? '.'+ext:''}`;
    return `${fn}.${ext}`;
};








export const getAdminEmails=async():Promise<string[]>=>{
      const response = await fetch('/private/api/admins', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: {'content-type': 'application/json'}
      });
      const cc= await response.json();
      //console.log(cc);
      return cc;
};

export const email=async(to:string[],subject:string,html:string):Promise<boolean>=>{

    const response = await fetch('/private/api/email', {
        method: 'POST',
        body: JSON.stringify({to:to,html:html,subject:subject}),
        headers: {'content-type': 'application/json'}
    });
    const res= await response.json();

    if(res.error) {
        console.log('error sending email',res.error);
        return false;
    } else return true;
    
   
};


export const log=async(user_id:string,user_email:string,table_name:string,log:string):Promise<boolean>=>{
   const response = await fetch('/private/api/log', {
        method: 'POST',
        body: JSON.stringify({data:{user_id:user_id,user_email:user_email,table_name:table_name,log:log}}),
        headers: {'content-type': 'application/json'}
    });
    const res= await response.json();
    if(res.error) {
        console.log('error inserting log',res.error);
        return false;
    } else return true;
    
};

export const getCustomers=(profiles:{id:string,first_name:string,last_name:string,email:string,institution:string,is_admin:boolean,is_staff:boolean,is_approved:boolean}[]):{id:string,first_name:string,last_name:string,email:string}[]=>{
    const cs=profiles.filter(((el: { is_approved: any; is_staff: any; is_admin: any; })=>el.is_approved && !el.is_staff && !el.is_admin))
        .map((el: { id: any; email: any; first_name: any; last_name: any; })=>({id:el.id,email:el.email,first_name:el.first_name,last_name:el.last_name}));
    return cs;
};

   interface Transaction {
            id?:number,
            job_id:number,
            customer_id:string,
            user_email:string,
            created_at?:string,
            file_name:string,
            is_new:boolean,
            type:string,
            log:string
        };

export const addTransaction=async(supabase:any,transaction:Transaction,job_type:string,customer_email:string)=>{
    // add transaction

    let msg='';
    const { data,error} = await supabase.from('transactions').insert(transaction).select();
    
    if(error) msg='error adding transaction ';

    // send email
    let to:string[]= [customer_email,...await getAdminEmails()];
    let res=await email(to, `New Activity, ${job_type} `, `<p>Area : ${transaction.type}</p><p>Log : ${transaction.log}</p>`);
    if(!res) msg+='error sending email';

    if(msg!=='') {
        alert.type='error';
        alert.msg=msg;
    }
};

export const updateLevel=async(supabase:any,stages:{type:string}[],job_id:number,levelName:string,levelValue:0|1|2)=>{
    console.log(stages);

    const { data:sdata,error:serr} = await supabase.from('jobs').select('levels').eq('id',job_id).single();

    if(serr) {
        console.log('error retrieving job, levels reset!');
    }
    let l=sdata && sdata?.levels ? sdata.levels : [0,0,0,0,0];
    let f=stages.findIndex(el=>el.type===levelName);
    if(f>-1) l[f]=levelValue;
    console.log(l);

    const { data:udata,error:uerr} = await supabase.from('jobs').update({levels:l}).eq('id',job_id);
    if(uerr) {
            alert.type='error';
            alert.msg='order status level not updated';
    }


};

