interface Transaction {
    id:number,
    job_id:number,
    customer_id:string,
    type:string,
    level:number,
    log:string,
    created_at:string
}

interface Prescription{
    id:number,
    job_id:number,
    customer_id:string,
    section:string,
    item:string,
    choice:string,
    sort:number,
    created_at:string,
    denture:{i:string,l:string,q:string,r:boolean}[]
}

interface Job {
    id:number,
    staff_id:string,
    staff_email:string,
    customer_id:string,
    customer_email:string,
    first_name:string,
    last_name:string,
    type:string,
    created_at:string,
    transactions:Transaction[],
    precriptions:Prescription[],
    levels:number[]
}

interface ConfigAction {
    action:string,
    begin:{c:boolean,s:boolean,n:string,d:number}[],
    progressing:{c:boolean,s:boolean,n:string,d:number}[],
    completed:{c:boolean,s:boolean,n:string,d:number}[],
    
}

interface FileList {
    created_at:string,
    id:string,
    last_accessed_at:string,
    metadata:any,
    name:string,
    updated_at:string
}

interface ProcessedAction {
    action:string,
    level:number,
    events:{id:number,request_id:number,customer_id:string,type:string,level:number,log:string,created_at:string,user_email:string}[],
    options:{c:boolean,d:number,n:null|'comments'|'upload'|'edit'|'submit'|'start'|'shipped'|'approve'|'restart',s:boolean}[],
    files:{id:string,n:string}[]
}

let progressLevels = {
    0:'begin',
    1:'progressing',
    2:'completed'
};


export const processJob=(job:Job,cfgActions:ConfigAction[],fileList:FileList[]):ProcessedAction[]=>{

    let job_data: ProcessedAction[] | { action: string; level: number; events: Transaction[]; options: any; files: any }[]=[];
    cfgActions.forEach((item,index)=>{
        let e=job.transactions.filter(el=>el.type===item.action)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        let level=job.levels[index];
        //console.log(progressLevels[level]);
        //console.log(item[progressLevels[level]]);
        const progressKey = progressLevels[level as keyof typeof progressLevels] as keyof ConfigAction;
        let options = (item[progressKey] as {c:boolean,s:boolean,n:string,d:number}[]).map(el => ({ ...el }));
        //let row={action:item.action,events:e,level:level,options:options};

        let files=fileList.filter((el: { name: string })=>el.name.includes(item.action) && Number(el.name.split('-')?.[1])===job.id)
            .map((el: { id: any; name: any })=>({id:el.id,n:el.name}));
        let row={action:item.action,level:level,events:e,options:options,files:files};
        
        job_data.push(row);
    });
   
    
    return job_data;
};