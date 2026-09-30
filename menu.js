const header = document.querySelector('.site-header');
const toggle = header?.querySelector('.nav-toggle');

if (header && toggle) {
  const setOpen = (open) => {
    header.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('open')));
  header.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}
