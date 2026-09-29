import {
  isOpenShortcut,
  resolve,
  type PaletteIndex,
  type PaletteItem,
} from '../lib/palette';
import { setTheme } from './theme';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function initPalette(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-palette]');
  const form = dialog?.querySelector<HTMLFormElement>('[data-palette-form]');
  const input = dialog?.querySelector<HTMLInputElement>('[data-palette-input]');
  const list = dialog?.querySelector<HTMLUListElement>('[data-palette-list]');
  const message = dialog?.querySelector<HTMLElement>('[data-palette-message]');
  const source = document.getElementById('palette-index');
  if (!dialog || !form || !input || !list || !message || !source?.textContent) return;
  if (typeof dialog.showModal !== 'function') return;

  let index: PaletteIndex;
  try {
    index = JSON.parse(source.textContent) as PaletteIndex;
  } catch {
    return;
  }

  let items: PaletteItem[] = [];
  let active = 0;

  const highlight = (position: number) => {
    if (items.length === 0) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    active = (position + items.length) % items.length;
    [...list.children].forEach((child, i) => {
      child.setAttribute('aria-selected', String(i === active));
    });
    const current = list.children[active];
    if (!current) return;
    input.setAttribute('aria-activedescendant', current.id);
    current.scrollIntoView({ block: 'nearest' });
  };

  const run = (position: number) => {
    const item = items[position];
    if (!item) return;

    if (item.fill !== undefined) {
      input.value = item.fill;
      render();
      input.focus();
      return;
    }

    dialog.close();
    if (item.action === 'theme-light') setTheme('light');
    if (item.action === 'theme-dark') setTheme('dark');
    if (!item.href) return;
    if (item.external) window.open(item.href, '_blank', 'noopener');
    else window.location.assign(item.href);
  };

  const render = () => {
    const result = resolve(input.value, index);
    items = result.items;
    message.textContent = result.message ?? '';
    message.hidden = result.message === undefined;

    list.replaceChildren(
      ...items.map((item, i) => {
        const row = document.createElement('li');
        row.id = `palette-item-${i}`;
        row.setAttribute('role', 'option');

        const label = document.createElement('span');
        label.textContent = item.label;
        const hint = document.createElement('span');
        hint.className = 'palette-hint';
        hint.textContent = item.hint;
        row.append(label, hint);

        row.addEventListener('click', () => run(i));
        row.addEventListener('pointermove', () => {
          if (active !== i) highlight(i);
        });
        return row;
      }),
    );
    highlight(0);
  };

  const open = () => {
    if (dialog.open) return;
    input.value = '';
    render();
    dialog.showModal();
    input.focus();
  };

  document.addEventListener('keydown', (event) => {
    if (dialog.open) return;
    if (!isOpenShortcut(event, isTypingTarget(event.target))) return;
    event.preventDefault();
    open();
  });

  document.querySelectorAll<HTMLElement>('[data-palette-open]').forEach((trigger) => {
    trigger.hidden = false;
    trigger.addEventListener('click', open);
  });

  input.addEventListener('input', render);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlight(active + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlight(active - 1);
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run(active);
  });

  // A click on the backdrop lands on the dialog element itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
