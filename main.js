gsap.registerPlugin(ScrollTrigger);

// ── Three.js Particle Background ──
function initParticles() {
  if (window.innerWidth < 768) return;

  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 4;

  const COUNT = 160;
  const positions = new Float32Array(COUNT * 3);
  const speeds = [];

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    speeds.push(Math.random() * 0.004 + 0.001);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size: 0.016, color: 0xc9a84c, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(geo, mat));

  let rafId;
  (function animate() {
    rafId = requestAnimationFrame(animate);
    const pos = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -4;
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    if (window.innerWidth < 768) { cancelAnimationFrame(rafId); return; }
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ── Dedication Sequence ──
function runDedication() {
  const overlay = document.getElementById('dedication');
  const perTe   = overlay.querySelector('.ded-per-te');
  const name    = overlay.querySelector('.ded-name');

  gsap.set(perTe, { y: 14 });

  const tl = gsap.timeline({
    onComplete() {
      gsap.to(overlay, {
        opacity: 0, duration: 0.7,
        onComplete() {
          overlay.style.display = 'none';
          showHero();
        }
      });
    }
  });

  tl.to(perTe, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, 0.4)
    .to(perTe, { opacity: 0, duration: 0.5 }, '+=0.9')
    .fromTo(name, { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' })
    .to(name, { opacity: 0, scale: 1.08, duration: 0.8, ease: 'power2.in' }, '+=1.3');
}

// ── Hero Reveal ──
function showHero() {
  gsap.to('.hero-content', {
    opacity: 1, y: 0, duration: 1.3, ease: 'power3.out',
    onComplete() {
      document.getElementById('city-nav').classList.add('visible');
    }
  });
}

// ── Mouse Parallax on Photo Stacks ──
function initParallax() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', (e) => {
    const xR = e.clientX / window.innerWidth - 0.5;
    const yR = e.clientY / window.innerHeight - 0.5;

    document.querySelectorAll('[data-depth]').forEach(stack => {
      const r = stack.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      stack.querySelectorAll('.photo-layer').forEach(layer => {
        const d = parseFloat(layer.dataset.z);
        gsap.to(layer, {
          x: xR * d * 18,
          y: yR * d * 11,
          rotateY: xR * d * 2.5,
          rotateX: yR * d * -2.5,
          duration: 1.5,
          ease: 'power2.out'
        });
      });
    });
  });
}

// ── Ken Burns on BG Layers ──
function initKenBurns() {
  document.querySelectorAll('.bg-layer').forEach((layer, i) => {
    const dir = i % 2 === 0 ? -10 : 10;
    gsap.to(layer, {
      x: dir, y: -6,
      duration: 22,
      ease: 'none',
      yoyo: true,
      repeat: -1
    });
  });
}

// ── Nav: indicator + active state ──
function initNav() {
  const nav   = document.getElementById('city-nav');
  const inner = nav.querySelector('.nav-inner');
  const btns  = nav.querySelectorAll('.nav-btn');
  const line  = nav.querySelector('.nav-indicator');

  function moveTo(btn) {
    const navRect = inner.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    line.style.left  = (btnRect.left - navRect.left + inner.scrollLeft) + 'px';
    line.style.width = btnRect.width + 'px';
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(`panel-${btn.dataset.index}`);
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      moveTo(btn);
    });
  });

  document.querySelectorAll('.city-panel').forEach((panel, i) => {
    ScrollTrigger.create({
      trigger: panel,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter:     () => moveTo(btns[i]),
      onEnterBack: () => moveTo(btns[i])
    });
  });

  setTimeout(() => moveTo(btns[0]), 600);
}

// ── Lazy Image Load ──
function initLazyImages() {
  document.querySelectorAll('.photo-layer img').forEach(img => {
    const mark = () => img.classList.add('loaded');
    img.complete ? mark() : img.addEventListener('load', mark);
  });
}

// ── Scroll Reveal on City Stories ──
function initScrollReveals() {
  document.querySelectorAll('.city-story').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: 35 },
      {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  gsap.fromTo('.finale-inner > *',
    { opacity: 0, y: 28 },
    {
      opacity: 1, y: 0, stagger: 0.28, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '#finale', start: 'top 72%' }
    }
  );
}

// ── Begin Button ──
function initBeginBtn() {
  document.getElementById('begin-btn').addEventListener('click', () => {
    document.getElementById('tour').scrollIntoView({ behavior: 'smooth' });
  });
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initParallax();
  initKenBurns();
  initNav();
  initLazyImages();
  initScrollReveals();
  initBeginBtn();
  runDedication();
});
