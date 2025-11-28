<script lang="ts">
import { invalidate ,goto} from '$app/navigation';
import { onMount } from 'svelte';
import {email,addTransaction,updateLevel,capitalize} from '$lib/util';
import * as icon from '$lib/icon';
import {toSimpleDate} from '$lib/util';
import {alert} from '$lib/state.svelte.js';

import { tick } from 'svelte';
import {PUBLIC_SUPABASE_URL} from '$env/static/public';
import * as tus from 'tus-js-client';

import Modal from '$lib/Modal.svelte';

let { data } = $props();
let { account,profiles,supabase,job,fileList,job_data,config,session} = $derived(data);

let showModal : boolean = $state(true);
let isUpdate : boolean  = $state(false);


let isMessage : boolean = $state(false);
let isDelete : boolean = $state(false);
let deleteType : string = $state('');
let deleteName : string=$state('');

let logText:string=$state('');
let deleteText:string=$state('');

let isTransaction : boolean = $state(false);
let transactionType:string = $state('');
let transactionText:string = $state('');
let approveText:string=$state('');
let transactionComment:string = $state('');

let isUpload : boolean = $state(false);
let uploadName:string = $state('');
let uploadType:string = $state('');
let uploadPercentage:number = $state(0);
let files:any = $state();
let uploadComplete=$state(false);
let uploadError=$state(false);

let patientName='';

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


const download=async(fn:string)=>{
    let t=Date.now();
    //console.log('supabase download started',t/1000);
    const { data } = await supabase.storage
    .from('order-files')
    .createSignedUrl(`${job.customer_id}/${fn}`,120, {
        download: true,
    });
    //console.log('supabase download finished',Date.now()/1000-t/1000,data);
    if(data) {


		let a = document.createElement('a');
		a.href = data.signedUrl.toString();
		a.download = fn;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
    
	}
};


const openUpload=(type:string)=>{
    uploadType=type;
    uploadName='';
    isMessage=false;
    isDelete=false;
    isTransaction=false;
    isUpload=true;

    uploadPercentage=0;

    showModal=true;

};

const openDelete=(fileName:string,type:string)=>{
    deleteName=fileName;
    deleteType=type;

    isTransaction=false;
    isMessage=false;
    isUpload=false;

    isDelete=true;
    showModal=true;
};

const openMessages=()=>{
    isDelete=false;
    isTransaction=false;
    isUpload=false;

    isMessage=true;
    showModal=true;
};

const openTransaction=(type:string,text:string)=>{
    transactionType=type;
    transactionText=text;
    transactionComment='';
    approveText='';

    isMessage=false;
    isDelete=false;
    isUpload=false;
    isTransaction=true;

    showModal=true;
};

const processTransaction=async()=>{


    let log=`${transactionType} ${transactionText}. Comments: ${transactionComment}`;

    let content='';
    let subject='Implantify - New Activity';

    let isToAdmins=false;

    if(transactionText==='approve') {
        log=`${transactionType} approved by ${account.email}`;
        isToAdmins=true;
        subject=`Implantify - ${capitalize(transactionType)} Approved`;
        content=`<p>${capitalize(transactionType)} Approved</p>
        <p>Please check in with your order and contact the team quickly if you have any concerns.</p>
        `;
    } else {
        log = transactionText === 'ship' ? 'product shipped' : log;
        log = transactionText === 'start' ? 'manufacture started' : log;
        subject = transactionText === 'ship' ? 'Implantify - Product Shipped' : subject;
        subject = transactionText === 'start' ? 'Implantify - Manufacture Started' : subject;
        content= transactionText === 'ship'  ?`<p>Product Shipped</p>
        <p>${transactionComment}</p>
        ` : content;
          content= transactionText === 'start'  ?`<p>Manufacture Started</p>
        <p>${transactionComment}</p>
        ` : content;
       
    }

    let x:Transaction={
			customer_id:job.customer_id,
			type:transactionType,
			log:log,
			user_email:String(account.email),
			job_id:job.id,
			is_new:true,
			file_name:''
	};
    let res=await addTransaction(supabase,x);



    let html=`
        <p></p>
        <p>${job.first_name} ${job.last_name} ${job.customer_email}</p>
        <p></p>
        <p>Order  <b>${job.type}</b></p>
        <p>Customer Reference <b>${job.customer_ref}</b></p>
        <p>Patient Name <b>${patientName}</b>
        <p></p>
        <p>${content}</p>
        <p></p>
        `;
    let res2=await email(job.customer_email,subject,html,isToAdmins);
       





    let l : 0|1|2 = 0;

    console.log(transactionText);

    if(transactionText==='approve') {
        l =2 ;
    } else {
         l =0;
         l = transactionText === 'ship' ? 2 : l;
         l = transactionText === 'start' ? 1 : l;
         
    }

    await updateLevel(supabase,config.stages,job.id,transactionType,l);

    transactionType='';
    transactionText='';
    transactionComment='';
    isTransaction=false;
    showModal=false;
    
    invalidate('supabase:db:jobs');

};

const removeFile=async()=>{
    console.log('deleting file...',deleteName);
    const { data, error } = await supabase.storage.from('order-files')
        .remove([`${job.customer_id}/${deleteName}`]);
    console.log(data,error);
    if(error) {
        alert.type='error';
        alert.msg='error deleting file';
    } else {
         	let x:Transaction={
			customer_id:job.customer_id,
			type:deleteType,
			log:`deleted file ${deleteName}`,
			user_email:String(account.email),
			job_id:job.id,
			is_new:true,
			file_name:deleteName
		};

        console.log(x);

		let res=await addTransaction(supabase,x);
      

        let f=job_data.findIndex(el=>el.type===deleteType);
        let count=f>-1 && job_data[f].files?.length ? job_data[f].files.length : 0;
        if(count<2) {
            console.log('removing last file, returning status level to 0');
             await updateLevel(supabase,config.stages,job.id,deleteType,0);
        } else {
            console.log('other files exist, keep status at level 1');
             await updateLevel(supabase,config.stages,job.id,deleteType,1);
        }
      
    

    }

    invalidate('supabase:db:jobs');

        

    deleteName='';
    deleteText='';
    isDelete=false;
    showModal=false;
};

let addMsg=async()=>{
    
    	

		let x:Transaction={
			customer_id:job.customer_id,
			type:'message',
			log:logText,
			user_email:String(account.email),
			job_id:job.id,
			is_new:true,
			file_name:''
		};

        console.log(x);

		let res=await addTransaction(supabase,x);
        
        let html=`
        <p></p>
        <p>${job.first_name} ${job.last_name} ${job.customer_email}</p>
        <p></p>
        <p>Order  <b>${job.type}</b></p>
        <p>Customer Reference <b>${job.customer_ref}</b></p>
        <p>Patient Name <b>${patientName}</b>
        <p></p>
        <p>${logText}</p>
        <p></p>
        `;
        let subject = account.email===job.customer_email ? 'Implantify - New Message Sent to The Implantify Team' : 'Implantify - new Message from Customer';
        let res2=await email(job.customer_email,subject,html,account.email===job.customer_email ? true : false);

    
        logText='';
        isMessage=false;
        showModal=false;
        isUpdate=true;
};



const upload=async()=>{

    console.log('upload file',files[0]);

    let x= uploadName.split('.');
    uploadName=`${x[0]}_${job.id}.${x[1]}`;


    uploadTus(job.customer_id,uploadName).then(()=>{
    

    (async () => {
      
        let x:Transaction={
			customer_id:job.customer_id,
			type:uploadType,
			log:'file',
			user_email:String(account.email),
			job_id:job.id,
			is_new:true,
			file_name:uploadName
		};

        console.log(x);

		let res=await addTransaction(supabase,x);

        let html=`
        <p></p>
        <p>${job.first_name} ${job.last_name} ${job.customer_email}</p>
        <p></p>
        <p>Order  <b>${job.type}</b></p>
        <p>Customer Reference <b>${job.customer_ref}</b></p>
        <p>Patient Name <b>${patientName}</b>
        <p></p>
        <p>New file uploaded to ${capitalize(uploadType)} , ${uploadName}</p>
        <p></p>
        `;
        let subject = 'Implantify - New File Uploaded';
        let res2=await email(job.customer_email,subject,html,account.email===job.customer_email ? true : false);




        await updateLevel(supabase,config.stages,job.id,uploadType,1);
    
        uploadType='';
        uploadName='';
        isUpload=false;
        uploadPercentage=0;
        showModal=false;
        invalidate('supabase:db:jobs');


    })(); 
    }).catch((error)=>{
        alert.type='error';
        alert.msg='error uploading file'
        console.error(error);
    });


   

};


const uploadTus=async(customer_id:string,fn:string)=> {
uploadPercentage=0;
return (new Promise<void>((resolve, reject):Promise<void> => {
    var upload = new tus.Upload(files[0], {
        endpoint: `${PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
            authorization: `Bearer ${session? session.access_token :''}`,
            'x-upsert': 'true', // optionally set upsert to true to overwrite existing files
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true, // Important if you want to allow re-uploading the same file https://github.com/tus/tus-js-client/blob/main/docs/api.md#removefingerprintonsuccess
        metadata: {
            bucketName: 'order-files',
            objectName: `${customer_id}/${uploadName}`,
            contentType: 'application/octet-stream',
            // @ts-ignore
            cacheControl: 3600
        },
        chunkSize: 6 * 1024 * 1024, // NOTE: it must be set to 6MB (for now) do not change it
        onError: function (error) {
            //console.log('Failed because: ' + error)
            uploadComplete=false;
            uploadError=true;
            reject(error)
        },
        onProgress: function (bytesUploaded, bytesTotal) {
            //var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            uploadPercentage=Math.round((bytesUploaded / bytesTotal) * 100);
            console.log(bytesUploaded, bytesTotal, uploadPercentage + '%')
        },
        onSuccess: function (){
            // @ts-ignore
            //console.log('Uploaded %s to %s', upload.file.name, upload.url)
            uploadComplete=true;
            uploadError=false;
            //log({log:`file upload (${fn})`,table_name:'order_files',order_id:order.id,user_id:account.id,customer_id:order.customer_id,user_email:account.email,customer_email:order.customer_email});
            
            resolve()
        },
    })
    // Check if there are any previous uploads to continue.
    return upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])
        }
        // Start the upload
        upload.start()
    })
}))
};


const populateUploadName=()=>{
    let all =files?.[0]?.name ? files[0].name : '';
    let x= all.split('.');
    let ext=x?.[1] ? x[1] : 'xxx';
    let name = ext!=='xxx' ? x[0] : all;
    name=name.replace(/[^a-zA-Z0-9-_]/g,'');
    //name=name.replace(/ /g,'');
	name = name.length>15 ? name.slice(0,15) : name;
    uploadName=`${name}.${ext}`;
    
};

const validate=()=>{
	uploadName=uploadName.replace(/[^a-zA-Z0-9-_]+$/g,'');
	uploadName = uploadName.length>15 ? uploadName.slice(0,15) : uploadName;
};

const reset=async(type:string)=>{
    invalidate('supabase:db:jobs');
    console.log('resetting...',type);

    let f=job_data.find(el=>el.type===type);
    
    let l:0|1|2=0;
    if(f && f?.files?.[0] && type!=='manufacture') l=1;

    let x:Transaction={
        customer_id:job.customer_id,
        type:type,
        log:`stage reset`,
        user_email:String(account.email),
        job_id:job.id,
        is_new:true,
        file_name:''
    };

    console.log(x);

    let res=await addTransaction(supabase,x);
    await updateLevel(supabase,config.stages,job.id,type,l);

    invalidate('supabase:db:jobs');

};

$effect(() => {
     if(isUpdate) {
		isUpdate=false;
		invalidate('supabase:db:jobs');
	 }

     if(isMessage && !showModal) {
        console.log('clear new activity ....');

        (async () => {
            const { data,error} = await supabase.from('transactions').update({is_new:false}).eq('job_id',job.id);
            if(error) {
                    alert.type='error';
                    alert.msg='error - failed to update transactions';
            }

        })();

    
     }
});


onMount(async() => {
    console.log(job_data,job);
    if(job.transactions.reduce((acc: number,curr: { is_new: any; })=>curr.is_new ? acc+1 : acc,0)>0) openMessages();
    

     let fx=job.prescriptions.find((el: { section: string; item: string; })=>el.section==='patient' && el.item==='first_name');
     let lx=job.prescriptions.find((el: { section: string; item: string; })=>el.section==='patient' && el.item==='last_name');
     patientName = fx && lx ? fx.choice+' '+lx.choice : '';

     console.log('patient',patientName);
   
});










</script>

<svelte:head>
	<title>Orders</title>
	<meta name="description" content="Implantify" />
</svelte:head>


{#if isUpload && showModal}
   <Modal bind:showModal>
  {#snippet header()}
  <h3><span class="text-capitalize">upload {uploadType}</span></h3>
  {/snippet}
    {#if uploadType==='scan'}
    <p>DICOM format CT scans expected, often as a .zip file</p>
    {/if}
    <p>  <input accept="" bind:files  type="file" onchange={populateUploadName}/></p>
    <p>  <span class="tag">{Math.round(uploadPercentage)}%</span></p>
    <p>Edit file name (max 15 characters)</p>
	<p><input type=text bind:value={uploadName} oninput={validate}/></p>
<p>
     <button  disabled={!files}  class="button primary" onclick={upload}>Upload</button>
     <button class="button outline" onclick={()=>showModal=false}>Cancel</button>
</p>


</Modal>
{/if}


{#if isTransaction && showModal}
   <Modal bind:showModal>
  {#snippet header()}
  <h3><span class="text-capitalize">{transactionText} {transactionType}</span></h3>
  {/snippet}
    {#if transactionType==='quotation'}
         {#if transactionText==='approve'}
             <p class="text-error">By approving this quotation you are accepting the terms and agreeing to the price given. Please read your quotation carefully before approving.</p>
            <p>Type <span class='strong'>approve {transactionType}</span> to confirm your approval</p>
             {:else}
            <p>Add a comment if necessary.</p>
        {/if}
    {:else if transactionType==='prescription'}
          <p>Type <span class='strong'>approve {transactionType}</span> to confirm your approval</p>
    {:else if transactionType==='scan'}
         <p>Type <span class='strong'>approve {transactionType}</span> to confirm your approval</p>
    {:else if transactionType==='design'}
        {#if transactionText==='approve'}
             <p class="text-error">By approving this design you are accepting that the team will begin manufacture. Please look over the design carefully before approving and chat with the team if you need changes.</p>
            <p>Type <span class='strong'>approve {transactionType}</span> to confirm your approval</p>
         
        {:else}
            <p>Add a comment if necessary.</p>
        {/if}

    {:else if transactionType==='manufacture'}
        <p>Add a message if required e.g. tracking code for shipping, comments on manufacture</p>
    {/if}
 
     {#if transactionText==='approve'}
    <p><input type="text" bind:value={approveText}/></p>
     {:else}
    <p><textarea rows="4" bind:value={transactionComment}></textarea></p>
    {/if}
<p>
     {#if transactionText==='approve'}
     <button disabled={approveText!==`approve ${transactionType}`} class="button primary" onclick={processTransaction}><span class="text-capitalize">{transactionText}</span></button>
     {:else}
     <button class="button primary" onclick={processTransaction}><span class="text-capitalize">{transactionText}</span></button>
     {/if}
     <button class="button outline" onclick={()=>showModal=false}>Cancel</button>
</p>


</Modal>
{/if}


{#if isDelete && showModal}
   <Modal bind:showModal>
  {#snippet header()}
  <h3>Delete File</h3>
  {/snippet}
  <p>Deleting a file will reset status so approval will still be required to progress.</p>
  <p>You can upload more files.</p>
  <p>Type <span class="strong text-error">delete {deleteType}</span> to confirm</p>
 <p>
    <input type=text bind:value={deleteText}/>
</p><p>
     <button disabled={deleteText!==`delete ${deleteType}`} class="button error" onclick={removeFile}>Delete</button>
     <button class="button outline" onclick={()=>showModal=false}>Cancel</button>
</p>


</Modal>
{/if}


{#if isMessage && showModal}
    <Modal bind:showModal>
    {#snippet header()}
    <h3>Chat</h3>
    {/snippet} 
    <p><textarea rows="4" bind:value={logText}></textarea></p>
    <p><button class="button primary icon"onclick={addMsg}>{@html icon.send()}&nbsp;Send</button></p>
    <div class="msg-wrapper">
    {#each job.transactions as row,rowIndex}
    <div class="msg">
        <div class="row">
             <div class="col small"><b>{row.type}</b></div>  
        </div>
        <div class="row">
             <div class="col small"><span class="">{row.log==='file' ? row.file_name : row.log}</span></div>  
        </div>
        <div class="row">
            <div class="col"><span class="small">{toSimpleDate(row.created_at)}</span></div>
            <div class="col"><span class="small">{row.user_email}</span></div>    
        </div>
    </div>    
    {/each}
    </div>
    <p><button class="button outline" onclick={()=>showModal=false}>Close</button></p>

    </Modal>

{/if}



<div class="row">
     <div class="col">
        {job.type} <i>{job.customer_ref}</i>
     </div>
     <div class="col is-right">
        <button class="button primary icon" onclick={openMessages}>{@html icon.messageCircle()}&nbsp;Chat</button>
    </div>
</div> 	

{#each job_data as row,rowIndex}
	<div class="wrapper">
		<div class={row.level===2 ? 'title-box title-completed' : row.level===1 ? 'title-box title-progress' : 'title-box'}><div class="title">{row.type}</div></div>
		<div class="content-wrapper">
			<div class="content">
               
                <div class="row">
                  
                    <div class="col-3">
                        {#if row.type==='prescription'}

                            {#if job.levels[rowIndex]===0}
                                 <a href={`/private/prescriptions/${job.id}`}><span class="strong">{@html icon.edit()}&nbsp;EDIT</span></a>
                            {/if}
                            {#if job.levels[rowIndex]===1}
                                 <a href={`/private/prescriptions/${job.id}`}><span class="strong">{@html icon.edit()}&nbsp;EDIT</span></a>
                                 {#if account.isStaff}
                                 <br/>
                                 <a href={'javascript:void(0)'} onclick={()=>openTransaction('prescription','approve')}><span class="strong">{@html icon.checkCircle()}&nbsp;APPROVE</span></a>
                                {/if}
                            {/if}
                            
                            {#if job.levels[rowIndex]===2}
                                 <a href={`/private/prescriptions/${job.id}`}><span class="strong">{@html icon.edit()}&nbsp;EDIT</span></a>
                                <br/>
                                <p class="strong">Completed</p>
                                {#if account.isStaff}
                                 <a href={'javascript:void(0)'} onclick={()=>reset(row.type)}><span class="strong">{@html icon.rotateCcw()}&nbsp;RESET</span></a>
                                {/if}
                            {/if}
                        {:else if row.type==='scan'}
                                {#if job.levels[rowIndex]===0}
                             
                                    <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                {/if}
                                
                                {#if job.levels[rowIndex]===1}
                                    <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                    <br/>    
                                    {#if account.isStaff} 
                                        <a href={'javascript:void(0)'} onclick={()=>openTransaction(row.type,'approve')}><span class="strong">{@html icon.checkCircle()}&nbsp;APPROVE</span></a>
                                    {/if}
                                {/if}
                                {#if job.levels[rowIndex]===2}
                                <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                <br/>
                                <p class="strong">Completed</p>
                                {#if account.isStaff}
                                <a href={'javascript:void(0)'} onclick={()=>reset(row.type)}><span class="strong">{@html icon.rotateCcw()}&nbsp;RESET</span></a>
                                {/if}
                                {/if}



                        {:else if row.type==='quotation'}

                                {#if job.levels[rowIndex]===0}
                                    {#if account.isStaff}
                                        <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                    {/if}
                                {/if}
                                
                                {#if job.levels[rowIndex]===1}
                                    {#if account.isStaff}
                                        <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                        <br/>
                                    {/if}    
                                    {#if !account.isStaff} 
                                        <a href={'javascript:void(0)'} onclick={()=>openTransaction(row.type,'approve')}><span class="strong">{@html icon.checkCircle()}&nbsp;APPROVE</span></a>
                                    {/if}
                                {/if}
                                {#if job.levels[rowIndex]===2}
                                    {#if account.isStaff}
                                        <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                        <br/>
                                    {/if}
                                    <p class="strong">Completed</p>
                                    {#if account.isStaff}
                                        <a href={'javascript:void(0)'} onclick={()=>reset(row.type)}><span class="strong">{@html icon.rotateCcw()}&nbsp;RESET</span></a>
                                    {/if}
                                {/if}

                        {:else if row.type==='design'}

                          
                                {#if job.levels[rowIndex]===0}
                                    {#if account.isStaff}
                                        <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                    {/if}
                                {/if}
                                
                                {#if job.levels[rowIndex]===1}
                                    {#if account.isStaff}
                                        <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                        <br/>
                                    {/if}    
                                    {#if !account.isStaff} 
                                        <a href={'javascript:void(0)'} onclick={()=>openTransaction(row.type,'approve')}><span class="strong">{@html icon.checkCircle()}&nbsp;APPROVE</span></a>
                                    {/if}
                                {/if}
                                {#if job.levels[rowIndex]===2}
                                    {#if account.isStaff}
                                        <a href={'javascript:void(0)'} onclick={()=>openUpload(row.type)}><span class="strong">{@html icon.upload()}&nbsp;UPLOAD</span></a>
                                        <br/>
                                    {/if}
                                    <p class="strong">Completed</p>
                                    {#if account.isStaff}
                                        <a href={'javascript:void(0)'} onclick={()=>reset(row.type)}><span class="strong">{@html icon.rotateCcw()}&nbsp;RESET</span></a>
                                    {/if}
                                {/if}
                            
                        {:else if row.type==='manufacture'}
                            {#if account.isStaff}
                            {#if job.levels[rowIndex]===0}
                                <a href={'javascript:void(0)'} onclick={()=>openTransaction('manufacture','start')}><span class="strong">{@html icon.play()}START</span></a>
                            {/if}
                            {#if job.levels[rowIndex]===1}
                                 <a href={'javascript:void(0)'} onclick={()=>openTransaction('manufacture','ship')}><span class="strong">{@html icon.truck()}&nbsp;SHIP</span></a>
                            {/if}
                            {/if}
                            {#if job.levels[rowIndex]===2}
                                <p class="strong">Completed</p>
                                   {#if account.isStaff}
                                 <a href={'javascript:void(0)'} onclick={()=>reset(row.type)}><span class="strong">{@html icon.rotateCcw()}&nbsp;RESET</span></a>
                                    {/if}
                            {/if}
                           
                            
                             
                       
                        {/if}
                       
                    </div>
                      <div class="col-9">
                         {#each row.files as f,fIndex}
                                <a href={'javascript:void(0)'} onclick={()=>openDelete(f.name,row.type)}>{@html icon.trash()}</a>&nbsp;&nbsp;&nbsp;
                                <a href={'javascript:void(0)'}  onclick={()=>download(f.name)}>{@html icon.download()} {f.name}</a> <span class="tag is small">{toSimpleDate(f.created_at)}</span>
                          <br/>
                        {/each}
                    </div>
                </div>
                       
                   
            
                      
                
				
			
			
			</div>
          
		</div>
        
		
	</div>
	<p></p>


{/each}


	
	
 


<style>

.msg {
     padding: 0.5rem 0.5rem;
     margin-bottom:1rem;
     border:1px solid var(--color-lightGrey);
     border-radius: 4px;
   
}

.msg-wrapper {
    overflow-x:hidden;
    overflow-y:auto;
    max-height:60%;
}

.strong {
    font-weight:500;
}

 .text-capitalize {
    text-transform: capitalize;
  }

.small {
    padding: 0.4rem;
    font-size: 1rem;
}

.wrapper {
	display:flex;
	flex-direction:row;
	margin:0;
	padding:0;
	align-content: space-between;
   
}

.title-box {
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
	border:1px solid var(--color-red);
	background: var(--color-red);
	color:#fff;
}

.title-progress {
	border:1px solid var(--color-amber);
	background: var(--color-amber);
}

.title-completed {
	border:1px solid var(--color-green);
	background: var(--color-green);
}

.title {
	writing-mode: vertical-rl;
   text-orientation: mixed;
   text-transform:uppercase;
/*   height:15rem; */
   padding:1rem;
	align-content: center;
}

.content-wrapper {
	border-top:1px solid var(--color-grey);
	border-bottom:1px solid var(--color-grey);
	border-right:1px solid var(--color-grey);
	flex-grow:1;
	padding:1rem;
	border-top-right-radius: 4px;
	border-bottom-right-radius: 4px;

	
}

.content {
	display:flex;
	height:100%;
	flex-direction:column;
	justify-content: space-between;

}







</style>
