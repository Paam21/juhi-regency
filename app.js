/* ══════════════════════════════════════════════════════════════
   THE JUHI REGENCY  ·  Palace Application Controller
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── State ───
  let currentRoomIndex = 0;
  let gatesOpened = false;
  let audioPlaying = false;
  const totalRooms = 5;

  const roomNames = [
    'THE PALACE GATES',
    'THE GRAND FOYER',
    'THE ROYAL GALLERY',
    'THE GRAND BALLROOM',
    'THE ROSE GARDEN'
  ];

  // ─── DOM Elements ───
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const invitation = document.getElementById('invitation');
  const enterBtn = document.getElementById('enterBtn');
  const palaceStage = document.getElementById('palaceStage');

  const hudRoomName = document.getElementById('hudRoomName');
  const roomCounter = document.getElementById('roomCounter');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const audioBtn = document.getElementById('audioBtn');
  const bgMusic = document.getElementById('bgMusic');

  const openGatesBtn = document.getElementById('openGatesBtn');
  const gatesViewport = document.getElementById('gatesViewport');
  const r1Content = document.querySelector('.r1-content');

  // Modals
  const memoryOverlay = document.getElementById('memoryOverlay');
  const closeMemoryBtn = document.getElementById('closeMemoryBtn');
  const modalMemoryLabel = document.getElementById('modalMemoryLabel');
  const modalMemoryDate = document.getElementById('modalMemoryDate');
  const modalMemoryCaption = document.getElementById('modalMemoryCaption');
  const memoryPhotoEmpty = document.getElementById('memoryPhotoEmpty');
  const memoryPhotoImg = document.getElementById('memoryPhotoImg');
  const memoryEmojiIcon = document.getElementById('memoryEmojiIcon');

  const letterOverlay = document.getElementById('letterOverlay');
  const closeLetterBtn = document.getElementById('closeLetterBtn');
  const easelInteractive = document.getElementById('easelInteractive');
  const letterPointsContainer = document.getElementById('letterPointsContainer');
  const letterClosingText = document.getElementById('letterClosingText');
  const readLetterAgainBtn = document.getElementById('readLetterAgainBtn');

  const crownOverlay = document.getElementById('crownOverlay');
  const closeCrownBtn = document.getElementById('closeCrownBtn');
  const crownDoneBtn = document.getElementById('crownDoneBtn');
  const claimCrownBtn = document.getElementById('claimCrownBtn');
  const crownInteractive = document.getElementById('crownInteractive');
  const confettiContainer = document.getElementById('confettiContainer');

  // ══════════════════════════════════════════════════════════════
  // PRELOADER
  // ══════════════════════════════════════════════════════════════
  function initPreloader() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add('fade-out');
          invitation.classList.remove('hidden');
          spawnPetals(document.getElementById('fallingPetals'), 20);
        }, 400);
      }
      progressBar.style.width = progress + '%';
      progressText.textContent = progress + '%';
    }, 60);
  }

  // ══════════════════════════════════════════════════════════════
  // INVITATION & ENTER
  // ══════════════════════════════════════════════════════════════
  enterBtn.addEventListener('click', () => {
    invitation.classList.add('hidden');
    palaceStage.classList.remove('hidden');
    buildGalleryFrames();
    buildLoveLetter();
    showRoom(0);
    attemptAudioPlay();
  });

  // ══════════════════════════════════════════════════════════════
  // ROOM 1: 3D GATE OPENING
  // ══════════════════════════════════════════════════════════════
  openGatesBtn.addEventListener('click', () => {
    if (gatesOpened) return;
    gatesOpened = true;

    // Swing open 3D iron gates
    gatesViewport.classList.add('gates-open');
    r1Content.classList.add('fade-out');

    // Zoom camera in through the gates
    const room1Bg = document.querySelector('#room1 .room-bg');
    if (room1Bg) {
      room1Bg.style.transition = 'transform 2.2s cubic-bezier(0.4, 0, 0.2, 1)';
      room1Bg.style.transform = 'scale(1.35)';
    }

    if (!audioPlaying) attemptAudioPlay();

    // Automatically glide into Room 2: The Grand Foyer
    setTimeout(() => {
      goToRoom(1);
    }, 1800);
  });

  // ══════════════════════════════════════════════════════════════
  // ROOM NAVIGATION
  // ══════════════════════════════════════════════════════════════
  function showRoom(index) {
    currentRoomIndex = index;

    // Toggle active room
    for (let i = 0; i < totalRooms; i++) {
      const roomEl = document.getElementById(`room${i + 1}`);
      if (roomEl) {
        if (i === index) {
          roomEl.classList.add('active');
        } else {
          roomEl.classList.remove('active');
        }
      }
    }

    // Update HUD
    roomCounter.textContent = `0${index + 1} / 05`;
    hudRoomName.textContent = roomNames[index];

    // Navigation buttons visibility
    prevBtn.classList.toggle('hidden', index === 0);
    // In room 0 (gates), hide next until gates are opened
    if (index === 0) {
      nextBtn.classList.toggle('hidden', !gatesOpened);
    } else if (index === totalRooms - 1) {
      nextBtn.classList.add('hidden');
    } else {
      nextBtn.classList.remove('hidden');
    }

    // Trigger room 5 special effects (confetti / fireflies)
    if (index === 4) {
      spawnFireflies();
      triggerConfetti();
    }
  }

  function goToRoom(index) {
    if (index < 0 || index >= totalRooms) return;
    showRoom(index);
  }

  prevBtn.addEventListener('click', () => goToRoom(currentRoomIndex - 1));
  nextBtn.addEventListener('click', () => goToRoom(currentRoomIndex + 1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (palaceStage.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') goToRoom(currentRoomIndex + 1);
    if (e.key === 'ArrowLeft') goToRoom(currentRoomIndex - 1);
    if (e.key === 'Escape') closeAllModals();
  });

  // Touch Swipe support (prevent swiping room if scrolling carousel or inside modal)
  let touchStartX = 0;
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (e.target.closest('.frames-carousel') || e.target.closest('.modal-window')) {
      return; // let carousel scroll freely without changing rooms
    }
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 40) {
      if (diffX < 0) goToRoom(currentRoomIndex + 1);
      else goToRoom(currentRoomIndex - 1);
    }
  }, { passive: true });

  // ══════════════════════════════════════════════════════════════
  // HELPER: GET CONFIG
  // ══════════════════════════════════════════════════════════════
  function getPalaceConfig() {
    return window.PALACE_CONFIG || (typeof PALACE_CONFIG !== 'undefined' ? PALACE_CONFIG : null) || {
      princessName: 'Juhi',
      memories: [],
      letterPoints: []
    };
  }

  // ══════════════════════════════════════════════════════════════
  // ROOM 3: GALLERY BUILDER
  // ══════════════════════════════════════════════════════════════
  function buildGalleryFrames() {
    const carousel = document.getElementById('framesCarousel');
    if (!carousel) return;
    carousel.innerHTML = '';

    const cfg = getPalaceConfig();
    const memories = cfg.memories || [];
    memories.forEach((mem, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-frame-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="gold-frame-border">
          <div class="frame-photo-area">
            ${mem.image 
              ? `<img src="${mem.image}" alt="${mem.label}" loading="lazy" />`
              : `<span class="frame-emoji-icon">${mem.emoji || '🌸'}</span>`
            }
          </div>
          <div class="frame-tag">${mem.label}</div>
        </div>
      `;

      let pointerDownX = 0;
      let pointerDownY = 0;
      card.addEventListener('pointerdown', (e) => {
        pointerDownX = e.clientX;
        pointerDownY = e.clientY;
      });
      card.addEventListener('pointerup', (e) => {
        const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
        if (dist < 12) { // genuine click or tap, not a drag
          openMemoryModal(index);
        }
      });
      card.addEventListener('click', () => {
        openMemoryModal(index);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          openMemoryModal(index);
        }
      });

      carousel.appendChild(card);
    });
  }

  function openMemoryModal(index) {
    const cfg = getPalaceConfig();
    const mem = cfg.memories && cfg.memories[index];
    if (!mem) return;

    modalMemoryLabel.textContent = mem.label;
    modalMemoryDate.textContent = mem.date;
    modalMemoryCaption.textContent = mem.caption;

    if (mem.image) {
      memoryPhotoImg.src = mem.image;
      memoryPhotoImg.classList.remove('hidden');
      memoryPhotoEmpty.classList.add('hidden');
    } else {
      memoryPhotoImg.classList.add('hidden');
      memoryPhotoEmpty.classList.remove('hidden');
      memoryEmojiIcon.textContent = mem.emoji || '🌸';
    }

    memoryOverlay.classList.remove('hidden');
  }

  closeMemoryBtn.addEventListener('click', () => memoryOverlay.classList.add('hidden'));
  memoryOverlay.addEventListener('click', (e) => {
    if (e.target === memoryOverlay) memoryOverlay.classList.add('hidden');
  });

  // ══════════════════════════════════════════════════════════════
  // ROOM 4: LOVE LETTER BUILDER
  // ══════════════════════════════════════════════════════════════
  function buildLoveLetter() {
    const cfg = getPalaceConfig();
    const points = cfg.letterPoints || [];
    let html = '';

    points.forEach((pt) => {
      html += `
        <div class="letter-point-item">
          <strong>${pt.title}:</strong>
          ${pt.body}
        </div>
      `;
    });

    letterPointsContainer.innerHTML = html;
    if (cfg.closingLine) {
      letterClosingText.textContent = cfg.closingLine;
    }
  }

  function openLoveLetter() {
    letterOverlay.classList.remove('hidden');
  }

  easelInteractive.addEventListener('click', openLoveLetter);
  readLetterAgainBtn.addEventListener('click', openLoveLetter);
  closeLetterBtn.addEventListener('click', () => letterOverlay.classList.add('hidden'));
  letterOverlay.addEventListener('click', (e) => {
    if (e.target === letterOverlay) letterOverlay.classList.add('hidden');
  });

  // ══════════════════════════════════════════════════════════════
  // ROOM 5: LIVE AR CROWN CAMERA & 6-SECOND COUNTDOWN
  // ══════════════════════════════════════════════════════════════
  const cameraLiveView = document.getElementById('cameraLiveView');
  const cameraResultView = document.getElementById('cameraResultView');
  const crownVideo = document.getElementById('crownVideo');
  const cameraFlash = document.getElementById('cameraFlash');
  const countdownBadge = document.getElementById('countdownBadge');
  const countdownNumber = document.getElementById('countdownNumber');
  const cameraFallback = document.getElementById('cameraFallback');
  const photoUploadFallback = document.getElementById('photoUploadFallback');
  const startTimerBtn = document.getElementById('startTimerBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const downloadPhotoBtn = document.getElementById('downloadPhotoBtn');
  const capturedImg = document.getElementById('capturedImg');
  const photoCanvas = document.getElementById('photoCanvas');

  let cameraMediaStream = null;
  let countdownInterval = null;

  function openCrownModal() {
    crownOverlay.classList.remove('hidden');
    cameraLiveView.classList.remove('hidden');
    cameraResultView.classList.add('hidden');
    countdownBadge.classList.add('hidden');
    cameraFallback.classList.add('hidden');

    startCamera();
  }

  function startCamera() {
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraFallback("Your browser does not support live camera access. Please upload a photo to wear your crown!");
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 720 },
        height: { ideal: 960 }
      },
      audio: false
    })
    .then((stream) => {
      cameraMediaStream = stream;
      crownVideo.srcObject = stream;
      crownVideo.play().catch(() => {});
      cameraFallback.classList.add('hidden');
    })
    .catch((err) => {
      console.warn("Camera access error:", err);
      showCameraFallback("Camera permission was not granted. You can still upload a photo to try on the crown!");
    });
  }

  function stopCamera() {
    if (cameraMediaStream) {
      cameraMediaStream.getTracks().forEach((track) => track.stop());
      cameraMediaStream = null;
    }
    if (crownVideo) {
      crownVideo.srcObject = null;
    }
  }

  function showCameraFallback(msg) {
    if (cameraFallback) {
      cameraFallback.classList.remove('hidden');
      const msgEl = document.getElementById('cameraFallbackMsg');
      if (msgEl) msgEl.textContent = msg;
    }
  }

  // 6-Second Timer Countdown & Capture
  function startSixSecondCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    let timeLeft = 6;
    countdownNumber.textContent = timeLeft;
    countdownBadge.classList.remove('hidden');
    startTimerBtn.disabled = true;

    countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        countdownNumber.textContent = timeLeft;
        // Re-trigger animation
        countdownNumber.style.animation = 'none';
        countdownNumber.offsetHeight; // trigger reflow
        countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
      } else {
        clearInterval(countdownInterval);
        countdownBadge.classList.add('hidden');
        startTimerBtn.disabled = false;
        captureCrownedPhoto();
      }
    }, 1000);
  }

  function captureCrownedPhoto() {
    // 1. Shutter Flash Effect
    cameraFlash.classList.add('flash-active');
    setTimeout(() => {
      cameraFlash.classList.remove('flash-active');
    }, 300);

    // 2. Set Canvas dimensions matching video or default
    const width = crownVideo.videoWidth || 640;
    const height = crownVideo.videoHeight || 850;
    photoCanvas.width = width;
    photoCanvas.height = height;

    const ctx = photoCanvas.getContext('2d');

    // 3. Draw video mirrored (as seen in selfie view)
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(crownVideo, 0, 0, width, height);
    ctx.restore();

    // 4. Render Crown Filter overlay on head
    renderCrownOnCanvas(ctx, width, height);

    // 5. Convert to image & display result
    const photoDataUrl = photoCanvas.toDataURL('image/png');
    capturedImg.src = photoDataUrl;
    downloadPhotoBtn.href = photoDataUrl;

    // Switch view
    cameraLiveView.classList.add('hidden');
    cameraResultView.classList.remove('hidden');

    // Trigger royal fanfare confetti
    triggerConfetti();

    // Stop active camera stream
    stopCamera();
  }

  function renderCrownOnCanvas(ctx, width, height) {
    const crownSize = Math.floor(width * 0.28);
    const crownX = Math.floor(width / 2);
    const crownY = Math.floor(height * 0.17);

    ctx.save();
    ctx.font = `${crownSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Golden drop shadow
    ctx.shadowColor = 'rgba(212, 168, 75, 0.95)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    ctx.fillText('👑', crownX, crownY);

    // Floating sparkles around crown
    ctx.font = `${Math.floor(crownSize * 0.32)}px sans-serif`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.fillText('✨', crownX - crownSize * 0.7, crownY - crownSize * 0.1);
    ctx.fillText('✦', crownX + crownSize * 0.65, crownY - crownSize * 0.25);
    ctx.fillText('✨', crownX + crownSize * 0.75, crownY + crownSize * 0.15);

    // Subtle royal watermark
    ctx.font = `italic ${Math.floor(width * 0.032)}px 'Cinzel', serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#000000';
    ctx.fillText('Princess Juhi · The Juhi Regency 🤍', width / 2, height - 20);

    ctx.restore();
  }

  // Fallback photo upload support
  photoUploadFallback.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        photoCanvas.width = img.width;
        photoCanvas.height = img.height;
        const ctx = photoCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        renderCrownOnCanvas(ctx, img.width, img.height);

        const photoDataUrl = photoCanvas.toDataURL('image/png');
        capturedImg.src = photoDataUrl;
        downloadPhotoBtn.href = photoDataUrl;

        cameraLiveView.classList.add('hidden');
        cameraResultView.classList.remove('hidden');
        triggerConfetti();
        stopCamera();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  startTimerBtn.addEventListener('click', startSixSecondCountdown);

  retakeBtn.addEventListener('click', () => {
    cameraResultView.classList.add('hidden');
    cameraLiveView.classList.remove('hidden');
    startCamera();
    setTimeout(startSixSecondCountdown, 400);
  });

  // ══════════════════════════════════════════════════════════════
  // RADHA SHOWCASE MODAL
  // ══════════════════════════════════════════════════════════════
  const radhaShowcase = document.getElementById('radhaShowcase');
  const radhaOverlay = document.getElementById('radhaOverlay');
  const closeRadhaBtn = document.getElementById('closeRadhaBtn');

  if (radhaShowcase) {
    radhaShowcase.addEventListener('click', () => {
      radhaOverlay.classList.remove('hidden');
    });
  }

  if (closeRadhaBtn) {
    closeRadhaBtn.addEventListener('click', () => {
      radhaOverlay.classList.add('hidden');
    });
  }

  if (radhaOverlay) {
    radhaOverlay.addEventListener('click', (e) => {
      if (e.target === radhaOverlay) radhaOverlay.classList.add('hidden');
    });
  }

  claimCrownBtn.addEventListener('click', openCrownModal);
  if (crownInteractive) crownInteractive.addEventListener('click', openCrownModal);

  function closeCrownModal() {
    stopCamera();
    if (countdownInterval) clearInterval(countdownInterval);
    crownOverlay.classList.add('hidden');
  }

  closeCrownBtn.addEventListener('click', closeCrownModal);
  crownDoneBtn.addEventListener('click', closeCrownModal);

  crownOverlay.addEventListener('click', (e) => {
    if (e.target === crownOverlay) closeCrownModal();
  });

  function closeAllModals() {
    memoryOverlay.classList.add('hidden');
    letterOverlay.classList.add('hidden');
    if (radhaOverlay) radhaOverlay.classList.add('hidden');
    closeCrownModal();
  }

  // ══════════════════════════════════════════════════════════════
  // PARTICLES (PETALS & CONFETTI)
  // ══════════════════════════════════════════════════════════════
  function spawnPetals(container, count = 18) {
    if (!container) return;
    const icons = ['🌸', '🌹', '✨', '🌺', '🤍', '🏵️'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'petal-particle';
      p.textContent = icons[Math.floor(Math.random() * icons.length)];
      p.style.left = `${Math.random() * 100}%`;
      p.style.fontSize = `${Math.random() * 0.7 + 0.8}rem`;
      p.style.animationDuration = `${Math.random() * 4 + 5}s`;
      p.style.animationDelay = `${Math.random() * 4}s`;
      container.appendChild(p);
    }
  }

  function triggerConfetti() {
    confettiContainer.innerHTML = '';
    const shapes = ['♛', '✦', '🌸', '✨', '🤍', '🌹', '★'];
    const colors = ['#f7e098', '#d4a84b', '#ffffff', '#e8b8c8', '#fbd5e5'];

    for (let i = 0; i < 45; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.color = colors[Math.floor(Math.random() * colors.length)];
      piece.style.fontSize = `${Math.random() * 12 + 10}px`;
      piece.style.animationDuration = `${Math.random() * 2.5 + 2}s`;
      piece.style.animationDelay = `${Math.random() * 1.5}s`;
      confettiContainer.appendChild(piece);
    }
  }

  function spawnFireflies() {
    const container = document.getElementById('gardenFireflies');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 25; i++) {
      const fly = document.createElement('div');
      fly.style.position = 'absolute';
      fly.style.width = '3px';
      fly.style.height = '3px';
      fly.style.borderRadius = '50%';
      fly.style.backgroundColor = '#f7e098';
      fly.style.boxShadow = '0 0 8px #f7e098, 0 0 15px #d4a84b';
      fly.style.left = `${Math.random() * 100}%`;
      fly.style.top = `${Math.random() * 100}%`;
      fly.style.opacity = Math.random();
      fly.style.transition = 'all 3s ease';
      container.appendChild(fly);

      setInterval(() => {
        fly.style.left = `${Math.random() * 100}%`;
        fly.style.top = `${Math.random() * 100}%`;
        fly.style.opacity = Math.random() * 0.8 + 0.2;
      }, 3500 + Math.random() * 2000);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // AUDIO CONTROLS
  // ══════════════════════════════════════════════════════════════
  function attemptAudioPlay() {
    if (!bgMusic) return;
    bgMusic.volume = 0.45;
    bgMusic.play()
      .then(() => {
        audioPlaying = true;
        audioBtn.classList.remove('muted');
      })
      .catch(() => {
        audioPlaying = false;
        audioBtn.classList.add('muted');
      });
  }

  audioBtn.addEventListener('click', () => {
    if (!bgMusic) return;
    if (audioPlaying) {
      bgMusic.pause();
      audioPlaying = false;
      audioBtn.classList.add('muted');
    } else {
      bgMusic.play().then(() => {
        audioPlaying = true;
        audioBtn.classList.remove('muted');
      }).catch(() => {
        // audio file might not exist yet
      });
    }
  });

  // ══════════════════════════════════════════════════════════════
  // INITIALIZE
  // ══════════════════════════════════════════════════════════════
  buildGalleryFrames();
  buildLoveLetter();
  initPreloader();

})();
