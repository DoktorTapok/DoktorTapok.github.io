'use strict';

// Progressive enhancement: content and image links remain usable without JS.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const galleries = [...document.querySelectorAll('.gallery')];
const dialog = document.querySelector('.lightbox');
const lightboxImage = dialog?.querySelector('.lightbox-image');
let activeLinks = [];
let activeIndex = 0;
let opener;

function updateLanguageLinks(hash = location.hash) {
  document.querySelectorAll('.language-link').forEach(link => {
    const destination = new URL(link.href);
    destination.hash = hash;
    link.href = destination.href;
  });
}
updateLanguageLinks();
addEventListener('hashchange', () => updateLanguageLinks());

function showImage(index) {
  activeIndex = (index + activeLinks.length) % activeLinks.length;
  const link = activeLinks[activeIndex];
  lightboxImage.src = link.href;
  lightboxImage.alt = link.querySelector('img').alt;
  dialog.querySelector('.lightbox-caption').textContent = link.dataset.caption;
  dialog.querySelector('.lightbox-counter').textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(activeLinks.length).padStart(2, '0')}`;
}

galleries.forEach(gallery => {
  const track = gallery.querySelector('.gallery-track');
  const slides = [...track.querySelectorAll('.gallery-slide')];
  const previous = gallery.querySelector('.gallery-prev');
  const next = gallery.querySelector('.gallery-next');
  const counter = gallery.querySelector('.gallery-count');
  let current = 0;
  let pending = false;
  const positions = () => slides.map(slide => slide.offsetLeft - slides[0].offsetLeft);
  function update() {
    const offsets = positions();
    const distance = track.scrollLeft;
    const end = track.scrollWidth - track.clientWidth;
    current = offsets.reduce((best, value, index) => Math.abs(value - distance) < Math.abs(offsets[best] - distance) ? index : best, 0);
    if (end > 0 && distance >= end - 3) current = slides.length - 1;
    previous.disabled = distance <= 3;
    next.disabled = distance >= end - 3;
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    pending = false;
  }
  function move(direction) {
    const end = track.scrollWidth - track.clientWidth;
    const stops = [...new Set([0, ...positions().map(value => Math.min(value, end)), end])].sort((a, b) => a - b);
    const destination = direction > 0
      ? stops.find(value => value > track.scrollLeft + 3) ?? end
      : stops.findLast(value => value < track.scrollLeft - 3) ?? 0;
    track.scrollTo({left: destination, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  track.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }, {passive: true});
  addEventListener('resize', update);
  gallery.querySelector('.gallery-controls').hidden = false;
  update();
  if (dialog && typeof dialog.showModal === 'function') {
    const links = [...gallery.querySelectorAll('.screenshot-link')];
    links.forEach((link, index) => link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      activeLinks = links;
      opener = link;
      showImage(index);
      dialog.showModal();
      document.documentElement.classList.add('lightbox-open');
    }));
  }
});

if (dialog) {
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => showImage(activeIndex - 1));
  dialog.querySelector('.lightbox-next').addEventListener('click', () => showImage(activeIndex + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    lightboxImage.removeAttribute('src');
    opener?.focus({preventScroll: true});
  });
}

if ('IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!reducedMotion.matches) entry.target.classList.add('arriving');
        reveals.unobserve(entry.target);
      }
    });
  }, {threshold: 0.08});
  document.querySelectorAll('.gallery, .studio-visual').forEach(el => reveals.observe(el));

  const sections = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio).slice(0, 1).forEach(entry => updateLanguageLinks(`#${entry.target.id}`));
  }, {rootMargin: '-15% 0px -45% 0px', threshold: 0});
  document.querySelectorAll('.game, #studio, #contact').forEach(el => sections.observe(el));
}
