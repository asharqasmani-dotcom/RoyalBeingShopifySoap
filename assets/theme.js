
(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];

  // Mobile menu
  const drawer = qs('[data-menu-drawer]');
  const overlay = qs('[data-menu-overlay]');
  const openMenu = () => { drawer?.classList.add('is-open'); overlay?.classList.add('is-open'); drawer?.setAttribute('aria-hidden','false'); };
  const closeMenu = () => { drawer?.classList.remove('is-open'); overlay?.classList.remove('is-open'); drawer?.setAttribute('aria-hidden','true'); };
  qsa('[data-menu-open]').forEach(b => b.addEventListener('click', openMenu));
  qsa('[data-menu-close]').forEach(b => b.addEventListener('click', closeMenu));
  overlay?.addEventListener('click', closeMenu);

  // Cart drawer (theme editor / AJAX ready hooks)
  const cart = qs('[data-cart-drawer]');
  const cartOverlay = qs('[data-cart-overlay]');
  const openCart = () => { cart?.classList.add('is-open'); cartOverlay?.classList.add('is-open'); };
  const closeCart = () => { cart?.classList.remove('is-open'); cartOverlay?.classList.remove('is-open'); };
  qsa('[data-cart-open]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openCart(); }));
  qsa('[data-cart-close]').forEach(b => b.addEventListener('click', closeCart));
  cartOverlay?.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); closeCart(); }
  });

  // Video controls
  qsa('[data-video]').forEach((wrap) => {
    const video = qs('video', wrap);
    const play = qs('[data-video-play]', wrap);
    const mute = qs('[data-video-mute]', wrap);
    if (!video) return;
    video.muted = true;
    play?.addEventListener('click', () => {
      if (video.paused) { video.play(); play.textContent = 'Pause'; }
      else { video.pause(); play.textContent = 'Play'; }
    });
    mute?.addEventListener('click', () => {
      video.muted = !video.muted;
      mute.textContent = video.muted ? 'Unmute' : 'Mute';
    });
  });

  // Qty
  qsa('[data-qty]').forEach((wrap) => {
    const input = qs('input', wrap);
    qs('[data-qty-minus]', wrap)?.addEventListener('click', () => { input.value = Math.max(1, (parseInt(input.value||'1',10)-1)); });
    qs('[data-qty-plus]', wrap)?.addEventListener('click', () => { input.value = Math.max(1, (parseInt(input.value||'1',10)+1)); });
  });
})();
