const body = document.body;
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = themeToggle?.querySelector('i');
const menuToggle = document.querySelector('#menu-toggle');
const navbar = document.querySelector('#navbar');
let projects = [];

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') body.classList.add('light-theme');
const updateThemeIcon = () => { if (themeIcon) themeIcon.className = body.classList.contains('light-theme') ? 'bx bx-moon' : 'bx bx-sun'; };
updateThemeIcon();
themeToggle?.addEventListener('click', () => { body.classList.toggle('light-theme'); localStorage.setItem('portfolio-theme', body.classList.contains('light-theme') ? 'light' : 'dark'); updateThemeIcon(); });
menuToggle?.addEventListener('click', () => { const isOpen = navbar.classList.toggle('active'); menuToggle.setAttribute('aria-expanded', String(isOpen)); menuToggle.querySelector('i').className = isOpen ? 'bx bx-x' : 'bx bx-menu'; });
document.querySelectorAll('.navbar a').forEach((link) => link.addEventListener('click', () => { navbar.classList.remove('active'); menuToggle?.setAttribute('aria-expanded', 'false'); if (menuToggle) menuToggle.querySelector('i').className = 'bx bx-menu'; }));

const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
const techTags = (items = []) => items.map((item) => `<span>${esc(item)}</span>`).join('');
const projectLinks = (project, extraClass = '') => `<div class="project-links ${extraClass}">${project.liveUrl ? `<a class="project-link project-link-live" href="${esc(project.liveUrl)}" target="_blank" rel="noopener noreferrer"><i class="bx bx-link-external"></i> Ver projeto</a>` : ''}${project.githubUrl ? `<a class="project-link project-link-github" href="${esc(project.githubUrl)}" target="_blank" rel="noopener noreferrer"><i class="bx bxl-github"></i> GitHub</a>` : ''}</div>`;
const getProjectImages = (project) => {
  const images = (Array.isArray(project.images) ? project.images : [])
    .map((image) => typeof image === 'string' ? { src: image, alt: `Imagem do projeto ${project.title}` } : image)
    .filter((image) => image?.src);
  if (images.length === 0 && project.cover) images.push({ src: project.cover, alt: `Capa do projeto ${project.title}` });
  return images;
};
const imageMarkup = (project) => { const image = getProjectImages(project)[0]; return `<div class="project-image"><img src="${esc(image?.src || '')}" alt="${esc(image?.alt || `Capa do projeto ${project.title}`)}" loading="eager" /><span class="project-index">${String(projects.indexOf(project) + 1).padStart(2, '0')}</span><button class="view-project" type="button">Ver detalhes <i class="bx bx-right-arrow-alt"></i></button></div>`; };
const projectMarkup = (project, index) => `<article class="project-small project-card reveal reveal-delay-${Math.min(index, 3)}" data-project-id="${esc(project.id)}"><div class="project-media">${imageMarkup(project)}</div><div class="small-content"><p class="project-type">${esc(project.category)}</p><h3>${esc(project.title)} <span>↗</span></h3><p>${esc(project.subtitle)}</p><div class="small-footer"><div class="tech-list">${techTags((project.technologies || []).slice(0, 2))}</div><a class="project-detail-link" href="projeto.html?id=${encodeURIComponent(project.id)}" aria-label="Abrir case ${esc(project.title)}"><i class="bx bx-right-arrow-alt"></i></a></div>${projectLinks(project, 'project-links-small')}</div></article>`;
function renderProjects() {
  const list = document.querySelector('#project-list');
  if (!list) return;
  if (!projects.length) { list.innerHTML = '<p class="project-loading">Nenhum projeto cadastrado ainda.</p>'; return; }
  const [feature, ...rest] = projects;
  list.innerHTML = `<article class="project-feature project-card reveal" data-project-id="${esc(feature.id)}"><div class="project-media">${imageMarkup(feature)}</div><div class="project-info"><div><p class="project-type">${esc(feature.category)}</p><h3>${esc(feature.title)}</h3></div><p class="project-summary">${esc(feature.subtitle)}</p><div class="project-footer"><div class="tech-list">${techTags((feature.technologies || []).slice(0, 3))}</div><div class="project-actions"><a class="project-detail-link" href="projeto.html?id=${encodeURIComponent(feature.id)}">Abrir case <i class="bx bx-right-arrow-alt"></i></a>${projectLinks(feature)} </div></div></div></article><div class="project-stack">${rest.map((project, index) => projectMarkup(project, index + 1)).join('')}</div>`;
  observeReveals();
  document.querySelectorAll('.view-project').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); openProject(button.closest('.project-card')); }));
}

const modalOverlay = document.querySelector('#project-modal');
const modalImage = document.querySelector('#modal-image');
const modalGallery = document.querySelector('#modal-gallery');
const modalPrev = document.querySelector('#modal-carousel-prev');
const modalNext = document.querySelector('#modal-carousel-next');
const modalTitle = document.querySelector('#modal-title');
const modalDescription = document.querySelector('#modal-description');
const modalTech = document.querySelector('#modal-tech');
const modalLive = document.querySelector('#modal-live');
const modalRepo = document.querySelector('#modal-repo');
const modalClose = document.querySelector('#modal-close');
let lastFocusedElement;
let modalImages = [];
let modalIndex = 0;
let modalTimer;
let modalPaused = false;
function showModalImage(index) {
  if (!modalImages.length) return;
  modalIndex = (index + modalImages.length) % modalImages.length;
  const image = modalImages[modalIndex];
  modalImage.src = image.src;
  modalImage.alt = image.alt || `Imagem ${modalIndex + 1}`;
  modalGallery?.querySelectorAll('.modal-thumb').forEach((thumb, position) => { thumb.classList.toggle('active', position === modalIndex); thumb.setAttribute('aria-current', position === modalIndex ? 'true' : 'false'); });
  const counter = modalGallery?.querySelector('.modal-carousel-count');
  const progress = modalGallery?.querySelector('.modal-carousel-progress span');
  if (counter) counter.textContent = `${String(modalIndex + 1).padStart(2, '0')} / ${String(modalImages.length).padStart(2, '0')}`;
  if (progress) progress.style.width = `${((modalIndex + 1) / modalImages.length) * 100}%`;
}
function renderModalCarousel() {
  if (!modalGallery) return;
  window.clearInterval(modalTimer);
  const hasMultiple = modalImages.length > 1;
  modalGallery.style.display = hasMultiple ? 'block' : 'none';
  modalPrev.style.display = hasMultiple ? 'grid' : 'none';
  modalNext.style.display = hasMultiple ? 'grid' : 'none';
  if (!hasMultiple) return;
  modalGallery.innerHTML = `<div class="modal-carousel-toolbar"><span class="modal-carousel-count">01 / ${String(modalImages.length).padStart(2, '0')}</span><div class="modal-carousel-progress" aria-hidden="true"><span></span></div><span class="modal-carousel-hint">← →</span></div><div class="modal-carousel-thumbs" aria-label="Selecionar imagem">${modalImages.map((image, index) => `<button class="modal-thumb${index === 0 ? ' active' : ''}" type="button" aria-label="Ver imagem ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}"><img src="${esc(image.src)}" alt="" loading="eager" /></button>`).join('')}</div>`;
  modalGallery.querySelectorAll('.modal-thumb').forEach((thumb, index) => thumb.addEventListener('click', () => showModalImage(index)));
  modalGallery.addEventListener('mouseenter', () => { modalPaused = true; });
  modalGallery.addEventListener('mouseleave', () => { modalPaused = false; });
  showModalImage(0);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) modalTimer = window.setInterval(() => { if (!modalPaused && !document.hidden && modalOverlay?.classList.contains('active')) showModalImage(modalIndex + 1); }, 5000);
}
function openProject(card) {
  const project = projects.find((item) => item.id === card?.dataset.projectId);
  if (!project || !modalOverlay) return;
  modalImages = getProjectImages(project);
  lastFocusedElement = document.activeElement;
  modalTitle.textContent = project.title; modalDescription.textContent = project.description; modalTech.innerHTML = techTags(project.technologies || []); modalRepo.href = project.githubUrl || '#'; modalRepo.style.display = project.githubUrl ? 'inline-flex' : 'none'; modalLive.href = project.liveUrl || '#'; modalLive.style.display = project.liveUrl ? 'inline-flex' : 'none';
  renderModalCarousel();
  modalOverlay.classList.add('active'); modalOverlay.setAttribute('aria-hidden', 'false'); body.style.overflow = 'hidden'; modalClose.focus();
}
function closeProject() { window.clearInterval(modalTimer); modalOverlay?.classList.remove('active'); modalOverlay?.setAttribute('aria-hidden', 'true'); body.style.overflow = ''; lastFocusedElement?.focus(); }
modalPrev?.addEventListener('click', () => showModalImage(modalIndex - 1));
modalNext?.addEventListener('click', () => showModalImage(modalIndex + 1));
modalClose?.addEventListener('click', closeProject); modalOverlay?.addEventListener('click', (event) => { if (event.target === modalOverlay) closeProject(); }); document.addEventListener('keydown', (event) => { if (!modalOverlay?.classList.contains('active')) return; if (event.key === 'Escape') closeProject(); if (event.key === 'ArrowLeft') showModalImage(modalIndex - 1); if (event.key === 'ArrowRight') showModalImage(modalIndex + 1); });

function observeReveals() { const observer = new IntersectionObserver((entries, instance) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); instance.unobserve(entry.target); } }), { threshold: 0.12 }); document.querySelectorAll('.reveal').forEach((element) => { if (!element.classList.contains('visible')) observer.observe(element); }); }

window.loadProjects().then((loadedProjects) => { projects = loadedProjects; renderProjects(); observeReveals(); }).catch((error) => { console.error(error); const list = document.querySelector('#project-list'); if (list) list.innerHTML = '<p class="project-loading">Não foi possível carregar os projetos agora.</p>'; });

const tilt = document.querySelector('[data-tilt]');
if (tilt && window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) { tilt.addEventListener('pointermove', (event) => { const rect = tilt.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - 0.5; const y = (event.clientY - rect.top) / rect.height - 0.5; tilt.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${y * -7}deg)`; }); tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; }); }

const parallaxHero = document.querySelector('[data-parallax]');
const parallaxFrame = parallaxHero?.querySelector('.visual-frame');
if (parallaxHero && parallaxFrame && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
  let parallaxFrameRequest = 0;
  const updateHeroParallax = () => {
    cancelAnimationFrame(parallaxFrameRequest);
    parallaxFrameRequest = requestAnimationFrame(() => {
      const rect = parallaxHero.getBoundingClientRect();
      const distance = window.innerHeight / 2 - (rect.top + rect.height / 2);
      const offset = Math.max(-36, Math.min(36, distance * .12));
      parallaxFrame.style.setProperty('--hero-parallax-y', `${offset.toFixed(1)}px`);
    });
  };
  window.addEventListener('scroll', updateHeroParallax, { passive: true });
  window.addEventListener('resize', updateHeroParallax);
  updateHeroParallax();
}

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (finePointer.matches && !reducedMotion.matches) {
  const cursorFollower = document.createElement('div');
  cursorFollower.className = 'cursor-follower';
  cursorFollower.setAttribute('aria-hidden', 'true');
  document.body.append(cursorFollower);

  document.addEventListener('pointermove', (event) => {
    cursorFollower.style.setProperty('--cursor-x', `${event.clientX}px`);
    cursorFollower.style.setProperty('--cursor-y', `${event.clientY}px`);
    cursorFollower.classList.add('is-visible');
  }, { passive: true });

  const interactiveSelector = 'a, button, [role="button"], input, textarea, select, summary, label';
  document.addEventListener('pointerover', (event) => {
    if (event.target instanceof Element && event.target.closest(interactiveSelector)) {
      cursorFollower.classList.add('is-hovering');
    }
  });
  document.addEventListener('pointerout', (event) => {
    if (event.relatedTarget instanceof Element && event.relatedTarget.closest(interactiveSelector)) return;
    cursorFollower.classList.remove('is-hovering');
  });
  document.addEventListener('pointerdown', () => cursorFollower.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => cursorFollower.classList.remove('is-pressed'));
}
