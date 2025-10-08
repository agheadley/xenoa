<script lang="ts">
import Modal from '$lib/Modal.svelte';
import { onMount } from 'svelte';
import * as icon from '$lib/icon';
import {alert} from '$lib/state.svelte';

import {PUBLIC_SUPABASE_URL} from '$env/static/public';
import { PDFDocument } from 'pdf-lib';
import { PageSizes } from 'pdf-lib';
import { rgb } from 'pdf-lib'
    
import {toSimpleDate,capitalize,email,getAdminEmails,getStagedFileName} from '$lib/util';

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
}
let prescriptions:Prescription[]=[];

let { isUpdate = $bindable(),showModal=$bindable(),supabase,account,action,job,session} = $props();

let submitText=$state('');



export const makePrescription = async(teatments:Prescription[])=>{



    const pdfDoc = await PDFDocument.create()

    /* A4 as 595pt*842pt */
   
    const page1 = pdfDoc.insertPage(0, PageSizes.A4)
    const page2 = pdfDoc.insertPage(1, PageSizes.A4)
   
    page1.drawText(`Prescription ${job.type} ${job.customer_ref} ${toSimpleDate(job.created_at)}  `,{size:12,x:20,y:800});
    page1.drawLine({
        start: { x: 20, y: 780 },
        end: { x:560, y: 780 },
        thickness: 1,
        color: rgb(0.75, 0.2, 0.2),
        opacity: 0.75,
    });

    page1.drawText('Surgeon',{size:14,x:20,y:750});

    
    prescriptions.filter(el=>el.section==='surgeon').forEach((item,index)=>{
        page1.drawText(String(capitalize(item.item.replaceAll('_',' '))),{size:10,x:20,y:730-index*15});
        page1.drawText(String(item.choice),{size:10,x:250,y:730-index*15});
    });
    


    page1.drawText('Patient',{size:14,x:20,y:500});
  
     prescriptions.filter(el=>el.section==='patient' && !el.item.includes('notes')).forEach((item,index)=>{
        page1.drawText(String(capitalize(item.item.replaceAll('_',' '))),{size:10,x:20,y:480-index*15});
        page1.drawText(String(item.choice),{size:10,x:250,y:480-index*15});
    });
       let f=prescriptions.find(el=>el.item==='prescription_notes');
       if(f) {
        page1.drawText(String(capitalize(f.item.replaceAll('_',' '))),{size:10,x:20,y:380});
        page1.drawText(String(f.choice) , {
            x: 20,
            y: 360,
            size: 10,
            maxWidth: 500,
            wordBreaks: [" "],
            lineHeight: 15,
            color: rgb(0, 0, 0),
        });
    }
 




    page2.drawText('Device',{size:14,x:20,y:800});

    
    prescriptions.filter(el=>el.section==='device' && !el.item.includes('notes')).forEach((item,index)=>{
        page2.drawText(String(capitalize(item.item.replaceAll('_',' '))),{size:10,x:20,y:780-index*15});
        page2.drawText(String(item.choice),{size:10,x:250,y:780-index*15});
    });
    f=prescriptions.find(el=>el.item==='specification_notes');
    if(f) {
        page2.drawText(String(capitalize(f.item.replaceAll('_',' '))),{size:10,x:20,y:620});
        page2.drawText(String(f.choice) , {
            x: 20,
            y: 600,
            size: 10,
            maxWidth: 500,
            wordBreaks: [" "],
            lineHeight: 15,
            color: rgb(0, 0, 0),
        });
    }
   
        
   

   



   

    

    page2.drawText('Denture',{size:14,x:20,y:420});

 
    prescriptions.filter(el=>el.section==='denture' && el.item!=='denture' && el.item!=='denture_notes').forEach((item,index)=>{
        page2.drawText(String(capitalize(item.item.replaceAll('_',' '))),{size:10,x:20,y:400-index*15});
        page2.drawText(String(item?.choice) ? String(item.choice) : '',{size:10,x:250,y:400-index*15});
    });

    f=prescriptions.find(el=>el.item==='denture_notes');
    if(f) {
       
        page2.drawText(String(capitalize(f.item.replaceAll('_',' '))),{size:10,x:20,y:310});
        page2.drawText(String(f.choice) ? String(f.choice) : '', {
            x: 20,
            y: 290,
            size: 10,
            maxWidth: 500,
            wordBreaks: [" "],
            lineHeight: 15,
            color: rgb(0, 0, 0),
      
        });
    }

    let ur='';
    let ul='';
    let lr='';
    let ll='';
    f=prescriptions.find(el=>el.item==='denture');

   
    if(f) {
        console.log(f.denture);
        ur=f.denture.filter(el=>el.q==='ur' && el.r).map(el=>el.i).sort().toString().replaceAll(',','');
        ul=f.denture.filter(el=>el.q==='ul' && el.r).map(el=>el.i).sort().toString().replaceAll(',','');
        lr=f.denture.filter(el=>el.q==='lr' && el.r).map(el=>el.i).sort().toString().replaceAll(',','');
        ll=f.denture.filter(el=>el.q==='ll' && el.r).map(el=>el.i).sort().toString().replaceAll(',','');
        console.log('ur',ur);
        console.log('ul',ul);
        console.log('lr',lr);
        console.log('ll',ll);
    }



    page2.drawText('Dentures Required',{size:10,x:20,y:100});
      
    page2.drawText(`UR ${ur}`,{size:10,x:20,y:80});
    page2.drawText(`UL ${ul}`,{size:10,x:100,y:80});
    page2.drawText(`LR ${lr}`,{size:10,x:20,y:65});
    page2.drawText(`LL ${ll}`,{size:10,x:100,y:65});
    page2.drawLine({
        start: { x: 20, y: 75},
        end: { x:150, y: 75 },
        thickness: 1,
        color: rgb(0, 0, 0),
        opacity: 0.75,
    });
     page2.drawLine({
        start: { x: 95, y: 90},
        end: { x:95, y: 60 },
        thickness: 1,
        color: rgb(0, 0, 0),
        opacity: 0.75,
    });
    

    const pdfBytes = await pdfDoc.save()
    console.log(pdfBytes);
    const byteArray = new Uint8Array(pdfBytes);


    //console.log(byteArray);

    return byteArray;

};



const sendEmail=async()=>{
    // if user===customer then send to staff / admin, if user is staff, then send to customer.
    if(job.staff_email==='') {
        let html=`
        <p>${job.customer_email} ${job.type} ${job.customer_ref}</p>
        <p>New Activity on this order, please assign staff.</p>
         <p><a href="https://portal.implantify.eu/auth/signin">Manage orders</a></p>
       
        `;
        //let res=await emailAdminList(html);
    } else {
        let to = account.email === job.customer_email ? job.staff_email : job.customer_email;
        let html=`
        <p>${job.customer_email} ${job.type} ${job.customer_ref}</p>
        <p>Prescription submitted and locaked.</p>
        <p>File uploaded</p>
        <p></p>
        <p><a href="https://portal.implantify.eu/auth/signin?next=/private/jobs/${job.id}">Manage this order</a></p>
        <p></p>
        <p></p>
        
        <p>The Implantify Team</p>
        `;
        let res=await email(to,`${job.type} ${job.customer_ref}`,html);
    }
};


const create=async()=>{
     const byteArray = await makePrescription(prescriptions);
    console.log(byteArray);

    console.log();
    const fn=getStagedFileName('x.pdf','prescription',job.id);
    
    const { data, error } = await supabase
    .storage
    .from('order-files')
    .upload(`${job.customer_id}/${fn}`, byteArray, {
        cacheControl: '3600',
        upsert: false
    });
    if(error) {
        console.log(error);
        alert.type='error';
        alert.msg='error creating prescription file';
    } else {
        await sendEmail();
        submitText='';
        showModal=false;
        isUpdate=true;
    }
};

$effect(() => {
});


onMount(async() => {
   const {data,error} = await supabase.from('prescriptions').select().eq('job_id',job.id);
   if(!error) {
    prescriptions=data;
     prescriptions=job.prescriptions.map((el: any)=>({...el}))
    .sort((a: { section: any; sort: number; },b: { section: string; sort: number; })=>b.section.localeCompare(a.section) || a.sort-b.sort);

    let f=prescriptions.find(el=>el.item==='implant_type');
    if(f) f.choice=job.type;

   } else {
    alert.type='error';
    alert.msg='error loading data';
   }
   console.log(prescriptions);


  
    
});


</script>


{#if showModal}
<Modal bind:showModal>
  {#snippet header()}
  <h3>Submit Prescription</h3>
  {/snippet}
    <p><span class='tag'>Submitting will lock the prescription and generate a prescription pdf file for viewing.</span></p>
   
    <p>
        Type <span class='strong text-error'>submit prescription</span> to save and lock
    </p>
    <p>
        <input type=text bind:value={submitText}/>
    </p>   
  <p>
     <button  disabled={submitText!=='submit prescription'} class="button primary" onclick={create}>Create & Lock</button>
    <button class="button outline" onclick={()=>showModal=false}>Cancel</button>
</p>


</Modal>
{/if}


<style>




.strong {
    font-weight:500;

}






</style>