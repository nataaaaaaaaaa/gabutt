/* =========================================
   MUSEUM OF US — script.js
   Full: Login + LocalStorage + Gallery Fix
   ========================================= */
(function () {
  'use strict';

  /* ============================================================
     STORAGE HELPERS
     All user data stored under key: "mou_<username>"
  ============================================================ */
  var USERS_KEY = 'mou_users';   // { username: hashedPassword }
  var SESSION_KEY = 'mou_session'; // currently logged-in username

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch(e) { return {}; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function getUserData(username) {
    try { return JSON.parse(localStorage.getItem('mou_data_' + username)) || {}; } catch(e) { return {}; }
  }
  function saveUserData(username, data) {
    try { localStorage.setItem('mou_data_' + username, JSON.stringify(data)); } catch(e) {
      showToast('⚠️ Storage penuh. Beberapa foto mungkin tidak tersimpan.', 4000);
    }
  }

  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  function getSession() { return localStorage.getItem(SESSION_KEY) || ''; }
  function setSession(u) { localStorage.setItem(SESSION_KEY, u); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  /* ============================================================
     CURRENT USER
  ============================================================ */
  var currentUser = '';
  var userData = {};   // in-memory copy of current user's data

  /* ============================================================
     DOM
  ============================================================ */
  var loginScreen   = document.getElementById('loginScreen');
  var mainApp       = document.getElementById('mainApp');
  var htmlEl        = document.documentElement;
  var nav           = document.getElementById('museumNav');
  var navUsername   = document.getElementById('navUsername');
  var logoutBtn     = document.getElementById('logoutBtn');
  var musicFileInput= document.getElementById('musicFileInput');
  var musicBtn      = document.getElementById('musicBtn');
  var musicIcon     = document.getElementById('musicIcon');
  var musicLabel    = document.getElementById('musicLabel');
  var bgMusic       = document.getElementById('bgMusic');
  var modalOverlay  = document.getElementById('modalOverlay');
  var modalClose    = document.getElementById('modalClose');
  var modalCaption  = document.getElementById('modalCaption');
  var modalImgWrap  = document.getElementById('modalImgWrap');
  var toastEl       = document.getElementById('toast');
  var themeFab      = document.getElementById('themeFab');
  var themePanel    = document.getElementById('themePanel');
  var tabLogin      = document.getElementById('tabLogin');
  var tabRegister   = document.getElementById('tabRegister');
  var formLogin     = document.getElementById('formLogin');
  var formRegister  = document.getElementById('formRegister');
  var loginError    = document.getElementById('loginError');
  var registerError = document.getElementById('registerError');

  var currentPage  = 'landing';
  var musicPlaying = false;

  /* ============================================================
     TOAST
  ============================================================ */
  var toastTimer;
  function showToast(msg, dur) {
    dur = dur || 2600;
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(function() { toastEl.classList.remove('show'); }, dur);
  }

  /* ============================================================
     LOGIN UI
  ============================================================ */
  // Tab toggle
  tabLogin.addEventListener('click', function() {
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    formLogin.classList.remove('hidden'); formRegister.classList.add('hidden');
    loginError.textContent = ''; registerError.textContent = '';
  });
  tabRegister.addEventListener('click', function() {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    formRegister.classList.remove('hidden'); formLogin.classList.add('hidden');
    loginError.textContent = ''; registerError.textContent = '';
  });

  // Password toggles
  function bindPwToggle(toggleId, inputId) {
    document.getElementById(toggleId).addEventListener('click', function() {
      var inp = document.getElementById(inputId);
      inp.type = inp.type === 'password' ? 'text' : 'password';
      this.textContent = inp.type === 'password' ? '👁' : '🙈';
    });
  }
  bindPwToggle('toggleLoginPw', 'loginPass');
  bindPwToggle('toggleRegPw',   'regPass');

  // LOGIN
  formLogin.addEventListener('submit', function(e) {
    e.preventDefault();
    var user = document.getElementById('loginUser').value.trim();
    var pass = document.getElementById('loginPass').value;
    loginError.textContent = '';

    if (!user || !pass) { loginError.textContent = 'Username dan password wajib diisi.'; return; }

    var users = getUsers();
    if (!users[user]) { loginError.textContent = 'Username tidak ditemukan.'; return; }
    if (users[user] !== simpleHash(pass)) { loginError.textContent = 'Password salah.'; return; }

    setSession(user);
    enterApp(user);
  });

  // REGISTER
  formRegister.addEventListener('submit', function(e) {
    e.preventDefault();
    var user  = document.getElementById('regUser').value.trim();
    var pass  = document.getElementById('regPass').value;
    var pass2 = document.getElementById('regPassConfirm').value;
    registerError.textContent = '';

    if (!user || !pass) { registerError.textContent = 'Username dan password wajib diisi.'; return; }
    if (user.length < 3) { registerError.textContent = 'Username minimal 3 karakter.'; return; }
    if (pass.length < 4) { registerError.textContent = 'Password minimal 4 karakter.'; return; }
    if (pass !== pass2)  { registerError.textContent = 'Password tidak cocok.'; return; }

    var users = getUsers();
    if (users[user]) { registerError.textContent = 'Username sudah digunakan.'; return; }

    users[user] = simpleHash(pass);
    saveUsers(users);
    setSession(user);
    enterApp(user);
  });

  /* ============================================================
     ENTER APP
  ============================================================ */
  function enterApp(username) {
    currentUser = username;
    userData = getUserData(username);

    navUsername.textContent = username;

    // Animate login screen out
    loginScreen.classList.add('fade-out');
    setTimeout(function() { loginScreen.classList.add('hidden'); }, 500);
    mainApp.classList.remove('hidden');

    // Restore saved state
    restoreState();

    // Init landing page
    var landing = document.getElementById('page-landing');
    landing.classList.add('active');
    setTimeout(function() { landing.classList.add('visible'); }, 80);
  }

  // Check for existing session on load
  (function checkSession() {
    var saved = getSession();
    if (saved && getUsers()[saved]) {
      enterApp(saved);
    }
  })();

  /* ============================================================
     LOGOUT
  ============================================================ */
  logoutBtn.addEventListener('click', function() {
    saveAllTextData(); // save before leaving
    clearSession();
    currentUser = '';
    userData = {};
    musicPlaying = false;
    bgMusic.pause();
    bgMusic.src = '';
    musicBtn.style.display = 'none';
    document.getElementById('musicUploadLabel').style.display = '';
    // Reset pages
    currentPage = 'landing';
    document.querySelectorAll('.page').forEach(function(p) {
      p.classList.remove('active','visible');
    });
    // Show login
    loginScreen.classList.remove('hidden','fade-out');
    mainApp.classList.add('hidden');
    nav.classList.remove('visible');
    // Clear form fields
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    loginError.textContent = '';
    showToast('Berhasil keluar. Sampai jumpa! 👋');
  });

  /* ============================================================
     SAVE / RESTORE STATE (localStorage per user)
  ============================================================ */
  function saveUserDataNow() {
    if (!currentUser) return;
    saveUserData(currentUser, userData);
  }

  function saveAllTextData() {
    // Save all editable text fields
    document.querySelectorAll('[data-key]').forEach(function(el) {
      userData[el.dataset.key] = el.textContent;
    });
    saveUserDataNow();
  }

  function restoreState() {
    if (!userData) return;

    // Theme
    if (userData.theme) {
      htmlEl.setAttribute('data-theme', userData.theme);
      document.querySelectorAll('.theme-opt').forEach(function(b) {
        b.classList.toggle('active', b.dataset.theme === userData.theme);
      });
    }

    // Text fields
    document.querySelectorAll('[data-key]').forEach(function(el) {
      var key = el.dataset.key;
      if (userData[key] !== undefined && userData[key] !== '') {
        el.textContent = userData[key];
      }
    });

    // Timeline photos
    document.querySelectorAll('.tl-photo-zone').forEach(function(zone) {
      var idx = zone.dataset.tl;
      var src = userData['tl-photo-' + idx];
      if (src) renderTimelinePhoto(zone, src);
    });

    // Gallery photos
    document.querySelectorAll('.gallery-item[data-gidx]').forEach(function(item) {
      var idx = item.dataset.gidx;
      var src = userData['gl-photo-' + idx];
      if (src) renderGalleryPhoto(item, src);
    });
  }

  /* ============================================================
     AUTO-SAVE text on blur
  ============================================================ */
  document.addEventListener('blur', function(e) {
    var el = e.target;
    if (el.dataset && el.dataset.key && currentUser) {
      userData[el.dataset.key] = el.textContent;
      saveUserDataNow();
    }
  }, true);

  /* ============================================================
     NAVIGATION
  ============================================================ */
  function navigateTo(pageId) {
    if (pageId === currentPage) return;
    var from = document.getElementById('page-' + currentPage);
    var to   = document.getElementById('page-' + pageId);
    if (!to) return;

    from.classList.remove('visible');
    setTimeout(function() {
      from.classList.remove('active');
      to.classList.add('active');
      void to.offsetWidth;
      to.classList.add('visible');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      currentPage = pageId;
      document.querySelectorAll('.nav-link').forEach(function(l) {
        l.classList.toggle('active', l.dataset.page === pageId);
      });
      nav.classList.toggle('visible', pageId !== 'landing');
      if (pageId === 'timeline') setTimeout(revealTimeline, 250);
      if (pageId === 'gallery')  setTimeout(revealGallery, 200);
    }, 360);
  }

  document.querySelectorAll('.nav-link').forEach(function(l) {
    l.addEventListener('click', function(e) { e.preventDefault(); navigateTo(l.dataset.page); });
  });
  document.querySelectorAll('button[data-page]').forEach(function(b) {
    b.addEventListener('click', function() { navigateTo(b.dataset.page); });
  });

  /* ============================================================
     THEME
  ============================================================ */
  themeFab.addEventListener('click', function(e) {
    e.stopPropagation();
    themePanel.classList.toggle('open');
  });
  document.addEventListener('click', function() { themePanel.classList.remove('open'); });
  themePanel.addEventListener('click', function(e) { e.stopPropagation(); });

  document.querySelectorAll('.theme-opt').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var theme = btn.dataset.theme;
      htmlEl.setAttribute('data-theme', theme);
      document.querySelectorAll('.theme-opt').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      themePanel.classList.remove('open');
      if (currentUser) { userData.theme = theme; saveUserDataNow(); }
      showToast('Tema "' + btn.querySelector('span:last-child').textContent + '" diterapkan');
    });
  });

  /* ============================================================
     TIMELINE REVEAL
  ============================================================ */
  function revealTimeline() {
    var items = document.querySelectorAll('.timeline-item');
    items.forEach(function(item, i) {
      setTimeout(function() { item.classList.add('revealed'); }, i * 130);
    });
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    items.forEach(function(item) { if (!item.classList.contains('revealed')) obs.observe(item); });
  }

  /* ============================================================
     GALLERY REVEAL
  ============================================================ */
  function revealGallery() {
    document.querySelectorAll('.gallery-item').forEach(function(item, i) {
      item.style.opacity = '0';
      item.style.transform = 'scale(0.93) translateY(12px)';
      item.style.transition = 'opacity 0.5s ease ' + (i*0.04) + 's, transform 0.5s ease ' + (i*0.04) + 's';
      setTimeout(function() {
        item.style.opacity = '1';
        item.style.transform = 'scale(1) translateY(0)';
      }, 30 + i*45);
    });
  }

  /* ============================================================
     TIMELINE PHOTO UPLOAD
  ============================================================ */
  function renderTimelinePhoto(zone, src) {
    // Build img + new input
    var img = document.createElement('img');
    img.src = src;
    img.alt = 'Foto kenangan';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;';
    zone.style.position = 'relative';

    // Remove existing placeholder content but keep zone
    zone.innerHTML = '';
    zone.appendChild(img);

    // New file input on top
    var newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.accept = 'image/*';
    newInput.className = 'tl-file-input';
    newInput.style.cssText = 'position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;z-index:5;';
    zone.appendChild(newInput);

    bindTimelineInput(newInput, zone);
  }

  function bindTimelineInput(input, zone) {
    input.addEventListener('change', function() {
      var file = this.files[0];
      if (!file || !file.type.startsWith('image/')) { showToast('Pilih file gambar'); return; }
      var reader = new FileReader();
      reader.onload = function(ev) {
        var src = ev.target.result;
        var idx = zone.dataset.tl;
        renderTimelinePhoto(zone, src);
        if (currentUser) {
          userData['tl-photo-' + idx] = src;
          saveUserDataNow();
        }
        showToast('✓ Foto timeline disimpan!');
      };
      reader.readAsDataURL(file);
    });
  }

  document.querySelectorAll('.tl-photo-zone').forEach(function(zone) {
    var input = zone.querySelector('.tl-file-input');
    if (input) bindTimelineInput(input, zone);
  });

  /* ============================================================
     GALLERY PHOTO UPLOAD
     Structure per item:
       .gallery-img-area
         img.gallery-img   (hidden by default, shown when photo loaded)
         .gallery-empty-icon (emoji, hidden when photo loaded)
  ============================================================ */
  function renderGalleryPhoto(item, src) {
    var area = item.querySelector('.gallery-img-area');
    var img  = item.querySelector('.gallery-img');
    if (!area || !img) return;
    img.src = src;
    img.style.display = 'block';
    area.classList.add('has-photo');
    // Store for modal
    item.dataset.uploadedSrc = src;
  }

  document.querySelectorAll('.gallery-file-input').forEach(function(input) {
    input.addEventListener('change', function() {
      var file = this.files[0];
      if (!file || !file.type.startsWith('image/')) { showToast('Pilih file gambar'); return; }

      var galleryItem = this.closest('.gallery-item');
      var idx = galleryItem.dataset.gidx;

      var reader = new FileReader();
      reader.onload = function(ev) {
        var src = ev.target.result;
        renderGalleryPhoto(galleryItem, src);
        if (currentUser) {
          userData['gl-photo-' + idx] = src;
          saveUserDataNow();
        }
        showToast('✓ Foto gallery disimpan!');
      };
      reader.readAsDataURL(file);
    });
  });

  /* ============================================================
     GALLERY MODAL
  ============================================================ */
  document.querySelectorAll('.gal-view-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var item       = btn.closest('.gallery-item');
      var captionEl  = item.querySelector('.gallery-caption');
      var caption    = captionEl ? captionEl.textContent.trim() : '';
      var uploadedSrc = item.dataset.uploadedSrc || '';
      var emojiEl    = item.querySelector('.gallery-empty-icon');
      var emoji      = emojiEl ? emojiEl.textContent.trim() : '🖼️';

      modalImgWrap.innerHTML = '';
      if (uploadedSrc) {
        var img = document.createElement('img');
        img.src = uploadedSrc; img.alt = caption;
        modalImgWrap.appendChild(img);
      } else {
        var div = document.createElement('div');
        div.className = 'modal-placeholder';
        div.textContent = emoji;
        modalImgWrap.appendChild(div);
      }
      modalCaption.textContent = caption ? '"' + caption + '"' : '';
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; }
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

  /* ============================================================
     EDITABLE FIELDS — Enter key behavior
  ============================================================ */
  document.querySelectorAll('.editable').forEach(function(el) {
    el.addEventListener('keydown', function(e) {
      // Enter in single-line fields (date, heading) = blur
      if (e.key === 'Enter' && !el.classList.contains('timeline-text') && !el.classList.contains('gallery-caption')) {
        e.preventDefault(); el.blur();
      }
    });
    el.addEventListener('blur', function() {
      if (el.textContent.trim() === '') el.textContent = '...';
    });
  });

  /* ============================================================
     MUSIC
  ============================================================ */
  musicFileInput.addEventListener('change', function() {
    var file = this.files[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { showToast('Pilih file audio (mp3, wav, ogg)'); return; }

    var url = URL.createObjectURL(file);
    bgMusic.src = url;
    bgMusic.load();
    document.getElementById('musicUploadLabel').style.display = 'none';
    musicBtn.style.display = 'flex';

    bgMusic.play().then(function() {
      musicPlaying = true;
      musicBtn.classList.add('playing');
      musicIcon.textContent = '♫';
      musicLabel.textContent = 'Pause';
      showToast('🎵 ' + file.name.replace(/\.[^.]+$/, '') + ' — sedang diputar');
    }).catch(function() {
      showToast('Klik Play untuk memutar musik');
    });
  });

  musicBtn.addEventListener('click', function() {
    if (musicPlaying) {
      bgMusic.pause(); musicPlaying = false;
      musicBtn.classList.remove('playing');
      musicIcon.textContent = '♪'; musicLabel.textContent = 'Play';
    } else {
      bgMusic.play().then(function() {
        musicPlaying = true; musicBtn.classList.add('playing');
        musicIcon.textContent = '♫'; musicLabel.textContent = 'Pause';
      });
    }
  });

  /* ============================================================
     NAV SHADOW
  ============================================================ */
  window.addEventListener('scroll', function() {
    if (currentPage !== 'landing')
      nav.style.boxShadow = window.scrollY > 10 ? '0 2px 24px var(--shadow)' : 'none';
  });

  /* ============================================================
     3D TILT — Timeline Cards
  ============================================================ */
  document.querySelectorAll('.timeline-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var r  = card.getBoundingClientRect();
      var rx = ((e.clientY - r.top)  / r.height - 0.5) * -4;
      var ry = ((e.clientX - r.left) / r.width  - 0.5) * 4;
      card.style.transform = 'translateY(-5px) perspective(700px) rotateX('+rx+'deg) rotateY('+ry+'deg)';
    });
    card.addEventListener('mouseleave', function() { card.style.transform = ''; });
  });

  /* ============================================================
     SAVE before unload
  ============================================================ */
  window.addEventListener('beforeunload', function() {
    saveAllTextData();
  });

})();