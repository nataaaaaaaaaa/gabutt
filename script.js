/* MUSEUM OF US — script.js (tanpa login, musik diperbaiki) */
(function(){
'use strict';

/* ===== PLAYLIST — edit di sini ===== */
var PLAYLIST = [
  { title:"Raim Laode - Bersenja Gurau",  src:"music/Raim Laode - Bersenja Gurau ( Official Lirik ).mp3"  },
  { title:"Raim Laode - IQRO",  src:"music/Raim Laode - IQRO (Official Lyric Video).mp3"  },
  { title:"Raim laode - Menari nari",  src:"music/Menari nari - Raim Laode Lirik Lagu.mp3"  },
  { title:"Raim Laode - Lesung Pipi",  src:"music/Raim Laode - Lesung Pipi.mp3"  }
];

/* ===== GALLERY DATA ===== */
var GALLERY_DATA = [
  {title:"Bunga Kedua🌸.",     emoji:"🌸"},
  {title:"Nasgor Dinoyooo.",           emoji:"🌅"},
  {title:"Strawberryyy.",     emoji:"☀️"},
  {title:"Cukinggg.",    emoji:"🗺️"},
  {title:"Cutee>,<.",         emoji:"🕯️"},
  {title:"Cerminn.",         emoji:"🕯️"},
  {title:"Senjaa.",             emoji:"🎞️"},
  {title:"Zombiee.",           emoji:"💌"},
  {title:"Nyaman bgtt.",          emoji:"✨"},
  {title:"Lucuuk.",    emoji:"🌿"},
  {title:"Susah bedain yang mana bunga nya.",   emoji:"🏡"},
  {title:"Postingan Pertama.",               emoji:"😄"},
  {title:"Another Flower.",       emoji:"🌙"},
  {title:"Kediri iri iri.",        emoji:"🛤️"},
  {title:"Metalll.",                emoji:"💞"},
  {title:"Cutee.",        emoji:"🔮"},
  {title:"It's your Birthdayy.",          emoji:"🎨"},
  {title:"Kok kamu gak keliatann.",             emoji:"🫶"},
  {title:"First Gacoan date.",      emoji:"🌺"},
  {title:"Bunga Lagii.",      emoji:"🌺"},
  {title:"Doublee OII.",      emoji:"🌺"},
  {title:"Metalll.",      emoji:"🌺"},
  {title:"Sukakk.",      emoji:"🌺"},
  {title:"Birthdayy.",      emoji:"🌺"},
  {title:"Coban Siuk.",      emoji:"🌺"},
  {title:"Cantik Banget Cewe Gue JIRRR.",      emoji:"🌺"},
  {title:"Kiyowooo.",      emoji:"🌺"},
  {title:"Jelek bgt aku.",      emoji:"🌺"},
  {title:"Momen sederhana yang luar biasa.",      emoji:"🌺"},
  {title:"Cantiknyo OII.",      emoji:"🌺"},
  {title:"Metalll.",      emoji:"🌺"},
  {title:"Kayutangann.",      emoji:"🌺"},
  {title:"Triplee.",      emoji:"🌺"},
  {title:"Cewe Gue Tuuu.",      emoji:"🌺"},
  {title:"AWWW.",      emoji:"🌺"},
  {title:"Maluuu.",      emoji:"🌺"},
  {title:"Nitendo Datee.",      emoji:"🌺"},
  {title:"Lucukk.",      emoji:"🌺"},
  {title:"Cantikkk.",      emoji:"🌺"},
  {title:"Punya Guee Niii.",      emoji:"🌺"},
  {title:"Jari Manis itu Lagi.",      emoji:"🌺"},
  {title:"Senja.",      emoji:"🌺"},
  {title:"Strawberryyy.",      emoji:"🌺"},
  {title:"Cantikkk.",      emoji:"🌺"},
  {title:"Mirror.",      emoji:"🌺"},
  {title:"Lucuu.",      emoji:"🌺"},
  {title:"Happy Birthday LOVEEE.",      emoji:"🌺"}
];

/* ===== STORAGE ===== */
var USER = 'Kita';
function getUserData(){try{return JSON.parse(localStorage.getItem('mou_data_'+USER))||{};}catch(e){return{};}}
function saveUserData(d){try{localStorage.setItem('mou_data_'+USER,JSON.stringify(d));}catch(e){showToast('⚠️ Storage penuh.',3500);}}
function simpleHash(s){var h=0;for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return h.toString(36);}

/* ===== STATE ===== */
var userData={}, currentPage='landing';
var currentTrack=-1, isPlaying=false, autoplayBlocked=false;

/* ===== DOM ===== */
var $=function(id){return document.getElementById(id);};
var htmlEl=document.documentElement, loginScreen=$('loginScreen'), mainApp=$('mainApp');
var nav=$('museumNav'), toastEl=$('toast'), themeFab=$('themeFab'), themePanel=$('themePanel');
var modalOverlay=$('modalOverlay'), modalClose=$('modalClose');
var modalCaption=$('modalCaption'), modalImgWrap=$('modalImgWrap');
var bgMusic=$('bgMusic');
var mpBar=$('mpBar'), mpPlay=$('mpPlay'), mpPlayIcon=$('mpPlayIcon');
var mpPrev=$('mpPrev'), mpNext=$('mpNext'), mpPillTitle=$('mpPillTitle');
var mpOpen=$('mpOpen'), mpClose=$('mpClose'), mpSlots=$('mpSlots');
var mpProgressTrack=$('mpProgressTrack'), mpProgressFill=$('mpProgressFill');
var mpProgressThumb=$('mpProgressThumb'), mpCurrent=$('mpCurrent'), mpDuration=$('mpDuration');
var mpVolume=$('mpVolume');
var particleCanvas=$('particleCanvas'), cursorCanvas=$('cursorCanvas');

/* ===== TOAST ===== */
var _tt;
function showToast(msg,dur){
  if(!toastEl)return;
  clearTimeout(_tt); toastEl.textContent=msg; toastEl.classList.add('show');
  _tt=setTimeout(function(){toastEl.classList.remove('show');},dur||2600);
}
function fmtTime(s){if(isNaN(s)||s===Infinity)return'0:00';var m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec;}

/* ===== CURSOR TRAIL ===== */
(function(){
  if(!cursorCanvas)return;
  var cvs=cursorCanvas, ctx=cvs.getContext('2d');
  var W=0,H=0,particles=[],mx=-50,my=-50;
  function resize(){W=cvs.width=window.innerWidth;H=cvs.height=window.innerHeight;}
  resize(); window.addEventListener('resize',resize);
  document.addEventListener('mousemove',function(e){
    mx=e.clientX; my=e.clientY;
    if(Math.random()<.35){
      particles.push({x:mx,y:my,vx:(Math.random()-.5)*1.5,vy:-Math.random()*2-1,
        life:1,size:Math.random()*10+6,
        color:'hsla('+(Math.random()*30+10)+',80%,70%,',rot:Math.random()*Math.PI*2});
    }
  });
  function drawHeart(x,y,size,rot,alpha,color){
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha=alpha;
    ctx.fillStyle=color+'1)';
    ctx.beginPath();
    var s=size*.5;
    ctx.moveTo(0,s*.3);
    ctx.bezierCurveTo(-s*2,-s*.5,-s*2,-s*1.8,0,-s);
    ctx.bezierCurveTo(s*2,-s*1.8,s*2,-s*.5,0,s*.3);
    ctx.fill(); ctx.restore();
  }
  function loop(){
    ctx.clearRect(0,0,W,H);
    ctx.save(); ctx.fillStyle='rgba(201,169,110,.9)';
    ctx.beginPath(); ctx.arc(mx,my,4,0,Math.PI*2); ctx.fill(); ctx.restore();
    particles=particles.filter(function(p){return p.life>0;});
    particles.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.04; p.life-=0.025; p.rot+=.04;
      drawHeart(p.x,p.y,p.size,p.rot,Math.max(0,p.life),p.color);
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ===== SAVE / RESTORE ===== */
function saveUserDataNow(){saveUserData(userData);}
function saveAllTextData(){
  document.querySelectorAll('[data-key]').forEach(function(el){userData[el.dataset.key]=el.textContent||el.value;});
  saveUserDataNow();
}
function restoreState(){
  if(userData.theme){
    htmlEl.setAttribute('data-theme',userData.theme);
    document.querySelectorAll('.theme-opt').forEach(function(b){b.classList.toggle('active',b.dataset.theme===userData.theme);});
  }
    document.querySelectorAll('[data-key]').forEach(function(el){
    if(el.dataset.key.indexOf('tl-')===0)return;
    var v=userData[el.dataset.key];
    if(v!==undefined&&v!==''){ if(el.tagName==='TEXTAREA')el.value=v; else el.textContent=v; }
  });
  document.querySelectorAll('.tl-photo-zone').forEach(function(zone){
    var i=zone.dataset.tl;
    var path='foto/tl-'+i+'.jpg';
    var test=new Image();
    test.onload=function(){renderTlPhoto(zone,path);};
    test.onerror=function(){
      var src=userData['tl-photo-'+i];
      if(src)renderTlPhoto(zone,src);
    };
    test.src=path;
  });
}
document.addEventListener('blur',function(e){
  var el=e.target;
  if(el&&el.dataset&&el.dataset.key){userData[el.dataset.key]=el.textContent||el.value;saveUserDataNow();}
},true);

/* ===== NAVIGATION ===== */
function navigateTo(pageId){
  if(pageId===currentPage)return;
  var from=document.getElementById('page-'+currentPage);
  var to=document.getElementById('page-'+pageId);
  if(!to)return;
  from.classList.remove('visible');
  setTimeout(function(){
    from.classList.remove('active'); to.classList.add('active'); void to.offsetWidth; to.classList.add('visible');
    window.scrollTo({top:0,behavior:'smooth'});
    currentPage=pageId;
    document.querySelectorAll('.nav-link').forEach(function(l){l.classList.toggle('active',l.dataset.page===pageId);});
    nav.classList.toggle('visible',pageId!=='landing');
    if(pageId==='landing')startParticles(); else stopParticles();
    if(pageId==='timeline')setTimeout(revealTimeline,280);
    if(pageId==='gallery') setTimeout(revealPolaroids,200);
  },360);
}
document.querySelectorAll('.nav-link').forEach(function(l){
  l.addEventListener('click',function(e){e.preventDefault();navigateTo(l.dataset.page);});
});
document.querySelectorAll('button[data-page]').forEach(function(b){
  b.addEventListener('click',function(){navigateTo(b.dataset.page);});
});

/* ===== THEME ===== */
themeFab.addEventListener('click',function(e){e.stopPropagation();themePanel.classList.toggle('open');});
document.addEventListener('click',function(e){if(!themePanel.contains(e.target))themePanel.classList.remove('open');});
themePanel.addEventListener('click',function(e){e.stopPropagation();});
document.querySelectorAll('.theme-opt').forEach(function(btn){
  btn.addEventListener('click',function(){
    var t=btn.dataset.theme; htmlEl.setAttribute('data-theme',t);
    document.querySelectorAll('.theme-opt').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active'); themePanel.classList.remove('open');
    userData.theme=t; saveUserDataNow();
    showToast('Tema "'+btn.querySelector('span:last-child').textContent+'" diterapkan');
  });
});

/* ===== GOLD PARTICLES ===== */
var pCtx,pW=0,pH=0,pPts=[],pActive=false,pRaf;
function startParticles(){
  if(!particleCanvas)return;
  particleCanvas.classList.add('active');
  pCtx=particleCanvas.getContext('2d');
  if(pActive)return;
  pActive=true; if(pPts.length===0)initPts(); pLoop();
}
function stopParticles(){
  if(!particleCanvas)return;
  particleCanvas.classList.remove('active'); pActive=false; cancelAnimationFrame(pRaf);
}
function initPts(){
  pPts=[];
  for(var i=0;i<120;i++){
    pPts.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,
      vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5-.3,
      r:Math.random()*1.8+.5,o:Math.random()*.7+.15,pulse:Math.random()*Math.PI*2});
  }
}
function pLoop(){
  if(!pActive)return;
  pW=particleCanvas.width=window.innerWidth; pH=particleCanvas.height=window.innerHeight;
  pCtx.clearRect(0,0,pW,pH);
  pPts.forEach(function(p){
    p.x+=p.vx; p.y+=p.vy; p.pulse+=.015;
    if(p.x<0)p.x=pW; if(p.x>pW)p.x=0;
    if(p.y<0)p.y=pH; if(p.y>pH)p.y=0;
    var a=p.o*(0.5+0.5*Math.sin(p.pulse));
    pCtx.save(); pCtx.globalAlpha=a; pCtx.fillStyle='#c9a96e';
    pCtx.beginPath(); pCtx.arc(p.x,p.y,p.r,0,Math.PI*2); pCtx.fill(); pCtx.restore();
  });
  pRaf=requestAnimationFrame(pLoop);
}

/* ===== FILM HOLES ===== */
function buildFilmHoles(){
  ['filmHolesTop','filmHolesBot'].forEach(function(id){
    var el=$(id); if(!el)return; el.innerHTML='';
    for(var i=0;i<60;i++){var d=document.createElement('div');d.className='film-hole-item';el.appendChild(d);}
  });
}

/* ===== TIMELINE ===== */
function revealTimeline(){
  var items=document.querySelectorAll('.timeline-item');
  items.forEach(function(item,i){setTimeout(function(){item.classList.add('revealed');},i*110);});
}
window.addEventListener('scroll',function(){
  if(currentPage==='timeline'){
    document.querySelectorAll('.timeline-img-wrap').forEach(function(wrap){
      var rect=wrap.getBoundingClientRect();
      var offset=(rect.top+rect.height/2-window.innerHeight/2)*0.05;
      wrap.style.transform='translateY('+offset+'px)';
    });
  }
  if(currentPage!=='landing')nav.style.boxShadow=window.scrollY>10?'0 2px 24px var(--shadow)':'none';
});

function renderTlPhoto(zone,src){
  var img=document.createElement('img');
  img.src=src; img.alt='Foto';
  img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;';
  zone.style.position='relative'; zone.innerHTML=''; zone.appendChild(img);
  var ni=document.createElement('input');
  ni.type='file'; ni.accept='image/*'; ni.className='tl-file-input';
  ni.style.cssText='position:absolute;inset:0;opacity:0;width:100%;height:100%;z-index:5;';
  zone.appendChild(ni); bindTlInput(ni,zone);
}
function bindTlInput(input,zone){
  input.addEventListener('change',function(){
    var file=this.files[0];
    if(!file||!file.type.startsWith('image/')){showToast('Pilih file gambar');return;}
    var r=new FileReader();
    r.onload=function(ev){
      renderTlPhoto(zone,ev.target.result);
      userData['tl-photo-'+zone.dataset.tl]=ev.target.result; saveUserDataNow();
      showToast('✓ Foto timeline disimpan!');
    }; r.readAsDataURL(file);
  });
}
document.querySelectorAll('.tl-photo-zone').forEach(function(zone){
  var inp=zone.querySelector('.tl-file-input'); if(inp)bindTlInput(inp,zone);
});

/* ===== POLAROID BOARD ===== */
var TILT_PRESETS=[-8,-5,-3,0,2,4,7,-6,3,-2,6,-4,1,-7,5,-1,8,-3];
function buildPolaroidBoard(){
  var board=$('polaroidBoard'); if(!board)return;
  board.innerHTML='';
  var cols=window.innerWidth<500?2:window.innerWidth<800?3:4;
  var cellW=(window.innerWidth>800?210:180), cellH=cellW+90;
  var boardW=board.offsetWidth||window.innerWidth-80;
  board.style.minHeight=(Math.ceil(GALLERY_DATA.length/cols)*(cellH+50)+100)+'px';
  var colHeights=[]; for(var c=0;c<cols;c++)colHeights.push(60);
  var gapX=Math.max(20,(boardW-cols*cellW)/(cols+1));

  GALLERY_DATA.forEach(function(data,i){
    var col=i%cols, x=gapX+col*(cellW+gapX), y=colHeights[col];
    colHeights[col]+=cellH+Math.random()*30+20;
    var tilt=TILT_PRESETS[i%TILT_PRESETS.length]+(Math.random()*2-1);

    var wrap=document.createElement('div');
    wrap.className='polaroid-wrap pol-hidden';
    wrap.style.cssText='left:'+x+'px;top:'+y+'px;z-index:'+(10+i)+';transform:rotate('+tilt+'deg)';
    wrap.dataset.idx=i; wrap.dataset.tilt=tilt;

    var pol=document.createElement('div'); pol.className='polaroid';
    var imgArea=document.createElement('div'); imgArea.className='polaroid-img-area';
    var img=document.createElement('img'); img.className='polaroid-img'; img.alt='';
    var icon=document.createElement('div'); icon.className='polaroid-empty-icon'; icon.textContent=data.emoji;
    imgArea.appendChild(img); imgArea.appendChild(icon);

    var actions=document.createElement('div'); actions.className='polaroid-actions';
    var viewBtn=document.createElement('button'); viewBtn.className='pol-view-btn'; viewBtn.textContent='⊕ Lihat';
    var uid='pgf'+i;
    var uploadLbl=document.createElement('label'); uploadLbl.className='pol-upload-btn'; uploadLbl.htmlFor=uid; uploadLbl.textContent='📷 Upload';
    var fileInp=document.createElement('input'); fileInp.type='file'; fileInp.accept='image/*';
    fileInp.className='polaroid-file-input'; fileInp.id=uid; fileInp.dataset.pidx=i;
    fileInp.addEventListener('change',onPolaroidUpload);
    uploadLbl.appendChild(fileInp);
    actions.appendChild(viewBtn); actions.appendChild(uploadLbl);

    var capArea=document.createElement('div'); capArea.className='polaroid-caption-area';
    var cap=document.createElement('div'); cap.className='polaroid-caption editable';
    cap.contentEditable='true'; cap.dataset.key='gl-caption-'+i;
    cap.textContent=data.title;
    capArea.appendChild(cap);

    pol.appendChild(imgArea); pol.appendChild(actions); pol.appendChild(capArea);
    wrap.appendChild(pol); board.appendChild(wrap);

       function showPhoto(src){
      img.src=src; img.style.display='block';
      imgArea.classList.add('has-photo'); wrap.dataset.uploadedSrc=src;
    }
    var path='foto/gl-'+i+'.jpg';
    var test=new Image();
    test.onload=function(){showPhoto(path);};
    test.onerror=function(){
      var saved=userData['gl-photo-'+i];
      if(saved)showPhoto(saved);
    };
    test.src=path;

    viewBtn.addEventListener('click',function(e){e.stopPropagation();openModal(wrap,cap.textContent);});
    makeDraggable(wrap,tilt);
    pol.addEventListener('mousemove',function(e){
      var r=pol.getBoundingClientRect();
      var rx=((e.clientY-r.top)/r.height-.5)*-6, ry=((e.clientX-r.left)/r.width-.5)*6;
      pol.style.transform='perspective(600px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
    });
    pol.addEventListener('mouseleave',function(){pol.style.transform='';});
  });
}
function onPolaroidUpload(){
  var idx=parseInt(this.dataset.pidx,10);
  var file=this.files[0]; if(!file||!file.type.startsWith('image/'))return;
  var wrap=document.querySelector('.polaroid-wrap[data-idx="'+idx+'"]');
  var r=new FileReader();
  r.onload=function(ev){
    var src=ev.target.result;
    var imgArea=wrap.querySelector('.polaroid-img-area');
    var img=wrap.querySelector('.polaroid-img');
    img.src=src; img.style.display='block'; imgArea.classList.add('has-photo');
    wrap.dataset.uploadedSrc=src;
    userData['gl-photo-'+idx]=src; saveUserDataNow();
    showToast('✓ Foto disimpan!');
  }; r.readAsDataURL(file);
}
function openModal(wrap,caption){
  var src=wrap.dataset.uploadedSrc||'';
  var emoji=wrap.querySelector('.polaroid-empty-icon')||{};
  modalImgWrap.innerHTML='';
  if(src){var img=document.createElement('img');img.src=src;img.alt=caption;modalImgWrap.appendChild(img);}
  else{var d=document.createElement('div');d.className='modal-placeholder';d.textContent=(emoji.textContent||'🖼️').trim();modalImgWrap.appendChild(d);}
  modalCaption.textContent=caption?'"'+caption+'"':'';
  modalOverlay.classList.add('open'); document.body.style.overflow='hidden';
}
function revealPolaroids(){
  document.querySelectorAll('.polaroid-wrap').forEach(function(w,i){
    w.classList.add('pol-reveal');
    setTimeout(function(){w.classList.remove('pol-hidden');w.classList.add('pol-visible');},i*60+50);
  });
}
function makeDraggable(el,baseTilt){
  var dragging=false,ox=0,oy=0,ex=0,ey=0;
  el.addEventListener('mousedown',function(e){
    if(e.target.closest('button')||e.target.closest('label')||e.target.closest('input')||e.target.closest('.polaroid-caption'))return;
    dragging=true; ox=e.clientX-ex; oy=e.clientY-ey;
    el.style.zIndex=999;
    document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp);
  });
  function onMove(e){
    if(!dragging)return;
    ex=e.clientX-ox; ey=e.clientY-oy;
    el.style.transform='rotate('+baseTilt+'deg) translate('+ex+'px,'+ey+'px) scale(1.04)';
  }
  function onUp(){
    dragging=false; el.style.zIndex=10;
    el.style.transform='rotate('+baseTilt+'deg) translate('+ex+'px,'+ey+'px)';
    document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp);
  }
}

/* ===== MODAL ===== */
function closeModal(){modalOverlay.classList.remove('open');document.body.style.overflow='';}
modalClose.addEventListener('click',closeModal);
modalOverlay.addEventListener('click',function(e){if(e.target===modalOverlay)closeModal();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});

/* ===== EDITABLE ===== */
document.querySelectorAll('.editable').forEach(function(el){
  el.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!el.classList.contains('timeline-text')&&!el.classList.contains('letter-body')){
      e.preventDefault(); el.blur();
    }
  });
  el.addEventListener('blur',function(){if(el.textContent.trim()==='')el.textContent='...';});
});

/* ===== MAP ===== */
function initMap(){
  if(!window.L){showToast('Map library tidak tersedia (cek internet).');return;}
  var mapEl=$('leafletMap');
  if(!mapEl)return;
  if(leafletMap){leafletMap.invalidateSize();return;}
  leafletMap=L.map('leafletMap').setView([-2.5,118],5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap contributors',maxZoom:18
  }).addTo(leafletMap);
  renderMapPins(); renderMapSidebar();
}
function renderMapPins(){
  if(!leafletMap)return;
  leafletMarkers.forEach(function(m){m.remove();}); leafletMarkers=[];
  (userData.mapPins||[]).forEach(function(pin){
    var marker=L.marker([pin.lat,pin.lng]).addTo(leafletMap);
    var box=document.createElement('div');
    var b=document.createElement('b'); b.textContent=pin.name;
    var s=document.createElement('small'); s.textContent=pin.note||'';
    box.appendChild(b); box.appendChild(document.createElement('br')); box.appendChild(s);
    marker.bindPopup(box);
    leafletMarkers.push(marker);
  });
}
function renderMapSidebar(){
  var list=$('mapPinsList'); if(!list)return; list.innerHTML='';
  (userData.mapPins||[]).forEach(function(pin,i){
    var item=document.createElement('div'); item.className='map-pin-item';
    var name=document.createElement('span'); name.className='map-pin-name'; name.textContent='📍 '+pin.name;
    var note=document.createElement('span'); note.className='map-pin-note'; note.textContent=pin.note||'';
    var del=document.createElement('button'); del.className='map-pin-del'; del.textContent='✕'; del.title='Hapus';
    del.addEventListener('click',function(e){e.stopPropagation();deletePin(i);});
    item.appendChild(del); item.appendChild(name); item.appendChild(note);
    item.addEventListener('click',function(){
      if(leafletMap)leafletMap.flyTo([pin.lat,pin.lng],14);
      if(leafletMarkers[i])leafletMarkers[i].openPopup();
    });
    list.appendChild(item);
  });
}
function deletePin(i){
  if(!userData.mapPins)return;
  userData.mapPins.splice(i,1); saveUserDataNow();
  renderMapPins(); renderMapSidebar(); showToast('Pin dihapus.');
}
if($('mapAddBtn'))$('mapAddBtn').addEventListener('click',function(){$('mapPinForm').classList.remove('hidden');});
if($('mpfCancel'))$('mpfCancel').addEventListener('click',function(){$('mapPinForm').classList.add('hidden');});
if($('mpfSave'))$('mpfSave').addEventListener('click',function(){
  var name=$('mpfName').value.trim();
  var lat=parseFloat($('mpfLat').value), lng=parseFloat($('mpfLng').value);
  var note=$('mpfNote').value.trim();
  if(!name||isNaN(lat)||isNaN(lng)){showToast('Isi nama, latitude, dan longitude dengan benar.');return;}
  if(!userData.mapPins)userData.mapPins=[];
  userData.mapPins.push({name:name,lat:lat,lng:lng,note:note});
  saveUserDataNow();
  $('mapPinForm').classList.add('hidden');
  $('mpfName').value='';$('mpfLat').value='';$('mpfLng').value='';$('mpfNote').value='';
  renderMapPins(); renderMapSidebar();
  if(leafletMap)leafletMap.flyTo([lat,lng],14);
  showToast('📍 Pin "'+name+'" ditambahkan!');
});

/* ===== MUSIC PLAYER ===== */
function buildPlaylistUI(){
  mpSlots.innerHTML='';
  PLAYLIST.forEach(function(song,i){
    var slot=document.createElement('div'); slot.className='mp-slot has-song';
    if(i===currentTrack)slot.classList.add('active');
    var dot=document.createElement('span'); dot.className='mp-slot-dot';
    var num=document.createElement('span'); num.className='mp-slot-num'; num.textContent=i+1;
    var name=document.createElement('span'); name.className='mp-slot-name'; name.textContent=song.title;
    var note=document.createElement('span'); note.style.cssText='font-size:.8rem;opacity:.4;flex-shrink:0;'; note.textContent='♪';
    slot.appendChild(dot); slot.appendChild(num); slot.appendChild(name); slot.appendChild(note);
    slot.addEventListener('click',function(){playTrack(i);});
    mpSlots.appendChild(slot);
  });
}
function updatePillUI(){
  mpPlayIcon.textContent=isPlaying?'❚❚':'▶';
  mpBar.classList.toggle('is-playing',isPlaying);
  mpPillTitle.textContent=(currentTrack>=0&&PLAYLIST[currentTrack])?PLAYLIST[currentTrack].title:'No music';
}
function playTrack(idx){
  if(idx<0||idx>=PLAYLIST.length)return;
  currentTrack=idx;
  bgMusic.src=PLAYLIST[idx].src;
  bgMusic.volume=parseFloat(mpVolume.value)||0.7;
  isPlaying=false; updatePillUI(); buildPlaylistUI();
  var p=bgMusic.play();
  if(p!==undefined){
    p.then(function(){
      isPlaying=true; autoplayBlocked=false; updatePillUI();
    }).catch(function(err){
      isPlaying=false; updatePillUI();
      if(err&&err.name==='NotAllowedError'){
        autoplayBlocked=true;
        showToast('Ketuk ▶ atau klik di mana saja untuk memutar musik 🎵',3500);
      } else if(err&&err.name!=='AbortError'){
        showToast('⚠️ File musik tidak ditemukan: '+PLAYLIST[idx].src,4000);
      }
    });
  }
}
function togglePlay(){
  if(currentTrack===-1){playTrack(0);return;}
  if(isPlaying){bgMusic.pause();isPlaying=false;updatePillUI();}
  else{
    bgMusic.play().then(function(){isPlaying=true;autoplayBlocked=false;updatePillUI();})
      .catch(function(){showToast(' Musik gagal diputar');});
  }
}
function prevTrack(){playTrack(currentTrack<=0?PLAYLIST.length-1:currentTrack-1);}
function nextTrack(){playTrack(currentTrack>=PLAYLIST.length-1?0:currentTrack+1);}

bgMusic.addEventListener('ended',nextTrack);
bgMusic.addEventListener('pause',function(){isPlaying=false;updatePillUI();});
bgMusic.addEventListener('play',function(){isPlaying=true;updatePillUI();});
bgMusic.addEventListener('error',function(){
  if(currentTrack>=0)showToast(' Gagal memuat: '+PLAYLIST[currentTrack].title,3500);
});

mpPlay.addEventListener('click',function(e){e.stopPropagation();togglePlay();});
mpPrev.addEventListener('click',function(e){e.stopPropagation();prevTrack();});
mpNext.addEventListener('click',function(e){e.stopPropagation();nextTrack();});
mpOpen.addEventListener('click',function(e){e.stopPropagation();mpBar.classList.toggle('panel-open');});
mpClose.addEventListener('click',function(e){e.stopPropagation();mpBar.classList.remove('panel-open');});
document.addEventListener('click',function(e){if(!mpBar.contains(e.target))mpBar.classList.remove('panel-open');});

bgMusic.addEventListener('timeupdate',function(){
  if(!bgMusic.duration)return;
  var pct=(bgMusic.currentTime/bgMusic.duration)*100;
  mpProgressFill.style.width=pct+'%'; mpProgressThumb.style.left=pct+'%';
  mpCurrent.textContent=fmtTime(bgMusic.currentTime); mpDuration.textContent=fmtTime(bgMusic.duration);
});
mpProgressTrack.addEventListener('click',function(e){
  if(!bgMusic.duration)return;
  var rect=mpProgressTrack.getBoundingClientRect();
  bgMusic.currentTime=((e.clientX-rect.left)/rect.width)*bgMusic.duration;
});
mpVolume.addEventListener('input',function(){bgMusic.volume=parseFloat(this.value);});
bgMusic.volume=0.7;

/* Jika autoplay diblokir, mulai di klik pertama di luar player */
document.addEventListener('click',function(e){
  if(autoplayBlocked&&!isPlaying&&!mpBar.contains(e.target)){
    bgMusic.play().then(function(){isPlaying=true;autoplayBlocked=false;updatePillUI();}).catch(function(){});
  }
});

/* ===== START (tanpa login) ===== */
function startApp(){
  userData=getUserData();
  if(loginScreen)loginScreen.classList.add('hidden');
  mainApp.classList.remove('hidden');
  var lo=$('logoutBtn'); if(lo)lo.style.display='none';
  var un=$('navUsername'); if(un)un.style.display='none';
  restoreState(); buildPlaylistUI(); buildPolaroidBoard(); buildFilmHoles(); updatePillUI();
  var landing=$('page-landing');
  landing.classList.add('active');
  setTimeout(function(){landing.classList.add('visible');startParticles();},80);
  if(PLAYLIST.length>0)setTimeout(function(){playTrack(0);},700);
}
window.addEventListener('beforeunload',saveAllTextData);
startApp();

})();