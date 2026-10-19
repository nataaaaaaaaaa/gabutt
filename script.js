/* =====================================================
   MUSEUM OF US — script.js  (Full Luxury Edition)
   ===================================================== */
(function(){
'use strict';

/* ==================================================
   PLAYLIST — Edit di sini
   Taruh file di folder music/ lalu isi src & title
================================================== */
var PLAYLIST = [
  { title:"Lagu 1",  src:"music/lagu1.mp3"  },
  { title:"Lagu 2",  src:"music/lagu2.mp3"  },
  { title:"Lagu 3",  src:"music/lagu3.mp3"  },
  { title:"Lagu 4",  src:"music/lagu4.mp3"  },
  { title:"Lagu 5",  src:"music/lagu5.mp3"  },
  { title:"Lagu 6",  src:"music/lagu6.mp3"  },
  { title:"Lagu 7",  src:"music/lagu7.mp3"  },
  { title:"Lagu 8",  src:"music/lagu8.mp3"  },
  { title:"Lagu 9",  src:"music/lagu9.mp3"  },
  { title:"Lagu 10", src:"music/lagu10.mp3" },
];

/* ==================================================
   GALLERY DATA — 18 slot polaroid
   title=judul caption, emoji=ikon placeholder
================================================== */
var GALLERY_DATA = [
  {title:"Momen yang selalu kami rindukan.",     emoji:"🌸"},
  {title:"Tempat favorit kami berdua.",           emoji:"🌅"},
  {title:"Senyummu adalah hal paling indah.",     emoji:"☀️"},
  {title:"Petualangan yang tidak terlupakan.",    emoji:"🗺️"},
  {title:"Ketika waktu terasa berhenti.",         emoji:"🕯️"},
  {title:"Momen yang kami abadikan.",             emoji:"🎞️"},
  {title:"Cerita di balik foto ini...",           emoji:"💌"},
  {title:"Selalu terasa seperti mimpi.",          emoji:"✨"},
  {title:"Bersama, segalanya terasa mungkin.",    emoji:"🌿"},
  {title:"Sudut kecil dunia yang kami cintai.",   emoji:"🏡"},
  {title:"Tawa yang paling tulus.",               emoji:"😄"},
  {title:"Langit yang kami tatap bersama.",       emoji:"🌙"},
  {title:"Perjalanan panjang yang indah.",        emoji:"🛤️"},
  {title:"Dua hati, satu cerita.",                emoji:"💞"},
  {title:"Setiap detail yang kami ingat.",        emoji:"🔮"},
  {title:"Satu frame, seribu kenangan.",          emoji:"🎨"},
  {title:"Kamu adalah rumah bagiku.",             emoji:"🫶"},
  {title:"Momen sederhana yang luar biasa.",      emoji:"🌺"},
];

/* ==================================================
   STORAGE
================================================== */
var USERS_KEY='mou_users', SESSION_KEY='mou_session';
function getUsers(){try{return JSON.parse(localStorage.getItem(USERS_KEY))||{};}catch(e){return{};}}
function saveUsers(u){localStorage.setItem(USERS_KEY,JSON.stringify(u));}
function getUserData(u){try{return JSON.parse(localStorage.getItem('mou_data_'+u))||{};}catch(e){return{};}}
function saveUserData(u,d){try{localStorage.setItem('mou_data_'+u,JSON.stringify(d));}catch(e){showToast('⚠️ Storage penuh.',3500);}}
function simpleHash(s){var h=0;for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return h.toString(36);}
function getSession(){return localStorage.getItem(SESSION_KEY)||'';}
function setSession(u){localStorage.setItem(SESSION_KEY,u);}
function clearSession(){localStorage.removeItem(SESSION_KEY);}

/* ==================================================
   STATE
================================================== */
var currentUser='', userData={}, currentPage='landing';
var currentTrack=-1, isPlaying=false;
var mapInstance=null, mapPins=[];
var leafletMap=null, leafletMarkers=[];

/* ==================================================
   DOM refs
================================================== */
var $ = function(id){return document.getElementById(id);};
var htmlEl=document.documentElement, loginScreen=$('loginScreen'), mainApp=$('mainApp');
var nav=$('museumNav'), navUsername=$('navUsername'), logoutBtn=$('logoutBtn');
var toastEl=$('toast'), themeFab=$('themeFab'), themePanel=$('themePanel');
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

/* ==================================================
   TOAST
================================================== */
var _tt;
function showToast(msg,dur){
  clearTimeout(_tt); toastEl.textContent=msg; toastEl.classList.add('show');
  _tt=setTimeout(function(){toastEl.classList.remove('show');},dur||2600);
}

function fmtTime(s){if(isNaN(s)||s===Infinity)return'0:00';var m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec;}

/* ==================================================
   CURSOR TRAIL  ♡ hearts
================================================== */
(function(){
  var cvs=cursorCanvas, ctx=cvs.getContext('2d');
  var W=0, H=0, particles=[], mx=0, my=0;
  function resize(){W=cvs.width=window.innerWidth;H=cvs.height=window.innerHeight;}
  resize(); window.addEventListener('resize',resize);

  document.addEventListener('mousemove',function(e){
    mx=e.clientX; my=e.clientY;
    // spawn heart particle
    if(Math.random()<.35){
      particles.push({x:mx,y:my,vx:(Math.random()-.5)*1.5,vy:-Math.random()*2-1,
        life:1,size:Math.random()*10+6,
        color:'hsla('+(Math.random()*30+10)+',80%,70%,',rot:Math.random()*Math.PI*2});
    }
  });

  function drawHeart(ctx,x,y,size,rot,alpha,color){
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
    // draw cursor dot
    ctx.save(); ctx.fillStyle='rgba(201,169,110,.9)';
    ctx.beginPath(); ctx.arc(mx,my,4,0,Math.PI*2); ctx.fill(); ctx.restore();

    particles=particles.filter(function(p){return p.life>0;});
    particles.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.04; p.life-=0.025; p.rot+=.04;
      drawHeart(ctx,p.x,p.y,p.size,p.rot,Math.max(0,p.life),p.color);
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ==================================================
   LOGIN CANVAS PARTICLES
================================================== */
(function(){
  var cvs=$('loginCanvas');
  if(!cvs)return;
  var ctx=cvs.getContext('2d');
  var W=0,H=0,pts=[];
  function resize(){W=cvs.width=cvs.parentElement.offsetWidth;H=cvs.height=cvs.parentElement.offsetHeight;}
  resize(); window.addEventListener('resize',resize);
  for(var i=0;i<60;i++)pts.push({x:Math.random()*W,y:Math.random()*H,
    vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+1,
    o:Math.random()*.5+.1,pulse:Math.random()*Math.PI*2});
  function loop(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; p.pulse+=.02;
      if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
      var a=p.o*(0.5+0.5*Math.sin(p.pulse));
      ctx.save(); ctx.globalAlpha=a;
      ctx.fillStyle='#c9a96e';
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ==================================================
   LOGIN UI
================================================== */
var tabLogin=$('tabLogin'),tabRegister=$('tabRegister');
var formLogin=$('formLogin'),formRegister=$('formRegister');
var loginError=$('loginError'),registerError=$('registerError');

tabLogin.addEventListener('click',function(){
  tabLogin.classList.add('active');tabRegister.classList.remove('active');
  formLogin.classList.remove('hidden');formRegister.classList.add('hidden');
  loginError.textContent='';registerError.textContent='';
});
tabRegister.addEventListener('click',function(){
  tabRegister.classList.add('active');tabLogin.classList.remove('active');
  formRegister.classList.remove('hidden');formLogin.classList.add('hidden');
  loginError.textContent='';registerError.textContent='';
});

function bindPwToggle(tid,iid){
  $(tid).addEventListener('click',function(){
    var i=$(iid); i.type=i.type==='password'?'text':'password';
    this.textContent=i.type==='password'?'👁':'🙈';
  });
}
bindPwToggle('toggleLoginPw','loginPass');
bindPwToggle('toggleRegPw','regPass');

formLogin.addEventListener('submit',function(e){
  e.preventDefault();
  var user=$('loginUser').value.trim(),pass=$('loginPass').value;
  loginError.textContent='';
  if(!user||!pass){loginError.textContent='Username dan password wajib diisi.';return;}
  var users=getUsers();
  if(!users[user]){loginError.textContent='Username tidak ditemukan.';return;}
  if(users[user]!==simpleHash(pass)){loginError.textContent='Password salah.';return;}
  setSession(user);enterApp(user);
});

formRegister.addEventListener('submit',function(e){
  e.preventDefault();
  var user=$('regUser').value.trim(),pass=$('regPass').value,pass2=$('regPassConfirm').value;
  registerError.textContent='';
  if(!user||!pass){registerError.textContent='Username dan password wajib diisi.';return;}
  if(user.length<3){registerError.textContent='Username minimal 3 karakter.';return;}
  if(pass.length<4){registerError.textContent='Password minimal 4 karakter.';return;}
  if(pass!==pass2){registerError.textContent='Password tidak cocok.';return;}
  var users=getUsers();
  if(users[user]){registerError.textContent='Username sudah digunakan.';return;}
  users[user]=simpleHash(pass);saveUsers(users);setSession(user);enterApp(user);
});

/* ==================================================
   ENTER APP
================================================== */
function enterApp(username){
  currentUser=username; userData=getUserData(username);
  navUsername.textContent=username;
  loginScreen.classList.add('fade-out');
  setTimeout(function(){loginScreen.classList.add('hidden');},500);
  mainApp.classList.remove('hidden');
  restoreState(); buildPlaylistUI(); buildPolaroidBoard();
  buildFilmHoles();
  var landing=document.getElementById('page-landing');
  landing.classList.add('active');
  setTimeout(function(){landing.classList.add('visible');startParticles();},80);
  if(PLAYLIST.length>0) setTimeout(function(){playTrack(0);},700);
}

(function(){var s=getSession();if(s&&getUsers()[s])enterApp(s);})();

/* ==================================================
   LOGOUT
================================================== */
logoutBtn.addEventListener('click',function(){
  saveAllTextData();clearSession();currentUser='';userData={};
  bgMusic.pause();bgMusic.src='';isPlaying=false;currentTrack=-1;
  stopParticles();updatePillUI();
  currentPage='landing';
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active','visible');});
  loginScreen.classList.remove('hidden','fade-out');
  mainApp.classList.add('hidden');nav.classList.remove('visible');
  $('loginUser').value='';$('loginPass').value='';loginError.textContent='';
  showToast('Berhasil keluar 👋');
});

/* ==================================================
   SAVE / RESTORE
================================================== */
function saveUserDataNow(){if(currentUser)saveUserData(currentUser,userData);}
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
    var v=userData[el.dataset.key];
    if(v!==undefined&&v!==''){el.tagName==='TEXTAREA'?el.value=v:el.textContent=v;}
  });
  document.querySelectorAll('.tl-photo-zone').forEach(function(zone){
    var src=userData['tl-photo-'+zone.dataset.tl];if(src)renderTlPhoto(zone,src);
  });
  // Gallery photos restored inside buildPolaroidBoard
  // Map pins
  mapPins=userData.mapPins||[];
  // Letter lock
}
document.addEventListener('blur',function(e){
  var el=e.target;
  if(el.dataset&&el.dataset.key&&currentUser){userData[el.dataset.key]=el.textContent||el.value;saveUserDataNow();}
},true);

/* ==================================================
   NAVIGATION
================================================== */
function navigateTo(pageId){
  if(pageId===currentPage)return;
  var from=document.getElementById('page-'+currentPage);
  var to=document.getElementById('page-'+pageId);
  if(!to)return;
  from.classList.remove('visible');
  setTimeout(function(){
    from.classList.remove('active');to.classList.add('active');void to.offsetWidth;to.classList.add('visible');
    window.scrollTo({top:0,behavior:'smooth'});
    currentPage=pageId;
    document.querySelectorAll('.nav-link').forEach(function(l){l.classList.toggle('active',l.dataset.page===pageId);});
    nav.classList.toggle('visible',pageId!=='landing');
    if(pageId==='landing')startParticles(); else stopParticles();
    if(pageId==='timeline')setTimeout(revealTimeline,280);
    if(pageId==='gallery') setTimeout(revealPolaroids,200);
    if(pageId==='map')     setTimeout(initMap,300);
  },360);
}
document.querySelectorAll('.nav-link').forEach(function(l){
  l.addEventListener('click',function(e){e.preventDefault();navigateTo(l.dataset.page);});
});
document.querySelectorAll('button[data-page]').forEach(function(b){
  b.addEventListener('click',function(){navigateTo(b.dataset.page);});
});

/* ==================================================
   THEME
================================================== */
themeFab.addEventListener('click',function(e){e.stopPropagation();themePanel.classList.toggle('open');});
document.addEventListener('click',function(e){if(!themePanel.contains(e.target))themePanel.classList.remove('open');});
themePanel.addEventListener('click',function(e){e.stopPropagation();});
document.querySelectorAll('.theme-opt').forEach(function(btn){
  btn.addEventListener('click',function(){
    var t=btn.dataset.theme;htmlEl.setAttribute('data-theme',t);
    document.querySelectorAll('.theme-opt').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');themePanel.classList.remove('open');
    if(currentUser){userData.theme=t;saveUserDataNow();}
    showToast('Tema "'+btn.querySelector('span:last-child').textContent+'" diterapkan');
  });
});

/* ==================================================
   GOLD PARTICLES (landing)
================================================== */
var pCtx, pW=0, pH=0, pPts=[], pActive=false, pRaf;
function startParticles(){
  if(!particleCanvas)return;
  particleCanvas.classList.add('active');
  pCtx=particleCanvas.getContext('2d');
  pActive=true; if(pPts.length===0)initPts();pLoop();
}
function stopParticles(){
  if(!particleCanvas)return;
  particleCanvas.classList.remove('active');pActive=false;cancelAnimationFrame(pRaf);
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
  pW=particleCanvas.width=window.innerWidth;pH=particleCanvas.height=window.innerHeight;
  pCtx.clearRect(0,0,pW,pH);
  pPts.forEach(function(p){
    p.x+=p.vx;p.y+=p.vy;p.pulse+=.015;
    if(p.x<0)p.x=pW;if(p.x>pW)p.x=0;
    if(p.y<0)p.y=pH;if(p.y>pH)p.y=0;
    var a=p.o*(0.5+0.5*Math.sin(p.pulse));
    pCtx.save();pCtx.globalAlpha=a;pCtx.fillStyle='#c9a96e';
    pCtx.beginPath();pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);pCtx.fill();pCtx.restore();
  });
  pRaf=requestAnimationFrame(pLoop);
}

/* ==================================================
   FILM STRIP HOLES
================================================== */
function buildFilmHoles(){
  ['filmHolesTop','filmHolesBot'].forEach(function(id){
    var el=$(id); if(!el)return;el.innerHTML='';
    for(var i=0;i<60;i++){var d=document.createElement('div');d.className='film-hole-item';el.appendChild(d);}
  });
}

/* ==================================================
   TIMELINE REVEAL + PARALLAX
================================================== */
function revealTimeline(){
  var items=document.querySelectorAll('.timeline-item');
  items.forEach(function(item,i){setTimeout(function(){item.classList.add('revealed');},i*110);});
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target);}});
  },{threshold:0.08});
  items.forEach(function(item){if(!item.classList.contains('revealed'))obs.observe(item);});
}

// Parallax on scroll — images move slightly slower
window.addEventListener('scroll',function(){
  if(currentPage==='timeline'){
    document.querySelectorAll('.timeline-img-wrap').forEach(function(wrap){
      var rect=wrap.getBoundingClientRect();
      var center=rect.top+rect.height/2;
      var offset=(center-window.innerHeight/2)*0.12;
      wrap.style.transform='translateY('+offset+'px)';
    });
  }
  if(currentPage!=='landing')nav.style.boxShadow=window.scrollY>10?'0 2px 24px var(--shadow)':'none';
});

/* ==================================================
   TIMELINE UPLOAD
================================================== */
function renderTlPhoto(zone,src){
  var img=document.createElement('img');
  img.src=src;img.alt='Foto';
  img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;';
  zone.style.position='relative';zone.innerHTML='';zone.appendChild(img);
  var ni=document.createElement('input');
  ni.type='file';ni.accept='image/*';ni.className='tl-file-input';
  ni.style.cssText='position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:none;z-index:5;';
  zone.appendChild(ni);bindTlInput(ni,zone);
}
function bindTlInput(input,zone){
  input.addEventListener('change',function(){
    var file=this.files[0];
    if(!file||!file.type.startsWith('image/')){showToast('Pilih file gambar');return;}
    var r=new FileReader();
    r.onload=function(ev){
      renderTlPhoto(zone,ev.target.result);
      if(currentUser){userData['tl-photo-'+zone.dataset.tl]=ev.target.result;saveUserDataNow();}
      showToast('✓ Foto timeline disimpan!');
    };r.readAsDataURL(file);
  });
}
document.querySelectorAll('.tl-photo-zone').forEach(function(zone){
  var inp=zone.querySelector('.tl-file-input');if(inp)bindTlInput(inp,zone);
});

/* ==================================================
   POLAROID BOARD
================================================== */
var TILT_PRESETS=[-8,-5,-3,0,2,4,7,-6,3,-2,6,-4,1,-7,5,-1,8,-3];
function buildPolaroidBoard(){
  var board=$('polaroidBoard');if(!board)return;
  board.innerHTML='';
  // Board needs relative positioning for absolute children; set min-height
  var cols=window.innerWidth<500?2:window.innerWidth<800?3:4;
  var cellW=(window.innerWidth>800?210:180), cellH=cellW+90;
  var boardW=board.offsetWidth||window.innerWidth-80;
  board.style.minHeight=(Math.ceil(GALLERY_DATA.length/cols)*cellH+100)+'px';

  var colHeights=[];for(var c=0;c<cols;c++)colHeights.push(60);
  var gapX=Math.max(20,(boardW-cols*cellW)/(cols+1));

  GALLERY_DATA.forEach(function(data,i){
    var col=i%cols;
    var x=gapX+col*(cellW+gapX);
    var y=colHeights[col];
    colHeights[col]+=cellH+Math.random()*30+20;
    var tilt=TILT_PRESETS[i%TILT_PRESETS.length]+(Math.random()*2-1);

    var wrap=document.createElement('div');
    wrap.className='polaroid-wrap pol-hidden';
    wrap.style.cssText='left:'+x+'px;top:'+y+'px;z-index:'+(10+i)+';transform:rotate('+tilt+'deg)';
    wrap.dataset.idx=i;wrap.dataset.tilt=tilt;

    var pol=document.createElement('div');pol.className='polaroid';

    var imgArea=document.createElement('div');imgArea.className='polaroid-img-area';
    var img=document.createElement('img');img.className='polaroid-img';img.alt='';
    var icon=document.createElement('div');icon.className='polaroid-empty-icon';icon.textContent=data.emoji;
    imgArea.appendChild(img);imgArea.appendChild(icon);

    var actions=document.createElement('div');actions.className='polaroid-actions';
    var viewBtn=document.createElement('button');viewBtn.className='pol-view-btn';viewBtn.textContent='⊕ Lihat';
    var uid='pgf'+i;
    var uploadLbl=document.createElement('label');uploadLbl.className='pol-upload-btn';uploadLbl.htmlFor=uid;uploadLbl.textContent='📷 Upload';
    var fileInp=document.createElement('input');fileInp.type='file';fileInp.accept='image/*';
    fileInp.className='polaroid-file-input';fileInp.id=uid;fileInp.dataset.pidx=i;
    fileInp.addEventListener('change',onPolaroidUpload);
    uploadLbl.appendChild(fileInp);
    actions.appendChild(viewBtn);actions.appendChild(uploadLbl);

    var capArea=document.createElement('div');capArea.className='polaroid-caption-area';
    var cap=document.createElement('div');cap.className='polaroid-caption editable';
    cap.contentEditable='true';cap.dataset.key='gl-caption-'+i;
    var savedCap=userData['gl-caption-'+i];
    cap.textContent=savedCap||data.title;
    capArea.appendChild(cap);

    pol.appendChild(imgArea);pol.appendChild(actions);pol.appendChild(capArea);
    wrap.appendChild(pol);board.appendChild(wrap);

    // Restore photo
    var savedSrc=userData['gl-photo-'+i];
    if(savedSrc){img.src=savedSrc;img.style.display='block';imgArea.classList.add('has-photo');wrap.dataset.uploadedSrc=savedSrc;}

    // View modal
    viewBtn.addEventListener('click',function(e){e.stopPropagation();openModal(wrap,cap.textContent);});

    // Drag
    makeDraggable(wrap,tilt);
    // 3D tilt on hover
    pol.addEventListener('mousemove',function(e){
      var r=pol.getBoundingClientRect();
      var rx=((e.clientY-r.top)/r.height-.5)*-6;
      var ry=((e.clientX-r.left)/r.width-.5)*6;
      pol.style.transform='perspective(600px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
    });
    pol.addEventListener('mouseleave',function(){pol.style.transform='';});
  });
}

function onPolaroidUpload(){
  var idx=parseInt(this.dataset.pidx);
  var file=this.files[0];if(!file||!file.type.startsWith('image/')){return;}
  var wrap=document.querySelector('.polaroid-wrap[data-idx="'+idx+'"]');
  var r=new FileReader();
  r.onload=function(ev){
    var src=ev.target.result;
    var imgArea=wrap.querySelector('.polaroid-img-area');
    var img=wrap.querySelector('.polaroid-img');
    img.src=src;img.style.display='block';imgArea.classList.add('has-photo');
    wrap.dataset.uploadedSrc=src;
    if(currentUser){userData['gl-photo-'+idx]=src;saveUserDataNow();}
    showToast('✓ Foto disimpan!');
  };r.readAsDataURL(file);
}

function openModal(wrap,caption){
  var src=wrap.dataset.uploadedSrc||'';
  var emoji=wrap.querySelector('.polaroid-empty-icon')||{};
  modalImgWrap.innerHTML='';
  if(src){var img=document.createElement('img');img.src=src;img.alt=caption;modalImgWrap.appendChild(img);}
  else{var d=document.createElement('div');d.className='modal-placeholder';d.textContent=(emoji.textContent||'🖼️').trim();modalImgWrap.appendChild(d);}
  modalCaption.textContent=caption?'"'+caption+'"':'';
  modalOverlay.classList.add('open');document.body.style.overflow='hidden';
}

function revealPolaroids(){
  var wraps=document.querySelectorAll('.polaroid-wrap');
  wraps.forEach(function(w,i){
    w.classList.add('pol-reveal');
    setTimeout(function(){w.classList.remove('pol-hidden');w.classList.add('pol-visible');},i*60+50);
  });
}

/* Drag functionality */
function makeDraggable(el,baseTilt){
  var dragging=false,ox=0,oy=0,ex=0,ey=0;
  el.addEventListener('mousedown',function(e){
    if(e.target.closest('button')||e.target.closest('label')||e.target.closest('input')||e.target.closest('.polaroid-caption'))return;
    dragging=true;ox=e.clientX-ex;oy=e.clientY-ey;
    el.style.zIndex=999;el.style.transition='box-shadow .2s';
    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  });
  function onMove(e){
    if(!dragging)return;
    ex=e.clientX-ox;ey=e.clientY-oy;
    el.style.transform='rotate('+baseTilt+'deg) translate('+ex+'px,'+ey+'px) scale(1.04)';
  }
  function onUp(){
    dragging=false;el.style.zIndex=10;
    el.style.transform='rotate('+baseTilt+'deg) translate('+ex+'px,'+ey+'px)';
    document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);
  }
}

/* ==================================================
   MODAL
================================================== */
function closeModal(){modalOverlay.classList.remove('open');document.body.style.overflow='';}
modalClose.addEventListener('click',closeModal);
modalOverlay.addEventListener('click',function(e){if(e.target===modalOverlay)closeModal();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});

/* ==================================================
   EDITABLE
================================================== */
document.querySelectorAll('.editable').forEach(function(el){
  el.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!el.classList.contains('timeline-text')&&!el.classList.contains('letter-body')){
      e.preventDefault();el.blur();
    }
  });
  el.addEventListener('blur',function(){if(el.textContent.trim()==='')el.textContent='...';});
});

/* ==================================================
   LOVE LETTER
================================================== */
var letterLock=$('letterLock'), letterSetPw=$('letterSetPw'), letterContent=$('letterContent');
var letterPwInput=$('letterPwInput'), letterPwError=$('letterPwError');

if($('toggleLetterPw')){
  $('toggleLetterPw').addEventListener('click',function(){
    var i=$('letterPwInput');i.type=i.type==='password'?'text':'password';
    this.textContent=i.type==='password'?'👁':'🙈';
  });
}

$('letterUnlockBtn') && $('letterUnlockBtn').addEventListener('click',function(){
  var pw=$('letterPwInput').value;
  letterPwError.textContent='';
  var saved=userData.letterPw;
  if(!saved){showSetPw();return;}
  if(simpleHash(pw)!==saved){letterPwError.textContent='Password salah.';return;}
  showLetterContent();
});

$('lockSetBtn') && $('lockSetBtn').addEventListener('click',showSetPw);

function showSetPw(){
  letterLock.classList.add('hidden');letterSetPw.classList.remove('hidden');
  letterContent.classList.add('hidden');
}
function showLetterContent(){
  letterLock.classList.add('hidden');letterSetPw.classList.add('hidden');
  letterContent.classList.remove('hidden');
}

$('saveLetterPwBtn') && $('saveLetterPwBtn').addEventListener('click',function(){
  var pw=$('newLetterPw').value;
  var err=$('newLetterPwError');err.textContent='';
  if(pw.length<4){err.textContent='Password minimal 4 karakter.';return;}
  userData.letterPw=simpleHash(pw);saveUserDataNow();
  letterSetPw.classList.add('hidden');letterLock.classList.remove('hidden');
  showToast('✓ Password surat disimpan!');
});

$('cancelSetPwBtn') && $('cancelSetPwBtn').addEventListener('click',function(){
  letterSetPw.classList.add('hidden');letterLock.classList.remove('hidden');
});

$('lockAgainBtn') && $('lockAgainBtn').addEventListener('click',function(){
  letterContent.classList.add('hidden');letterLock.classList.remove('hidden');
  $('letterPwInput').value='';
});

/* ==================================================
   MAP (Leaflet.js)
================================================== */
function initMap(){
  if(!window.L){showToast('Map library tidak tersedia.');return;}
  var mapEl=$('leafletMap');
  if(!mapEl||leafletMap)return;

  leafletMap=L.map('leafletMap').setView([-2.5,118],5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap contributors',maxZoom:18
  }).addTo(leafletMap);

  renderMapPins();
  renderMapSidebar();
}

function renderMapPins(){
  if(!leafletMap)return;
  leafletMarkers.forEach(function(m){m.remove();});leafletMarkers=[];
  (userData.mapPins||[]).forEach(function(pin,i){
    var marker=L.marker([pin.lat,pin.lng]).addTo(leafletMap);
    marker.bindPopup('<b>'+pin.name+'</b><br><small>'+pin.note+'</small>');
    leafletMarkers.push(marker);
  });
}

function renderMapSidebar(){
  var list=$('mapPinsList');if(!list)return;list.innerHTML='';
  (userData.mapPins||[]).forEach(function(pin,i){
    var item=document.createElement('div');item.className='map-pin-item';
    var name=document.createElement('span');name.className='map-pin-name';name.textContent='📍 '+pin.name;
    var note=document.createElement('span');note.className='map-pin-note';note.textContent=pin.note;
    var del=document.createElement('button');del.className='map-pin-del';del.textContent='✕';del.title='Hapus';
    del.dataset.pidx=i;del.addEventListener('click',function(e){e.stopPropagation();deletePin(parseInt(this.dataset.pidx));});
    item.appendChild(del);item.appendChild(name);item.appendChild(note);
    item.addEventListener('click',function(){
      if(leafletMap)leafletMap.flyTo([pin.lat,pin.lng],14);
      if(leafletMarkers[i])leafletMarkers[i].openPopup();
    });
    list.appendChild(item);
  });
}

function deletePin(i){
  if(!userData.mapPins)return;
  userData.mapPins.splice(i,1);saveUserDataNow();
  renderMapPins();renderMapSidebar();showToast('Pin dihapus.');
}

$('mapAddBtn') && $('mapAddBtn').addEventListener('click',function(){
  $('mapPinForm').classList.remove('hidden');
});
$('mpfCancel') && $('mpfCancel').addEventListener('click',function(){$('mapPinForm').classList.add('hidden');});
$('mpfSave') && $('mpfSave').addEventListener('click',function(){
  var name=$('mpfName').value.trim();
  var lat=parseFloat($('mpfLat').value);
  var lng=parseFloat($('mpfLng').value);
  var note=$('mpfNote').value.trim();
  if(!name||isNaN(lat)||isNaN(lng)){showToast('Isi nama, latitude, dan longitude dengan benar.');return;}
  if(!userData.mapPins)userData.mapPins=[];
  userData.mapPins.push({name:name,lat:lat,lng:lng,note:note});
  saveUserDataNow();
  $('mapPinForm').classList.add('hidden');
  $('mpfName').value='';$('mpfLat').value='';$('mpfLng').value='';$('mpfNote').value='';
  renderMapPins();renderMapSidebar();
  if(leafletMap)leafletMap.flyTo([lat,lng],14);
  showToast('📍 Pin "'+name+'" ditambahkan!');
});

/* ==================================================
   MUSIC PLAYER
================================================== */
function buildPlaylistUI(){
  mpSlots.innerHTML='';
  PLAYLIST.forEach(function(song,i){
    var slot=document.createElement('div');slot.className='mp-slot has-song';
    if(i===currentTrack)slot.classList.add('active');
    var dot=document.createElement('span');dot.className='mp-slot-dot';
    var num=document.createElement('span');num.className='mp-slot-num';num.textContent=i+1;
    var name=document.createElement('span');name.className='mp-slot-name';name.textContent=song.title;
    var note=document.createElement('span');note.style.cssText='font-size:.8rem;opacity:.4;flex-shrink:0;';note.textContent='♪';
    slot.appendChild(dot);slot.appendChild(num);slot.appendChild(name);slot.appendChild(note);
    (function(idx){slot.addEventListener('click',function(){playTrack(idx);});})(i);
    mpSlots.appendChild(slot);
  });
}

function playTrack(idx){
  if(idx<0||idx>=PLAYLIST.length)return;
  currentTrack=idx;bgMusic.src=PLAYLIST[idx].src;bgMusic.load();
  bgMusic.volume=parseFloat(mpVolume.value)||0.7;
  var p=bgMusic.play();
  if(p!==undefined){
    p.then(function(){isPlaying=true;updatePillUI();buildPlaylistUI();})
    .catch(function(){isPlaying=false;updatePillUI();buildPlaylistUI();
      document.addEventListener('click',function resume(){
        bgMusic.play().then(function(){isPlaying=true;updatePillUI();buildPlaylistUI();}).catch(function(){});
        document.removeEventListener('click',resume);
      });
    });
  }
}
function togglePlay(){
  if(currentTrack===-1){playTrack(0);return;}
  if(isPlaying){bgMusic.pause();isPlaying=false;}
  else{bgMusic.play().then(function(){isPlaying=true;updatePillUI();}).catch(function(){});}
  updatePillUI();
}
function prevTrack(){var i=currentTrack<=0?PLAYLIST.length-1:currentTrack-1;playTrack(i);}
function nextTrack(){var i=currentTrack>=PLAYLIST.length-1?0:currentTrack+1;playTrack(i);}
bgMusic.addEventListener('ended',nextTrack);

function updatePillUI(){
  mpPlayIcon.textContent=isPlaying?'❚❚':'▶';
  mpBar.classList.toggle('is-playing',isPlaying);
  mpPillTitle.textContent=(currentTrack>=0&&PLAYLIST[currentTrack])?PLAYLIST[currentTrack].title:'No music';
}
mpPlay.addEventListener('click',togglePlay);
mpPlay.addEventListener('touchend',function(e){e.preventDefault();togglePlay();});
mpPrev.addEventListener('click',prevTrack);
mpPrev.addEventListener('touchend',function(e){e.preventDefault();prevTrack();});
mpNext.addEventListener('click',nextTrack);
mpNext.addEventListener('touchend',function(e){e.preventDefault();nextTrack();});
mpOpen.addEventListener('click',function(e){e.stopPropagation();mpBar.classList.toggle('panel-open');});
$('mpClose').addEventListener('click',function(){mpBar.classList.remove('panel-open');});
document.addEventListener('click',function(e){if(!mpBar.contains(e.target))mpBar.classList.remove('panel-open');});

bgMusic.addEventListener('timeupdate',function(){
  if(!bgMusic.duration)return;
  var pct=(bgMusic.currentTime/bgMusic.duration)*100;
  mpProgressFill.style.width=pct+'%';mpProgressThumb.style.left=pct+'%';
  mpCurrent.textContent=fmtTime(bgMusic.currentTime);mpDuration.textContent=fmtTime(bgMusic.duration);
});
mpProgressTrack.addEventListener('click',function(e){
  if(!bgMusic.duration)return;
  var rect=mpProgressTrack.getBoundingClientRect();
  bgMusic.currentTime=((e.clientX-rect.left)/rect.width)*bgMusic.duration;
});
mpVolume.addEventListener('input',function(){bgMusic.volume=parseFloat(this.value);});
bgMusic.volume=0.7;

/* ==================================================
   MISC
================================================== */
window.addEventListener('beforeunload',function(){saveAllTextData();});

})();