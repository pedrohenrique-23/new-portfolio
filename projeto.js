const projectId = new URLSearchParams(window.location.search).get('id');
const page = document.querySelector('#case-page');
const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
const getProjectImages = (project) => {
  const images = (Array.isArray(project.images) ? project.images : [])
    .map((image) => typeof image === 'string' ? { src: image, alt: `Imagem do projeto ${project.title}` } : image)
    .filter((image) => image?.src);
  if (images.length === 0 && project.cover) images.push({ src: project.cover, alt: `Capa do projeto ${project.title}` });
  return images;
};

function setupCaseCarousel() {
  const carousel = document.querySelector('[data-case-carousel]');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.case-slide')];
  const thumbs = [...carousel.querySelectorAll('.case-thumb')];
  const counter = carousel.querySelector('.case-carousel-count');
  const progress = carousel.querySelector('.case-carousel-progress span');
  let current = 0;
  let paused = false;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => slide.classList.toggle('active', position === current));
    thumbs.forEach((thumb, position) => { thumb.classList.toggle('active', position === current); thumb.setAttribute('aria-current', position === current ? 'true' : 'false'); });
    if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (progress) progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  };
  carousel.querySelector('.case-carousel-prev')?.addEventListener('click', () => show(current - 1));
  carousel.querySelector('.case-carousel-next')?.addEventListener('click', () => show(current + 1));
  thumbs.forEach((thumb, position) => thumb.addEventListener('click', () => show(position)));
  carousel.addEventListener('mouseenter', () => { paused = true; });
  carousel.addEventListener('mouseleave', () => { paused = false; });
  carousel.addEventListener('focusin', () => { paused = true; });
  carousel.addEventListener('focusout', () => { paused = false; });
  carousel.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') show(current - 1); if (event.key === 'ArrowRight') show(current + 1); });
  show(0);
  if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (!paused && !document.hidden) show(current + 1); }, 5000);
}

window.loadProjects().then((projects) => {
  const project = projects.find((item) => item.id === projectId) || projects[0];
  if (!project || !page) return;
  const projectImages = getProjectImages(project);
  const galleryImages = projectImages.slice(1);
  document.title = `${project.title} — Pedro Silva`;
  page.innerHTML = `
    <section class="case-hero section">
      <div class="case-heading reveal visible"><p class="eyebrow">${esc(project.category)}</p><h1>${esc(project.title)}</h1><p class="case-lead">${esc(project.subtitle)}</p><div class="tech-list">${(project.technologies || []).map((tech) => `<span>${esc(tech)}</span>`).join('')}</div><div class="case-actions">${project.liveUrl ? `<a class="button button-primary" href="${esc(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Ver projeto <i class="bx bx-link-external"></i></a>` : ''}${project.githubUrl ? `<a class="button button-ghost" href="${esc(project.githubUrl)}" target="_blank" rel="noopener noreferrer">Ver código <i class="bx bxl-github"></i></a>` : ''}</div></div>
      <div class="case-cover reveal visible"><img src="${esc(projectImages[0]?.src || '')}" alt="${esc(projectImages[0]?.alt || project.title)}" /></div>
    </section>
    <section class="case-section section section-soft"><div class="case-copy"><p class="eyebrow">Sobre o projeto</p><h2>Descrição<br /><em>completa.</em></h2><p>${esc(project.description)}</p></div><div class="case-copy"><p class="eyebrow">Tecnologias</p><h2>Stack<br /><em>utilizada.</em></h2><div class="tech-list">${(project.technologies || []).map((tech) => `<span>${esc(tech)}</span>`).join('')}</div></div></section>
    ${galleryImages.length ? `<section class="case-gallery section section-soft"><div class="section-heading"><p class="eyebrow">Galeria · ${String(galleryImages.length).padStart(2, '0')} imagens</p><h2>Veja o projeto<br /><em>em movimento.</em></h2><p class="gallery-intro">Navegue pelos principais momentos da experiência. Use as setas, as miniaturas ou as teclas direcionais.</p></div><div class="case-carousel" data-case-carousel tabindex="0" aria-label="Galeria de imagens de ${esc(project.title)}"><div class="case-carousel-stage">${galleryImages.map((image, index) => `<figure class="case-slide${index === 0 ? ' active' : ''}"><img src="${esc(image.src)}" alt="${esc(image.alt || `Imagem do projeto ${project.title}`)}" loading="eager" /><figcaption>${esc(image.alt || `Imagem ${index + 1} do projeto`)}</figcaption></figure>`).join('')}<button class="case-carousel-prev" type="button" aria-label="Imagem anterior"><i class="bx bx-left-arrow-alt"></i></button><button class="case-carousel-next" type="button" aria-label="Próxima imagem"><i class="bx bx-right-arrow-alt"></i></button></div><div class="case-carousel-toolbar"><span class="case-carousel-count">01 / ${String(galleryImages.length).padStart(2, '0')}</span><div class="case-carousel-progress" aria-hidden="true"><span></span></div><span class="case-carousel-hint">Arraste ou use ← →</span></div><div class="case-carousel-thumbs" aria-label="Selecionar imagem">${galleryImages.map((image, index) => `<button class="case-thumb${index === 0 ? ' active' : ''}" type="button" aria-label="Ver imagem ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}"><img src="${esc(image.src)}" alt="" loading="eager" /></button>`).join('')}</div></div></section>` : ''}
    <section class="case-next section"><a class="text-link" href="index.html#projects"><i class="bx bx-left-arrow-alt"></i> Ver todos os projetos</a></section>`;
  setupCaseCarousel();
}).catch((error) => { console.error(error); if (page) page.innerHTML = '<section class="section"><p>Não foi possível carregar este projeto.</p></section>'; });
