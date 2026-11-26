(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('photoCanvas'), ctx = canvas.getContext('2d');
  const fileInput = $('fileInput');
  let image = null, fileName = 'foto', zoom = 100;
  let backgroundCanvas = null;
  const state = {brightness:100,contrast:100,saturation:100,warmth:0,blur:0,filter:'normal',rotation:0,flipH:false,flipV:false,text:'',textColor:'#ffffff',textSize:36,textPosition:'bottom'};
  const defaults = {...state};
  let toastTimer;

  function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400);}
  function hasImage(){return !!image;}
  function updateButtons(){['downloadBtn','downloadTop'].forEach(id=>$(id).disabled=!hasImage());}
  function loadFile(file){
    if(!file)return;
    if(!/^image\/(jpeg|png|webp)$/.test(file.type)){toast('Format belum didukung. Gunakan JPG, PNG, atau WEBP.');return;}
    if(file.size>20*1024*1024){toast('Ukuran foto melebihi 20 MB.');return;}
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>{image=img;backgroundCanvas=null;fileName=(file.name||'foto').replace(/\.[^.]+$/,'');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      $('removeBackground').disabled=false;$('restoreBackground').disabled=true;$('backgroundStatus').textContent='Belum diproses';
      $('emptyState').style.display='none';canvas.style.display='block';$('canvasWatermark').style.display='block';
      $('fileLabel').textContent='CANVAS / '+file.name.toUpperCase().slice(0,28);
      $('imageInfo').textContent=`${img.naturalWidth} × ${img.naturalHeight} px`;
      Object.assign(state,defaults);syncControls();render();updateButtons();toast('Foto berhasil dimuat. Selamat berkreasi!');
      URL.revokeObjectURL(url);
    };
    img.onerror=()=>{toast('Foto tidak dapat dibuka.');URL.revokeObjectURL(url);};img.src=url;
  }
  function filterValues(){
    let b=state.brightness,c=state.contrast,s=state.saturation,sepia=0,hue=0;
    if(state.filter==='vintage'){sepia=48;b*=1.04;c*=.9;s*=.78;}
    if(state.filter==='mono')s=0;
    if(state.filter==='warm'){sepia=22;b*=1.04;s*=1.12;}
    if(state.filter==='cool'){hue=170;s*=.88;c*=1.05;}
    if(state.filter==='fade'){b*=1.08;c*=.82;s*=.78;}
    return `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sepia}%) hue-rotate(${hue}deg) blur(${state.blur}px)`;
  }
  function render(){
    if(!image)return;
    const rotated=Math.abs(state.rotation%180)===90;
    const w=rotated?image.naturalHeight:image.naturalWidth,h=rotated?image.naturalWidth:image.naturalHeight;
    canvas.width=w;canvas.height=h;
    ctx.save();ctx.translate(w/2,h/2);ctx.rotate(state.rotation*Math.PI/180);
    ctx.scale(state.flipH?-1:1,state.flipV?-1:1);
    ctx.filter=filterValues();ctx.drawImage(backgroundCanvas||image,-image.naturalWidth/2,-image.naturalHeight/2);ctx.filter='none';
    // Temperature overlay, kept subtle and blended with the photo.
    if(state.warmth!==0){ctx.globalCompositeOperation=state.warmth>0?'soft-light':'screen';ctx.fillStyle=state.warmth>0?`rgba(255,155,65,${Math.abs(state.warmth)/220})`:`rgba(85,155,255,${Math.abs(state.warmth)/260})`;ctx.fillRect(-w/2,-h/2,w,h);ctx.globalCompositeOperation='source-over';}
    ctx.restore();
    if(state.text.trim()){
      const size=Math.max(12,state.textSize*(w/1000));ctx.save();ctx.font=`800 ${size}px Manrope, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
      const y=state.textPosition==='top'?h*.12:state.textPosition==='center'?h*.5:h*.88;
      ctx.shadowColor='rgba(0,0,0,.65)';ctx.shadowBlur=size*.25;ctx.fillStyle=state.textColor;ctx.fillText(state.text,w/2,y,w*.86);ctx.restore();
    }
    canvas.style.transform=`scale(${zoom/100})`;
    $('zoomLabel').textContent=zoom+'%';
  }
  function syncControls(){
    ['brightness','contrast','saturation','warmth','blur'].forEach(k=>{ $(k).value=state[k]; $(k+'Val').textContent=k==='blur'?state[k]+' px':k==='warmth'?state[k]:state[k]+'%';});
    $('overlayText').value=state.text;$('textColor').value=state.textColor;$('textSize').value=state.textSize;$('textSizeVal').textContent=state.textSize+' px';$('textPosition').value=state.textPosition;
    document.querySelectorAll('.filter-card').forEach(b=>b.classList.toggle('selected',b.dataset.filter===state.filter));
  }
  ['brightness','contrast','saturation','warmth','blur'].forEach(k=>$(k).addEventListener('input',e=>{state[k]=Number(e.target.value);$(k+'Val').textContent=k==='blur'?state[k]+' px':k==='warmth'?state[k]:state[k]+'%';render();}));
  document.querySelectorAll('.tool-tab').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.tool-tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
    $('panel-'+btn.dataset.tab).classList.add('active');
    const names={adjust:'Penyesuaian',filters:'Filter',transform:'Transformasi',text:'Teks foto',background:'Hapus latar'};$('panelTitle').textContent=names[btn.dataset.tab];
  }));
  document.querySelectorAll('.filter-card').forEach(btn=>btn.addEventListener('click',()=>{state.filter=btn.dataset.filter;syncControls();render();}));
  $('rotateLeft').onclick=()=>{state.rotation=(state.rotation-90+360)%360;render();};
  $('rotateRight').onclick=()=>{state.rotation=(state.rotation+90)%360;render();};
  $('flipH').onclick=()=>{state.flipH=!state.flipH;render();};
  $('flipV').onclick=()=>{state.flipV=!state.flipV;render();};
  $('overlayText').addEventListener('input',e=>{state.text=e.target.value;render();});
  $('textColor').addEventListener('input',e=>{state.textColor=e.target.value;render();});
  $('textSize').addEventListener('input',e=>{state.textSize=Number(e.target.value);$('textSizeVal').textContent=state.textSize+' px';render();});
  $('textPosition').addEventListener('change',e=>{state.textPosition=e.target.value;render();});
  $('clearText').onclick=()=>{state.text='';$('overlayText').value='';render();toast('Tulisan dihapus.');};
  function removeBackground(){
    if(!image){
      $('backgroundStatus').textContent='Unggah foto untuk memulai';
      toast('Pilih foto terlebih dahulu sebelum menghapus background.');
      return;
    }
    const button=$('removeBackground');
    button.disabled=true;
    button.textContent='Memproses...';
    $('backgroundStatus').textContent='Sedang memproses latar';

    setTimeout(()=>{
      try{
        const w=image.naturalWidth,h=image.naturalHeight;
        const work=document.createElement('canvas');work.width=w;work.height=h;
        const workCtx=work.getContext('2d',{willReadFrequently:true});
        workCtx.drawImage(image,0,0);
        const imageData=workCtx.getImageData(0,0,w,h), pixels=imageData.data;

        const edgeColors=new Map();
        const edgePixels=[];
        const edgeStep=Math.max(1,Math.floor(Math.max(w,h)/500));
        for(let x=0;x<w;x+=edgeStep){
          edgePixels.push((x)*4,((h-1)*w+x)*4);
        }
        for(let y=0;y<h;y+=edgeStep){
          edgePixels.push((y*w)*4,((y*w+w-1)*4));
        }
        edgePixels.forEach(p=>{
          const key=`${pixels[p]>>4},${pixels[p+1]>>4},${pixels[p+2]>>4}`;
          edgeColors.set(key,(edgeColors.get(key)||0)+1);
        });
        let referenceKey='';
        let largestCount=0;
        edgeColors.forEach((count,key)=>{if(count>largestCount){largestCount=count;referenceKey=key;}});
        const [rBin,gBin,bBin]=referenceKey.split(',').map(Number);
        const reference=[rBin*16+8,gBin*16+8,bBin*16+8];
        const sampleDistances=[];
        edgePixels.forEach(p=>{
          sampleDistances.push(Math.sqrt((pixels[p]-reference[0])**2+(pixels[p+1]-reference[1])**2+(pixels[p+2]-reference[2])**2));
        });
        sampleDistances.sort((a,b)=>a-b);
        const spread=sampleDistances[Math.floor(sampleDistances.length*.75)]||20;
        const threshold=Math.max(22,Math.min(55,spread+18));
        const visited=new Uint8Array(w*h), queue=new Uint32Array(w*h);
        let head=0,tail=0;
        const colorDistance=i=>{const p=i*4;const dr=pixels[p]-reference[0],dg=pixels[p+1]-reference[1],db=pixels[p+2]-reference[2];return Math.sqrt(dr*dr+dg*dg+db*db)/Math.sqrt(3);};
        const enqueue=(x,y)=>{
          if(x<0||y<0||x>=w||y>=h)return;
          const index=y*w+x;if(visited[index])return;
          if(colorDistance(index)>threshold)return;
          visited[index]=1;queue[tail++]=index;
        };
        for(let x=0;x<w;x++){enqueue(x,0);enqueue(x,h-1);}
        for(let y=0;y<h;y++){enqueue(0,y);enqueue(w-1,y);}
        while(head<tail){
          const index=queue[head++],x=index%w,y=Math.floor(index/w);
          enqueue(x-1,y);enqueue(x+1,y);enqueue(x,y-1);enqueue(x,y+1);
        }
        const feather=threshold*1.5;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){
          const index=y*w+x,p=index*4;
          if(visited[index]){pixels[p+3]=0;continue;}
          let near=false;
          if(x>0&&visited[index-1])near=true;else if(x<w-1&&visited[index+1])near=true;else if(y>0&&visited[index-w])near=true;else if(y<h-1&&visited[index+w])near=true;
          if(near){const distance=colorDistance(index);if(distance<=feather)pixels[p+3]=Math.round(Math.max(0,Math.min(255,(distance-threshold)/(feather-threshold)*255)));}
        }
        workCtx.putImageData(imageData,0,0);
        backgroundCanvas=work;$('restoreBackground').disabled=false;$('backgroundStatus').textContent='Latar berhasil dihapus';
        render();toast('Background berhasil dihapus.');
      }catch(error){
        console.error(error);
        $('backgroundStatus').textContent='Gagal memproses latar';
        toast('Gagal menghapus latar. Coba foto dengan latar lebih polos.');
      }finally{
        button.disabled=false;
        button.innerHTML='Hapus background <span>◇</span>';
      }
    },30);
  }
  function restoreBackground(){backgroundCanvas=null;$('restoreBackground').disabled=true;$('backgroundStatus').textContent='Belum diproses';render();toast('Latar dikembalikan.');}
  $('removeBackground').addEventListener('click',removeBackground);
  $('restoreBackground').addEventListener('click',restoreBackground);
  function reset(){Object.assign(state,defaults);backgroundCanvas=null;zoom=100;$('restoreBackground').disabled=true;$('backgroundStatus').textContent=hasImage()?'Belum diproses':'Belum ada foto';syncControls();render();toast('Pengaturan dikembalikan ke awal.');}
  $('resetBtn').onclick=reset;$('resetPanel').onclick=reset;
  $('zoomIn').onclick=()=>{zoom=Math.min(200,zoom+10);render();};$('zoomOut').onclick=()=>{zoom=Math.max(30,zoom-10);render();};$('fitBtn').onclick=()=>{zoom=100;render();};
  function download(){
    if(!image)return;
    canvas.toBlob(blob=>{if(!blob){toast('Gagal membuat file.');return;}const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=(fileName||'ardx-edit')+'-ardx.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Foto berhasil diunduh!');},'image/png');
  }
  $('downloadBtn').onclick=download;$('downloadTop').onclick=download;
  fileInput.addEventListener('change',e=>{loadFile(e.target.files[0]);e.target.value='';});
  const stage=$('canvasStage');
  stage.addEventListener('dragover',e=>{e.preventDefault();stage.classList.add('dragging');});
  stage.addEventListener('dragleave',()=>stage.classList.remove('dragging'));
  stage.addEventListener('drop',e=>{e.preventDefault();stage.classList.remove('dragging');loadFile(e.dataTransfer.files[0]);});
  updateButtons();
})();