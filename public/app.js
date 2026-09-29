(() => {
  const data = window.UNMTA_DATA;
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const wa = `https://wa.me/${data.whatsappNumber}`;
  const waJoin = `${wa}?text=${encodeURIComponent('Hello UNMTA, I would like to learn more about membership.')}`;
  const external = 'target="_blank" rel="noopener noreferrer"';

  $('#activity-grid').innerHTML = data.activities.map((activity) => `
    <article class="activity-card"><a class="activity-image" href="#membership" aria-label="Learn about UNMTA ${escapeHTML(activity.title)} activities"><img src="${escapeHTML(activity.image)}" alt="${escapeHTML(activity.alt)}" loading="lazy"><span class="activity-icon" aria-hidden="true">${activity.icon}</span></a><div class="activity-body"><span class="card-number">${activity.number} / ACTIVITY</span><h3>${escapeHTML(activity.title)}</h3><p>${escapeHTML(activity.text)}</p><a class="card-link" href="#membership" aria-label="Explore membership for ${escapeHTML(activity.title)}">Explore <span aria-hidden="true">↗</span></a></div></article>`).join('');

  $('#collab-list').innerHTML = data.collaborations.map((name, index) => `<div class="collab-name"><span>0${index + 1}</span>${escapeHTML(name)}</div>`).join('');
  $('#leaders-grid').innerHTML = data.leadership.map((leader, index) => `<article class="leader-card"><div class="leader-top"><span class="leader-number">${String(index + 1).padStart(2, '0')}</span><span class="leader-symbol" aria-hidden="true">✳</span></div><h3>${escapeHTML(leader.role)}</h3><p>${escapeHTML(leader.duty)}</p></article>`).join('');
  $('#program-grid').innerHTML = data.programs.map((program, index) => `<article class="program-item"><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHTML(program.title)}</h3><p>${escapeHTML(program.text)}</p></div></article>`).join('');
  $('#benefit-list').innerHTML = data.benefits.map((benefit) => `<li>${escapeHTML(benefit)}</li>`).join('');
  $('#gallery').innerHTML = data.gallery.map((photo, index) => `<button class="gallery-item ${photo.className}" type="button" data-photo="${index}" aria-label="View image: ${escapeHTML(photo.title)}"><img src="${escapeHTML(photo.src)}" alt="${escapeHTML(photo.alt)}" loading="lazy"><span>${escapeHTML(photo.title)} <b aria-hidden="true">↗</b></span></button>`).join('');
  document.querySelectorAll('#activity-grid img, #gallery img').forEach((image) => image.addEventListener('error', () => {
    if (image.dataset.fallback) return;
    image.dataset.fallback = 'true';
    image.src = '/images/alumni-talk.jpg';
    image.alt = 'UNMTA alumni talk';
    const galleryItem = image.closest('.gallery-item');
    if (galleryItem) {
      const photo = data.gallery[Number(galleryItem.dataset.photo)];
      photo.src = '/images/alumni-talk.jpg'; photo.alt = image.alt;
    }
  }));

  const socialIcon = (kind) => kind === 'instagram'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r=".8" class="fill-dot"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3.4 15V9.4H5.8V18h2.6ZM7.1 8.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18.3 18v-4.7c0-2.5-1.3-3.7-3.1-3.7a2.7 2.7 0 0 0-2.4 1.3V9.4h-2.6V18h2.6v-4.3c0-1.1.2-2.2 1.6-2.2s1.4 1.3 1.4 2.3V18h2.5Z"/></svg>';
  const socialLinks = `<a href="${data.socials.linkedin}" ${external} aria-label="UNMTA on LinkedIn">${socialIcon('linkedin')}<span>LinkedIn</span></a><a href="${data.socials.instagram}" ${external} aria-label="UNMTA on Instagram">${socialIcon('instagram')}<span>Instagram</span></a>`;
  const whatsappIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z"/><path d="M9 8.3c.2-.4.4-.4.7-.4h.4c.1 0 .3 0 .4.3l.7 1.6c.1.2.1.4 0 .5l-.5.6c-.2.2-.2.3 0 .5.4.7 1 1.2 1.7 1.6.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.5.7c.2.1.3.2.3.4 0 .3-.2 1.1-.7 1.5-.5.5-1.2.7-2 .5-.9-.2-2-.6-3.3-1.7-1.1-1-1.9-2.1-2.1-2.9-.3-.8.1-1.6.4-2.2Z"/></svg>';
  $('#contact-links').innerHTML = `<a class="contact-link whatsapp-link" href="${wa}" ${external}><span class="contact-icon">${whatsappIcon}</span><span><small>MESSAGE THE ASSOCIATION</small><strong>Chat with UNMTA on WhatsApp</strong></span><b aria-hidden="true">↗</b></a><a class="contact-link" href="${data.whatsappCommunity}" ${external}><span class="contact-icon" aria-hidden="true">↗</span><span><small>COMMUNITY UPDATES</small><strong>Join the UNMTA WhatsApp community</strong></span><b aria-hidden="true">↗</b></a>${socialLinks}`;
  $('#footer-social').innerHTML = `${socialLinks}<a href="${wa}" ${external} aria-label="Chat with UNMTA on WhatsApp">${whatsappIcon}<span>WhatsApp</span></a><a href="${data.whatsappCommunity}" ${external} aria-label="Join the UNMTA WhatsApp community"><span aria-hidden="true">↗</span><span>Community</span></a>`;
  $('#join-whatsapp').href = waJoin;
  $('#year').textContent = new Date().getFullYear();

  function updateEventCountdowns() {
    document.querySelectorAll('.event-countdown[data-date]').forEach((element) => {
      const remaining = new Date(element.dataset.date).getTime() - Date.now();
      if (remaining <= 0) {
        element.textContent = 'Event time has passed';
        return;
      }
      const seconds = Math.floor(remaining / 1000);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      element.textContent = `${days}d ${hours}h ${minutes}m ${secs}s`;
    });
  }
  updateEventCountdowns();
  window.setInterval(updateEventCountdowns, 1000);

  const heroImage = $('#hero-image');
  const caption = $('#hero-caption');
  const indexLabel = $('#photo-index');
  const dots = $('#slide-dots');
  let activeSlide = 0;
  let timer;
  dots.innerHTML = data.heroImages.map((_, index) => `<button type="button" aria-label="Show featured image ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}"></button>`).join('');
  const dotButtons = [...dots.querySelectorAll('button')];
  function showSlide(index) {
    activeSlide = (index + data.heroImages.length) % data.heroImages.length;
    const slide = data.heroImages[activeSlide];
    heroImage.classList.add('is-changing');
    const next = new Image();
    next.onload = () => { heroImage.src = slide.src; heroImage.alt = slide.alt; heroImage.classList.remove('is-changing'); };
    next.onerror = () => { heroImage.src = '/images/alumni-talk.jpg'; heroImage.alt = 'UNMTA alumni talk'; heroImage.classList.remove('is-changing'); };
    next.src = slide.src;
    caption.textContent = slide.caption;
    indexLabel.textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(data.heroImages.length).padStart(2, '0')}`;
    dotButtons.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === activeSlide)));
  }
  function restartCarousel() {
    window.clearInterval(timer);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = window.setInterval(() => showSlide(activeSlide + 1), 3000);
  }
  $('#slide-prev').addEventListener('click', () => { showSlide(activeSlide - 1); restartCarousel(); });
  $('#slide-next').addEventListener('click', () => { showSlide(activeSlide + 1); restartCarousel(); });
  dotButtons.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); restartCarousel(); }));
  showSlide(0); restartCarousel();

  const menuButton = $('.menu-toggle');
  const nav = $('#primary-nav');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); nav.classList.remove('is-open'); }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); nav.classList.remove('is-open'); }
  });

  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  const lightboxCaption = $('#lightbox-caption');
  const closeLightbox = $('.lightbox-close');
  $('#gallery').addEventListener('click', (event) => {
    const button = event.target.closest('.gallery-item');
    if (!button) return;
    const photo = data.gallery[Number(button.dataset.photo)];
    lightboxImage.src = photo.src; lightboxImage.alt = photo.alt; lightboxCaption.textContent = photo.title;
    lightbox.showModal(); closeLightbox.focus();
  });
  closeLightbox.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
})();
