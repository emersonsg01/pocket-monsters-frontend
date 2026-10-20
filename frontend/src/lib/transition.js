const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Navega usando a View Transitions API: a imagem de origem (o card clicado)
 * "voa" até a arte grande do painel de detalhes. Espera até 500 ms pelos dados
 * para que o novo estado já esteja pronto no momento da captura.
 */
export async function transitionTo(navigate, to, { source, ready } = {}) {
  if (!document.startViewTransition || reducedMotion()) {
    navigate(to);
    return;
  }
  if (ready) await Promise.race([ready.catch(() => {}), timeout(500)]);

  const root = document.documentElement;
  if (source) {
    // Só o card clicado pode ter o nome durante a captura do estado antigo.
    source.style.viewTransitionName = 'hero-art';
    root.classList.add('vt-from-card');
  }
  document.startViewTransition(async () => {
    if (source) {
      source.style.viewTransitionName = '';
      root.classList.remove('vt-from-card');
    }
    await navigate(to, { flushSync: true });
  });
}
