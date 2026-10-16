/* ============================================================
   Garden Route Flora — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initBackToTop();
  initLightbox();
  initAccordion();
  initFilterTabs();
});


/* ---------- Sticky Navbar ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}


/* ---------- Mobile Hamburger Menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !toggle.contains(e.target) && navLinks.classList.contains('active')) {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}


/* ---------- Scroll Reveal Animation ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}


/* ---------- Back to Top Button ---------- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ---------- Gallery Lightbox ---------- */
function initLightbox() {
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.querySelector('.lightbox');
  if (galleryItems.length === 0 || !lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox__img');
  const caption = lightbox.querySelector('.lightbox__caption');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
  const nextBtn = lightbox.querySelector('.lightbox__nav--next');
  if (!lightboxImg || !closeBtn) return;

  let currentIndex = 0;
  let visibleItems = [];
  let returnFocus = null;
  let previousOverflow = '';
  let backgroundElements = [];

  galleryItems.forEach(item => {
    if (!item.querySelector('img')) return;
    item.addEventListener('click', () => openLightbox(item));
  });

  function showImage() {
    const item = visibleItems[currentIndex];
    const img = item.querySelector('img');
    lightboxImg.src = img.dataset.full || img.src;
    lightboxImg.alt = img.alt;
    if (caption) {
      caption.textContent = `${currentIndex + 1} of ${visibleItems.length} — ${item.dataset.caption || img.alt}`;
    }
    if (prevBtn) prevBtn.disabled = visibleItems.length < 2;
    if (nextBtn) nextBtn.disabled = visibleItems.length < 2;
  }

  function openLightbox(item) {
    visibleItems = galleryItems.filter(entry => !entry.hidden && entry.querySelector('img'));
    currentIndex = visibleItems.indexOf(item);
    if (currentIndex < 0) return;
    returnFocus = item;
    previousOverflow = document.body.style.overflow;
    showImage();
    lightbox.hidden = false;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    backgroundElements = Array.from(document.body.children)
      .filter(element => element !== lightbox && element.tagName !== 'SCRIPT')
      .map(element => ({ element, wasInert: element.inert }));
    backgroundElements.forEach(({ element }) => { element.inert = true; });
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.hidden = true;
    document.body.style.overflow = previousOverflow;
    backgroundElements.forEach(({ element, wasInert }) => { element.inert = wasInert; });
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }

  function moveImage(direction) {
    currentIndex = (currentIndex + direction + visibleItems.length) % visibleItems.length;
    showImage();
  }

  closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => moveImage(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => moveImage(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      moveImage(e.key === 'ArrowLeft' ? -1 : 1);
    } else if (e.key === 'Tab') {
      const controls = Array.from(lightbox.querySelectorAll('button:not(:disabled)'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && (document.activeElement === first || !lightbox.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !lightbox.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}


/* ---------- Accordion ---------- */
function initAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  if (items.length === 0) return;

  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      items.forEach(i => {
        i.classList.remove('active');
        const b = i.querySelector('.accordion-body');
        if (b) b.style.maxHeight = null;
      });

      // Open clicked (if it was closed)
      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}


/* ---------- Collection and Gallery Filters ---------- */
function initFilterTabs() {
  document.querySelectorAll('.filter-tabs').forEach(group => {
    const tabs = Array.from(group.querySelectorAll('[data-filter]'));
    const section = group.closest('section');
    if (!section || tabs.length === 0) return;
    const cards = Array.from(section.querySelectorAll('.gallery-item[data-category], .species-card[data-category]'));
    const status = section.querySelector('.gallery-status');
    if (cards.length === 0) return;

    function applyFilter(tab) {
      tabs.forEach(button => {
        const isSelected = button === tab;
        button.classList.toggle('active', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
      });
      cards.forEach(card => {
        const categories = card.dataset.category.split(/\s+/);
        card.hidden = tab.dataset.filter !== 'all' && !categories.includes(tab.dataset.filter);
      });
      if (status) {
        const count = cards.filter(card => !card.hidden).length;
        status.textContent = `${count} ${count === 1 ? 'photo' : 'photos'} · ${tab.textContent.trim()}`;
      }
    }

    tabs.forEach(tab => tab.addEventListener('click', () => applyFilter(tab)));
    applyFilter(tabs.find(tab => tab.classList.contains('active')) || tabs[0]);
  });
}


/* ---------- Smooth scroll for anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const hash = this.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.getElementById(hash.slice(1));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
