/*
 * Carregador de conteúdo do portfólio.
 *
 * Para adicionar um projeto, crie content/projects/meu-projeto.json e inclua
 * "meu-projeto" no array de content/projects/index.json.
 */
window.PROJECTS = [];
window.loadProjects = async function loadProjects() {
  if (window.__projectsPromise) return window.__projectsPromise;
  window.__projectsPromise = fetch('content/projects/index.json', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`Não foi possível carregar o índice de projetos (${response.status})`);
      return response.json();
    })
    .then(async (index) => {
      const ids = Array.isArray(index.projects) ? index.projects : [];
      const loaded = await Promise.all(ids.map(async (id) => {
        const response = await fetch(`content/projects/${encodeURIComponent(id)}.json`, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Não foi possível carregar o projeto ${id} (${response.status})`);
        return response.json();
      }));
      window.PROJECTS = loaded.filter((project) => project && project.id);
      return window.PROJECTS;
    });
  return window.__projectsPromise;
};
