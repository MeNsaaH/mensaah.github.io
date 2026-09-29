/** The small-screen menu button. Without JavaScript the links are simply always shown. */
export function initMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!button || !menu) return;

  const setOpen = (open: boolean) => {
    menu.toggleAttribute('data-open', open);
    button.setAttribute('aria-expanded', String(open));
  };

  button.addEventListener('click', () => setOpen(!menu.hasAttribute('data-open')));
  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.hasAttribute('data-open')) return;
    setOpen(false);
    button.focus();
  });
}
