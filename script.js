const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// Year
$('#year').textContent = new Date().getFullYear();

// Mobile menu
const menuToggle = $('.menu-toggle');
const mobileMenu = $('.mobile-menu');
function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
$$('.mobile-menu a').forEach(link => link.addEventListener('click', () => setMenu(false)));

// Reveal on scroll
$$('.reveal').forEach((el) => {
  const delay = el.dataset.delay || 0;
  el.style.setProperty('--delay', `${delay}ms`);
});
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

// Eye tracking -------------------------------------------------------------
// Desktop: follows the pointer.
// Touch devices: follows the finger while touching; when idle the eyes gently
// wander so the character still feels alive even though phones have no cursor.
const pupils = $$('.pupil');
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
let lastEyeInput = 0;
let idleEyeFrame = 0;

function moveEyes(x, y, strength = 1) {
  pupils.forEach((pupil) => {
    const eye = pupil.parentElement;
    const rect = eye.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(y - cy, x - cx);
    const maxDistance = Math.min(rect.width * 0.22, 11) * strength;

    pupil.style.transform = `translate(${Math.cos(angle) * maxDistance}px, ${Math.sin(angle) * maxDistance}px)`;
  });
}

function handleEyePointer(e) {
  lastEyeInput = performance.now();
  moveEyes(e.clientX, e.clientY);
}

window.addEventListener('pointermove', handleEyePointer, { passive: true });
window.addEventListener('pointerdown', handleEyePointer, { passive: true });
window.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  if (!touch) return;
  lastEyeInput = performance.now();
  moveEyes(touch.clientX, touch.clientY);
}, { passive: true });

function animateIdleEyes(now) {
  if (coarsePointer && now - lastEyeInput > 900) {
    // Slow figure-eight gaze on touch devices. The target is viewport-relative,
    // so all characters look in roughly the same natural direction.
    const x = innerWidth * (0.5 + Math.sin(now / 1700) * 0.22);
    const y = innerHeight * (0.44 + Math.sin(now / 2300 + 1.2) * 0.13);
    moveEyes(x, y, 0.72);
  }
  idleEyeFrame = requestAnimationFrame(animateIdleEyes);
}
idleEyeFrame = requestAnimationFrame(animateIdleEyes);

// Timeline glow ------------------------------------------------------------
// One light pulse slides along the vertical line and locks onto the hovered /
// focused item. On touch, tapping an item activates it.
const timeline = $('.timeline');
if (timeline) {
  const glow = document.createElement('span');
  glow.className = 'timeline-glow';
  glow.setAttribute('aria-hidden', 'true');
  timeline.prepend(glow);

  const items = $$('.timeline-item', timeline);

  function activateTimelineItem(item) {
    items.forEach(el => el.classList.toggle('is-active', el === item));
    timeline.classList.add('is-active');

    const itemRect = item.getBoundingClientRect();
    const timelineRect = timeline.getBoundingClientRect();
    const dotCenter = itemRect.top - timelineRect.top + 40;
    const glowCenter = glow.offsetHeight / 2;
    glow.style.transform = `translateY(${dotCenter - 22 - glowCenter}px)`;
  }

  function clearTimeline() {
    items.forEach(el => el.classList.remove('is-active'));
    timeline.classList.remove('is-active');
  }

  items.forEach((item) => {
    item.tabIndex = 0;
    item.addEventListener('mouseenter', () => activateTimelineItem(item));
    item.addEventListener('focus', () => activateTimelineItem(item));
    item.addEventListener('pointerdown', () => activateTimelineItem(item), { passive: true });
    item.addEventListener('blur', clearTimeline);
  });

  timeline.addEventListener('mouseleave', clearTimeline);
}

// Custom cursor
const dot = $('.cursor-dot');
const ring = $('.cursor-ring');
let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
window.addEventListener('pointermove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});
function animateCursor() {
  ringX += (mouseX - ringX) * 0.16;
  ringY += (mouseY - ringY) * 0.16;
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();
$$('a, button, .tilt, .timeline-item').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
  el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
});

// Magnetic hover
$$('.magnetic').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// Subtle card tilt
$$('.tilt').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    if (window.matchMedia('(max-width: 700px)').matches) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - py) * 4;
    const rotateY = (px - 0.5) * 5;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// Active navigation
const sections = $$('main section[id]');
const navLinks = $$('.desktop-nav a');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -45% 0px' });
sections.forEach(section => navObserver.observe(section));

// Particle background
const canvas = $('#particles');
const ctx = canvas.getContext('2d');
let particles = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);
function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(110, Math.floor(innerWidth / 12));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.2 + 0.2,
    vx: (Math.random() - 0.5) * 0.09,
    vy: (Math.random() - 0.5) * 0.09,
    a: Math.random() * 0.45 + 0.08,
  }));
}
function drawParticles() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < -5) p.x = innerWidth + 5;
    if (p.x > innerWidth + 5) p.x = -5;
    if (p.y < -5) p.y = innerHeight + 5;
    if (p.y > innerHeight + 5) p.y = -5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 248, 235, ${p.a})`;
    ctx.fill();
  }
  requestAnimationFrame(drawParticles);
}
resizeCanvas();
drawParticles();
window.addEventListener('resize', resizeCanvas);

// Detect whether assets/emma.jpg exists and hide the placeholder if it does.
const img = new Image();
img.onload = () => $('.main-photo')?.classList.add('has-photo');
img.src = 'assets/emma.jpg';
