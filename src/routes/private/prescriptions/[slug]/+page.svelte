<script lang="ts">
import { onMount } from 'svelte';
import {capitalize, email,addTransaction,updateLevel} from '$lib/util';
import {toSimpleDate,getNewFileName} from '$lib/util';
import Denture from '$lib/Denture.svelte';
import {alert} from '$lib/state.svelte.js';
import Modal from '$lib/Modal.svelte';

import { PDFDocument } from 'pdf-lib';
import { PageSizes } from 'pdf-lib';
import { rgb,degrees,grayscale } from 'pdf-lib';
import { goto } from '$app/navigation';

	

let { data } = $props();
let { account,profiles,supabase,config,job,fileList} = $derived(data);

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
let prescriptions:Prescription[]=$state([]);

let showModal:boolean = $state(true);
let isSubmit:boolean=$state(false);
let lockText:string=$state("prescription");

let fileNames:string[]=$state([]);
let fileCheck:boolean=$state(false);


export const makePrescription = async(teatments:Prescription[])=>{



    const pdfDoc = await PDFDocument.create()

    /* A4 as 595pt*842pt */
   
    const page1 = pdfDoc.insertPage(0, PageSizes.A4)
    //const page2 = pdfDoc.insertPage(1, PageSizes.A4)
   
    page1.drawText(`Prescription - ${job.type} -  ${job.customer_ref} -  ${toSimpleDate(job.created_at)}  `,{size:12,x:20,y:800});
    page1.drawLine({
        start: { x: 20, y: 780 },
        end: { x:560, y: 780 },
        thickness: 1,
        color: rgb(0.75, 0.2, 0.2),
        opacity: 0.75,
    });

    page1.drawText('Surgeon',{size:14,x:20,y:750});

   
    
    prescriptions.filter(el=>el.section==='surgeon').forEach((item,index)=>{
        page1.drawText(String(capitalize(item.item.replaceAll('_',' '))),{size:8,x:20,y:730-index*25});
        page1.drawText(String(item.choice),{size:10,x:20,y:720-index*25});
    });
    


    page1.drawText('Patient',{size:14,x:200,y:750});

    
  
     prescriptions.filter(el=>el.section==='patient' && !el.item.includes('notes')).forEach((item,index)=>{
        page1.drawText(String(capitalize(item.item.replaceAll('_',' '))),{size:8,x:200,y:730-index*25});
        page1.drawText(String(item.choice),{size:10,x:200,y:720-index*25});
    });

      
    page1.drawText('Device',{size:14,x:400,y:750});

    prescriptions.filter(el=>el.section==='device' && !el.item.includes('notes')).forEach((item,index)=>{
        page1.drawText(String(capitalize(item.item.replaceAll('_',' '))),{size:8,x:400,y:730-index*25});
        page1.drawText(String(item.choice),{size:10,x:400,y:720-index*25});
    });
   
   

    page1.drawText('Denture',{size:14,x:20,y:420});

   

    prescriptions.filter(el=>el.section==='denture' && el.item!=='denture' && el.item!=='denture_notes').forEach((item,index)=>{
        page1.drawText(String(capitalize(item.item.replaceAll('_',' '))),{size:8,x:20,y:400-index*25});
        page1.drawText(String(item?.choice) ? String(item.choice) : '',{size:10,x:20,y:390-index*25});
    });

    

    let ur='';
    let ul='';
    let lr='';
    let ll='';
    let f=prescriptions.find(el=>el.item==='denture');

   
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

    



    page1.drawText('Dentures Required',{size:10,x:20,y:320});
      
    page1.drawText(`UR ${ur}`,{size:10,x:20,y:300});
    page1.drawText(`UL ${ul}`,{size:10,x:100,y:300});
    page1.drawText(`LR ${lr}`,{size:10,x:20,y:285});
    page1.drawText(`LL ${ll}`,{size:10,x:100,y:285});
    page1.drawLine({
        start: { x: 20, y: 295},
        end: { x:150, y: 295 },
        thickness: 1,
        color: rgb(0, 0, 0),
        opacity: 0.75,
    });
     page1.drawLine({
        start: { x: 95, y: 310},
        end: { x:95, y: 280 },
        thickness: 1,
        color: rgb(0, 0, 0),
        opacity: 0.75,
    });


    const pngUrl='/jaw_200_400.png';
    const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
    console.log('png',pngImageBytes);

    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    page1.drawImage(pngImage, {
        x: 200,
        y: 50,
        width: 200,
        height: 400,
      })


    f=prescriptions.find(el=>el.item==='denture');


    page1.drawText(`UR`,{size:10,x:200+70,y:50+400-180});
    page1.drawText(`UL`,{size:10,x:200+110,y:50+400-180});
    page1.drawText(`LR`,{size:10,x:200+70,y:50+400-220});
    page1.drawText(`LL`,{size:10,x:200+110,y:50+400-220});


    for(let item of config.denture) {

        page1.drawText(`${item.i}`,{
                size:8,x:200+item.xi[0],y:50+400-item.xi[1]
            
        });



        if(f?.denture.find(el=>el.l===item.l && el.q===item.q && el.r===true))  {
            console.log(item.r,item.q,item);

           

            page1.drawCircle({
                x: 200+item.xt[0],
                y: 50+400-item.xt[1],
                size: 8,
                borderWidth: 0,
                borderColor: grayscale(0.5),
                color: rgb(0.15,0.7,0.1),
                opacity: 0.5,
                borderOpacity: 1
            })
        }  

    }
    

    const pdfBytes = await pdfDoc.save()
    console.log(pdfBytes);
    const byteArray = new Uint8Array(pdfBytes);


   
    return byteArray;

};


const createPDF=async()=>{
	const byteArray = await makePrescription(prescriptions);
    console.log(byteArray);

    
    // testing
    //lockText=String(Date.now());

    const fn=getNewFileName(`${lockText}_${job.id}.pdf`,job.id);
    
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

		let x:Transaction={
			customer_id:job.customer_id,
			type:'prescription',
			log:'file',
			user_email:String(account.email),
			job_id:job.id,
			is_new:true,
			file_name:fn
		};

        console.log(x);

		let res=await addTransaction(supabase,x);


        let f=prescriptions.find(el=>el.section==='patient' && el.item==='first_name');
        let l=prescriptions.find(el=>el.section==='patient' && el.item==='last_name');
        
        let pn = f && l ? f.choice+' '+l.choice : '';

        let html=`
        <p></p>
        <p>Prescription Completed</p>
        <p>${job.first_name} ${job.last_name} ${job.customer_email}</p>
        <p></p>
        <p>Order  <b>${job.type}</b></p>
        <p>Customer Reference <b>${job.customer_ref}</b></p>
        <p>Patient Name <b>${pn}</b>
        <p></p>
        <p>You will need to complete the prescription and upload scan(s). Please sign in to view advice on required scans.</p>
        <p></p>
        `;
        let res2=await email(job.customer_email,'Implantify - Prescription Completed',html,true);
       


        await updateLevel(supabase,config.stages,job.id,'prescription',1);
       
		lockText='';
        showModal=false;
        goto(`/private/orders/${job.id}`);
        
    }


};


const lock=()=>{
	lockText="prescription";
    fileCheck=fileNames.includes(`${lockText}_${job.id}.pdf`) ? true : false;

	isSubmit=true;
	showModal=true;
};


const store=async(index:number)=>{
    console.log('store',prescriptions[index].item,prescriptions[index].id,prescriptions[index].choice);
    const {error} = await supabase.from('prescriptions').update({ choice:prescriptions[index].choice }).eq('id', prescriptions[index].id);
	if(error) {
        alert.type='error';
        alert.msg=`Error storing ${capitalize(prescriptions[index].item.replaceAll('_',' '))}`;
    }		
};

const validate=()=>{

	lockText=lockText.replace(/[^a-zA-Z0-9-_]+$/g,'');
	lockText = lockText.length>15 ? lockText.slice(0,15) : lockText;
    fileCheck=fileNames.includes(`${lockText}_${job.id}.pdf`) ? true : false;

};


onMount(async() => {
   console.log('job',job);
  
  
   
   prescriptions=job.prescriptions.map((el: any)=>({...el}))
    .sort((a: { section: any; sort: number; },b: { section: string; sort: number; })=>b.section.localeCompare(a.section) || a.sort-b.sort);

    let f=prescriptions.findIndex(el=>el.item==='implant_type');
    if(f>-1) prescriptions[f].choice=job.type;

    fileNames=fileList.map(el=>el.name);
    //console.log(fileNames);

   
    //for(let item of prescriptions) console.log(item.section,item);
});



</script>

{#if showModal && !isSubmit}
    <Modal bind:showModal>
    {#snippet header()}
    <h3>Patient Prescriptions</h3>
    {/snippet} 
	<p>Prescriptions are <b>AUTOMATICALLY SAVED</b> as you enter data.</p>
	<p>Use <button disabled class="button primary">Lock & Create Final PDF</button> when you are ready to submit it as a PDF for the Implantify team.</p> 
	<p><button class="button outline" onclick={()=>showModal=false}>Close</button></p>
    </Modal>

{/if}



{#if showModal && isSubmit}
	<Modal bind:showModal>
    {#snippet header()}
    <h3>Lock & Create PDF</h3>
    {/snippet} 

	<p>Create a PDF when you have completed the prescription.</p>

	<p>Enter file name (max 15 characters)</p>
	<p><input type=text bind:value={lockText} oninput={validate}/></p>
    {#if fileCheck}
    <p class="text-error">Duplicate file name detected please change.</p>
    {:else}
    <p>&nbsp;</p>
    {/if}
	<p>
		<button class="button primary" disabled={lockText=='' || fileCheck} onclick={createPDF}>Create PDF</button>
		<button class="button outline" onclick={()=>showModal=false}>Cancel</button>
	</p>
    </Modal>
{/if}

<div class="row">
	<div class="col">
		   {job.type} <i>{job.customer_ref}</i>
	</div>


</div>

<p>
	<a href={`/private/orders/${job.id}`} class="button outline">Back</a>
	<button class="button primary"  onclick={lock}>Lock & Create Final PDF</button>
</p>
<div class="row">
    <div class="col">
        <h4>Surgeon</h4>
        {#each prescriptions as row,rowIndex}
            {#if row.section==='surgeon'}
            <label>{#if row.item==='code'}Postal/ZIP Code{:else}{capitalize(row.item.replaceAll('_',' '))}{/if}
            {#if row.item!=='country'}
            <input type=text bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {:else}
                 <select bind:value={row.choice} onchange={()=>store(rowIndex)}>
                {#each config.countries.sort() as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
            {/if}
            </label>
            {/if}
        {/each}
    </div>

     <div class="col">
        <h4>Patient</h4>
         {#each prescriptions as row,rowIndex}
            {#if row.section==='patient'}
            <label>
                {#if !row.item.includes('notes')}
                {capitalize(row.item.replaceAll('_',' '))}
                {:else}&nbsp;
                {/if}
            {#if row.item.includes('notes')}
              <!--<textarea rows=5 bind:value={row.choice} onblur={()=>store(rowIndex)}></textarea>-->
           
            {:else if row.item.includes('date')}
             <input type=date bind:value={row.choice} onblur={()=>store(rowIndex)}/>
             <i class="text-error">Please take sterilisation time into account</i>
             <br/>
           
            {:else}
               <input type=text bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {/if}
            </label>
            {/if}
        {/each}
    </div>
</div>
<div class="row">
    <div class="col">
        <h4>Device</h4>
          {#each prescriptions as row,rowIndex}
             {#if row.section==='device'}
            
             
             <label>
                {#if !row.item.includes('notes')}
                {capitalize(row.item.replaceAll('_',' '))}
                {:else}&nbsp;
                {/if}
            
            {#if row.item.includes('notes')}
             <!--<textarea rows=5 bind:value={row.choice} onblur={()=>store(rowIndex)}></textarea>-->
            
            {:else if row.item==='implant_type'}
               <input disabled type=text bind:value={row.choice}/>
            {:else if row.item==='surface_type'}
                <select bind:value={row.choice} onchange={()=>store(rowIndex)} >
                {#each ['Mirror','Sandblasted','Anodized'] as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
            {:else if row.item==='bone_integration'}
                   <select bind:value={row.choice} onchange={()=>store(rowIndex)} >
                {#each ['Mesh','No mesh (smooth surface)'] as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>

            {:else if row.item.includes('dentition_type')}
             <select bind:value={row.choice} onchange={()=>store(rowIndex)}>
                {#each ['Provisional Dentition','Definitive Dentition'] as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
            {:else}
               <input type=text bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {/if}
            </label>
            {/if}
        {/each}
    </div>

     <div class="col">
        <h4>Denture</h4>
         {#each prescriptions as row,rowIndex}
             {#if row.section==='denture'}
            <label>
                {#if !row.item.includes('notes')}
                {capitalize(row.item.replaceAll('_',' '))}
                {:else}&nbsp;
                {/if}
            {#if row.item==='denture'}
      
             <Denture bind:denture={row.denture} cfg={config.denture} supabase={supabase} prescription_id={row.id}></Denture>
              
            {:else if row.item==='denture_shade'}
             <select bind:value={row.choice} onchange={()=>store(rowIndex)}>
                {#each config.denture_shades as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
            {:else if row.item==='denture_palatal'}
                  <select bind:value={row.choice} onchange={()=>store(rowIndex)}>
                {#each ['Include in prosthesis','Not required'] as el}
                    <option value={el}>{el}</option>
                {/each}
                </select>
                
            {:else if row.item.includes('notes')}
                 <!--<textarea rows=5 bind:value={row.choice} onblur={()=>store(rowIndex)}></textarea>  -->      
            
            {:else}
                <input type=text bind:value={row.choice} onblur={()=>store(rowIndex)}/>
            {/if}
            </label>
            {/if}
        {/each}
    </div>
</div>
<p>
	<a href={`/private/orders/${job.id}`} class="button outline">Back</a>
	<button class="button primary" onclick={lock}>Lock & Create Final PDF</button>
</p>




<style>
	/*
.strong {
    font-weight:500;

}
	*/
</style>