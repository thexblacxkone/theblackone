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

// Terminal mode ------------------------------------------------------------
// A playful command layer that can navigate the page and make the orb react.
const terminalShell = $('#terminalShell');
const terminalWindow = $('.terminal-window');
const terminalBody = $('#terminalBody');
const terminalOutput = $('#terminalOutput');
const terminalForm = $('#terminalForm');
const terminalInput = $('#terminalInput');
const terminalTriggers = $$('.terminal-trigger');
const terminalClosers = $$('[data-terminal-close]');
const terminalDragHandle = $('[data-terminal-drag]');

if (terminalShell && terminalWindow && terminalBody && terminalOutput && terminalForm && terminalInput) {
  const commandNames = [
    'help', 'about', 'experience', 'contact', 'skills', 'whoami',
    'clear', 'coffee', 'secret', 'orb', 'blink', 'dance', 'sleep',
    'wake', 'panic', 'hide', 'show', 'bigeyes', 'spin', 'home'
  ];
  let terminalHasBooted = false;
  let commandHistory = [];
  let historyIndex = 0;
  let previousFocus = null;
  let dragState = null;
  let orbEffectTimer = null;

  const sleepMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function line(text = '', className = '') {
    const el = document.createElement('div');
    el.className = `terminal-line ${className}`.trim();
    el.textContent = text;
    terminalOutput.appendChild(el);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return el;
  }

  async function typeLine(text, className = '', speed = 16) {
    const el = line('', className);
    for (const char of text) {
      el.textContent += char;
      terminalBody.scrollTop = terminalBody.scrollHeight;
      await sleepMs(speed + Math.random() * speed * .35);
    }
    return el;
  }

  function spacer() { line('', 'spacer'); }

  async function bootTerminal() {
    if (terminalHasBooted) return;
    terminalHasBooted = true;
    await typeLine('booting the black one...', 'dim', 10);
    await sleepMs(150);
    await typeLine('personality module ............. loaded', 'dim', 8);
    await typeLine('orb subsystem .................. watching', 'dim', 8);
    await typeLine('unnecessary amount of CSS ...... yes', 'dim', 8);
    spacer();
    await typeLine('welcome to the black one terminal.', 'accent', 15);
    await typeLine("type 'help' to see what this thing can do.", 'dim', 12);
    spacer();
  }

  async function openTerminal() {
    previousFocus = document.activeElement;
    terminalShell.classList.add('is-open');
    terminalShell.setAttribute('aria-hidden', 'false');
    document.body.classList.add('terminal-open');
    setMenu(false);
    await sleepMs(180);
    terminalInput.focus({ preventScroll: true });
    await bootTerminal();
  }

  function closeTerminal() {
    terminalShell.classList.remove('is-open');
    terminalShell.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('terminal-open');
    resetTerminalPosition();
    if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
  }

  terminalTriggers.forEach(trigger => trigger.addEventListener('click', openTerminal));
  terminalClosers.forEach(el => el.addEventListener('click', closeTerminal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && terminalShell.classList.contains('is-open')) closeTerminal();
  });

  function scrollToSection(id) {
    const section = document.getElementById(id);
    if (!section) return false;
    closeTerminal();
    setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return true;
  }

  function clearOrbEffects() {
    clearTimeout(orbEffectTimer);
    document.body.classList.remove('orb-party', 'orb-panic', 'orb-sleep', 'orb-hide', 'orb-big-eyes');
    $$('.orb, .peek-orb').forEach(el => el.classList.remove('orb-blink', 'orb-spin'));
  }

  function temporaryBodyEffect(className, duration = 2400) {
    clearOrbEffects();
    document.body.classList.add(className);
    orbEffectTimer = setTimeout(() => document.body.classList.remove(className), duration);
  }

  function blinkOrbs() {
    $$('.orb, .peek-orb').forEach(el => {
      el.classList.remove('orb-blink');
      void el.offsetWidth;
      el.classList.add('orb-blink');
      setTimeout(() => el.classList.remove('orb-blink'), 450);
    });
  }

  function spinOrbs() {
    $$('.orb, .peek-orb').forEach(el => {
      el.classList.remove('orb-spin');
      void el.offsetWidth;
      el.classList.add('orb-spin');
      setTimeout(() => el.classList.remove('orb-spin'), 950);
    });
  }

  async function orbSequence() {
    line('orb diagnostic running...', 'dim');
    await sleepMs(300);
    blinkOrbs();
    await sleepMs(500);
    spinOrbs();
    await sleepMs(750);
    temporaryBodyEffect('orb-big-eyes', 1300);
    await sleepMs(500);
    line('orb status: emotionally available, visually suspicious.', 'accent');
  }

  const commands = {
    help: async () => {
      line('available commands:', 'accent');
      line('  about       → who is Emma?', 'yellow');
      line('  experience  → jump to experience', 'yellow');
      line('  skills      → jump to competencies', 'yellow');
      line('  contact     → open contact section', 'yellow');
      line('  whoami      → tiny identity crisis', 'yellow');
      line('  orb         → run orb diagnostics', 'yellow');
      line('  blink       → blink', 'yellow');
      line('  dance       → orb dance party', 'yellow');
      line('  sleep       → put the orb to sleep', 'yellow');
      line('  wake        → wake it up', 'yellow');
      line('  panic       → absolutely no reason to panic', 'yellow');
      line('  hide / show → orb hide-and-seek', 'yellow');
      line('  bigeyes     → maximum curiosity', 'yellow');
      line('  spin        → physics temporarily disabled', 'yellow');
      line('  coffee      → important system dependency', 'yellow');
      line('  secret      → ???', 'yellow');
      line('  clear       → clear terminal', 'yellow');
      line('  home        → back to the top', 'yellow');
    },
    about: async () => {
      line('Emma Langberg', 'accent');
      line('bridge between people, digital solutions and tech.');
      line('likes making complicated things understandable.');
      spacer();
      line("tip: type 'experience' or 'skills' to move around the page.", 'dim');
    },
    experience: async () => {
      line('opening experience...', 'dim');
      await sleepMs(260);
      scrollToSection('experience');
    },
    skills: async () => {
      line('loading competencies...', 'dim');
      await sleepMs(260);
      scrollToSection('skills');
    },
    contact: async () => {
      line('opening secure-ish communication channel...', 'dim');
      await sleepMs(230);
      line('email: emma@theblackone.dk', 'accent');
      line('status: accepting nice messages', 'dim');
      await sleepMs(650);
      scrollToSection('contact');
    },
    home: async () => {
      line('returning home...', 'dim');
      await sleepMs(220);
      scrollToSection('home');
    },
    whoami: async () => {
      line('emma@theblackone', 'accent');
      line('role: service / tech / digital');
      line('mode: curious by default');
      line('special ability: translating “it does not work” into next steps');
      line('current side quest: making this website unnecessarily delightful', 'dim');
    },
    coffee: async () => {
      line('checking caffeine subsystem...', 'dim');
      await sleepMs(350);
      line('████████████████████ 100%', 'yellow');
      line('coffee status: probably a good idea.', 'accent');
      blinkOrbs();
    },
    orb: orbSequence,
    blink: async () => { blinkOrbs(); line('* blink *', 'accent'); },
    dance: async () => {
      temporaryBodyEffect('orb-party', 3800);
      line('♪ initiating highly questionable dance moves...', 'accent');
    },
    sleep: async () => {
      clearOrbEffects();
      document.body.classList.add('orb-sleep');
      line('orb has entered low-power mode. zzz...', 'dim');
    },
    wake: async () => {
      clearOrbEffects();
      blinkOrbs();
      line('good morning, tiny void creature.', 'accent');
    },
    panic: async () => {
      temporaryBodyEffect('orb-panic', 1800);
      line('PANIC MODE ENABLED', 'error');
      await sleepMs(450);
      line('reason: none.', 'dim');
      await sleepMs(450);
      line('excellent.', 'accent');
    },
    hide: async () => {
      clearOrbEffects();
      document.body.classList.add('orb-hide');
      line('orb.exe has left the chat.', 'dim');
    },
    show: async () => {
      document.body.classList.remove('orb-hide');
      blinkOrbs();
      line('found it.', 'accent');
    },
    bigeyes: async () => {
      temporaryBodyEffect('orb-big-eyes', 3000);
      line('curiosity increased by 147%.', 'accent');
    },
    spin: async () => {
      spinOrbs();
      line('gravity is a suggestion.', 'dim');
    },
    secret: async () => {
      terminalWindow.classList.add('is-glitching');
      line('ACCESSING TOTALLY CLASSIFIED FILE...', 'error');
      await sleepMs(500);
      line('file found: definitely-not-a-secret.txt', 'yellow');
      await sleepMs(450);
      line('content: the orb is called Bob now.', 'accent');
      await sleepMs(350);
      line('please act normal.', 'dim');
      temporaryBodyEffect('orb-big-eyes', 2200);
      setTimeout(() => terminalWindow.classList.remove('is-glitching'), 800);
    },
    clear: async () => { terminalOutput.innerHTML = ''; }
  };

  async function runCommand(raw) {
    const value = raw.trim();
    if (!value) return;
    line(value, 'command');
    const [name, ...args] = value.toLowerCase().split(/\s+/);

    // Bonus syntax: "orb dance", "orb sleep", etc.
    if (name === 'orb' && args[0] && commands[args[0]]) {
      await commands[args[0]]();
      return;
    }

    if (!commands[name]) {
      line(`command not found: ${name}`, 'error');
      line("try 'help' — the computer is trying its best.", 'dim');
      return;
    }
    await commands[name](args);
  }

  terminalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = terminalInput.value;
    terminalInput.value = '';
    if (!value.trim()) return;
    commandHistory.push(value);
    commandHistory = commandHistory.slice(-40);
    historyIndex = commandHistory.length;
    terminalInput.disabled = true;
    await runCommand(value);
    terminalInput.disabled = false;
    terminalInput.focus();
  });

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!commandHistory.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = commandHistory[historyIndex] || '';
      requestAnimationFrame(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length));
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!commandHistory.length) return;
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      terminalInput.value = commandHistory[historyIndex] || '';
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const typed = terminalInput.value.trim().toLowerCase();
      if (!typed) return;
      const matches = commandNames.filter(cmd => cmd.startsWith(typed));
      if (matches.length === 1) terminalInput.value = matches[0];
      if (matches.length > 1) line(matches.join('   '), 'dim');
    }
  });

  // Click anywhere in the terminal body to put focus back in the prompt.
  terminalBody.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('a, button')) terminalInput.focus({ preventScroll: true });
  });

  // Desktop dragging. Mobile keeps the terminal full-screen and fixed.
  function resetTerminalPosition() {
    terminalWindow.style.transform = '';
    terminalWindow.style.left = '';
    terminalWindow.style.top = '';
  }

  terminalDragHandle?.addEventListener('pointerdown', (e) => {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    if (e.target.closest('button')) return;
    const rect = terminalWindow.getBoundingClientRect();
    dragState = {
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
    terminalDragHandle.setPointerCapture(e.pointerId);
    terminalWindow.style.position = 'fixed';
    terminalWindow.style.margin = '0';
    terminalWindow.style.transform = 'none';
    terminalWindow.style.left = `${rect.left}px`;
    terminalWindow.style.top = `${rect.top}px`;
  });

  terminalDragHandle?.addEventListener('pointermove', (e) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    const maxX = Math.max(8, innerWidth - terminalWindow.offsetWidth - 8);
    const maxY = Math.max(8, innerHeight - terminalWindow.offsetHeight - 8);
    const x = Math.min(maxX, Math.max(8, e.clientX - dragState.offsetX));
    const y = Math.min(maxY, Math.max(8, e.clientY - dragState.offsetY));
    terminalWindow.style.left = `${x}px`;
    terminalWindow.style.top = `${y}px`;
  });

  function endDrag(e) {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    try { terminalDragHandle.releasePointerCapture(e.pointerId); } catch (_) {}
    dragState = null;
  }
  terminalDragHandle?.addEventListener('pointerup', endDrag);
  terminalDragHandle?.addEventListener('pointercancel', endDrag);
}
