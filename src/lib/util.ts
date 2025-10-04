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

export const getStagedFileName=(filename:string,stage:string|null,order_id:number):string=>{
    const d=new Date();
    const ext=getFileExtension(filename);
    return `${stage!==null ? stage:'xxx'}-${order_id}-${d.toISOString().split('T')[0].replaceAll('-','')}-${d.toLocaleTimeString("en-GB").replaceAll(':','')}${ext!=='' ? '.'+ext:''}`;
    
};




export const email=async(to:string,subject:string,html:string,cc:string[]=[]):Promise<{isOK:boolean,msg:string}>=>{
    const response = await fetch('/private/api/email', {
        method: 'POST',
        body: JSON.stringify({to:to,html:html,subject:subject,cc:cc}),
        headers: {'content-type': 'application/json'}
    });
    const res= await response.json();
    
    return res.error===null ? {isOK:true,msg:'email sent'} : {isOK:true,msg:res.error};
};

export const log=async(user_id:string,user_email:string,table_name:string,log:string):Promise<{isOK:boolean,msg:string}>=>{
   const response = await fetch('/private/api/log', {
        method: 'POST',
        body: JSON.stringify({data:{user_id:user_id,user_email:user_email,table_name:table_name,log:log}}),
        headers: {'content-type': 'application/json'}
    });
    const res= await response.json();
    //console.log('log res',res);
    return {isOK:res.isOK,msg:res.msg};
    
};
