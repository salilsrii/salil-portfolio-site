const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('open', open);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('open');
  });
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();

// Keep page scrolling natural; animate the content as each section enters view.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

  document.querySelectorAll(
    '.section-head, .project, .experience-head, .experience-main, .experience-foot, .about-block, .skills-strip, .wheel-controls, .contact-top, .contact h2, .contact-copy, .contact-email, .contact-links'
  ).forEach((item) => {
    item.classList.add('motion-in');
    revealObserver.observe(item);
  });
}

const wheel = document.querySelector('[data-wheel-stage]');
if (wheel) {
  const cards = [...wheel.querySelectorAll('.wheel-card')];
  const spokes = wheel.querySelector('.wheel-spoke-group');
  const pauseButton = document.querySelector('[data-wheel-toggle]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let angle = -Math.PI / 2;
  let targetAngle = angle;
  let radius = 215;
  let radiusY = 215;
  let lastTime = 0;
  let dragging = false;
  let dragged = false;
  let pointerX = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let focused = false;

  const layoutWheel = () => {
    const bounds = wheel.getBoundingClientRect();
    radius = Math.min(232, bounds.width * (bounds.width < 620 ? 0.39 : 0.27));
    radiusY = bounds.width < 620 ? Math.min(bounds.height * 0.38, 185) : Math.min(232, bounds.height * 0.36);
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    cards.forEach((card, index) => {
      const theta = angle + index * (Math.PI * 2 / cards.length);
      const x = centerX + Math.cos(theta) * radius;
      const y = centerY + Math.sin(theta) * radiusY;
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.style.zIndex = String(Math.round((Math.sin(theta) + 1) * 10));
      card.classList.toggle('is-front', Math.sin(theta) > 0.72);
      card.setAttribute('aria-label', `${card.querySelector('h3').textContent}. Open certificate`);
    });
    spokes.style.transform = `rotate(${angle + Math.PI / 2}rad)`;
  };

  const setPaused = (value) => {
    paused = value;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? 'RESUME ROTATION' : 'PAUSE ROTATION';
  };
  const step = (direction) => {
    targetAngle += direction * (Math.PI * 2 / cards.length);
    setPaused(true);
  };
  document.querySelector('[data-wheel-prev]').addEventListener('click', () => step(-1));
  document.querySelector('[data-wheel-next]').addEventListener('click', () => step(1));
  pauseButton.addEventListener('click', () => setPaused(!paused));

  wheel.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    dragged = false;
    pointerX = event.clientX;
    setPaused(true);
  });
  wheel.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const deltaX = event.clientX - pointerX;
    if (Math.abs(deltaX) > 3 && !dragged) {
      dragged = true;
      wheel.setPointerCapture(event.pointerId);
    }
    angle += deltaX / Math.max(radius, 1);
    targetAngle = angle;
    pointerX = event.clientX;
    layoutWheel();
  });
  const releaseDrag = () => { dragging = false; };
  wheel.addEventListener('pointerup', releaseDrag);
  wheel.addEventListener('pointercancel', releaseDrag);
  wheel.addEventListener('click', (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);
  wheel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
  });
  wheel.addEventListener('pointerenter', () => { hovered = true; });
  wheel.addEventListener('pointerleave', () => { hovered = false; });
  wheel.addEventListener('focusin', () => { focused = true; });
  wheel.addEventListener('focusout', () => { focused = wheel.contains(document.activeElement); });
  document.addEventListener('visibilitychange', () => { lastTime = 0; });
  reducedMotion.addEventListener?.('change', (event) => setPaused(event.matches));

  const animateWheel = (time) => {
    if (!lastTime) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (!dragging) {
      if (!paused && !hovered && !focused && !document.hidden) targetAngle += dt * 0.19;
      angle += (targetAngle - angle) * Math.min(1, dt * 5.5);
      layoutWheel();
    }
    requestAnimationFrame(animateWheel);
  };
  layoutWheel();
  requestAnimationFrame(animateWheel);
}
