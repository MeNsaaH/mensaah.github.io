export type PaletteAction = 'theme-light' | 'theme-dark';

export interface PaletteItem {
  label: string;
  hint: string;
  href?: string;
  external?: boolean;
  action?: PaletteAction;
  /** Text to put in the input instead of navigating. Used by `help`. */
  fill?: string;
}

export interface PaletteIndex {
  whoami: string;
  resumeUrl: string;
  sections: { label: string; href: string }[];
  projects: { label: string; href: string }[];
  /** Newest first. */
  posts: { label: string; href: string }[];
}

export interface PaletteResult {
  items: PaletteItem[];
  message?: string;
}

export const UNKNOWN_MESSAGE = 'Unknown command. Try help.';
export const NO_POSTS_MESSAGE = 'No field notes filed yet.';

const COMMANDS: { command: string; hint: string }[] = [
  { command: 'help', hint: 'List the commands' },
  { command: 'whoami', hint: 'Name, title and active deployment' },
  { command: 'ls projects', hint: 'List projects' },
  { command: 'ls posts', hint: 'List blog posts' },
  { command: 'cat blog/latest', hint: 'Open the newest post' },
  { command: 'goto ', hint: 'Go to a section, for example goto projects' },
  { command: 'theme light', hint: 'Switch to light mode' },
  { command: 'theme dark', hint: 'Switch to dark mode' },
  { command: 'say hi', hint: 'Go to the Say hi form' },
  { command: 'resume', hint: 'Open the resume PDF' },
];

const SAY_HI_HREF = '/#say-hi';

function sectionItems(index: PaletteIndex): PaletteItem[] {
  return index.sections.map((s) => ({ label: s.label, hint: 'Section', href: s.href }));
}

function projectItems(index: PaletteIndex): PaletteItem[] {
  return index.projects.map((p) => ({
    label: p.label,
    hint: 'Project',
    href: p.href,
    external: true,
  }));
}

function postItems(index: PaletteIndex): PaletteItem[] {
  return index.posts.map((p) => ({ label: p.label, hint: 'Post', href: p.href }));
}

function commandItems(): PaletteItem[] {
  return COMMANDS.map((c) => ({ label: c.command.trim(), hint: c.hint, fill: c.command }));
}

function matches(item: PaletteItem, query: string): boolean {
  return item.label.toLowerCase().includes(query);
}

/** Turns what was typed into the list to show. Pure: it never touches the page. */
export function resolve(input: string, index: PaletteIndex): PaletteResult {
  const query = input.trim().toLowerCase().replace(/\s+/g, ' ');

  if (query === '') {
    return {
      items: [
        ...sectionItems(index),
        { label: 'Blog', hint: 'Page', href: '/blog/' },
        ...postItems(index).slice(0, 5),
        { label: 'help', hint: 'List the commands', fill: 'help' },
      ],
    };
  }

  if (query === 'help') return { items: commandItems() };
  if (query === 'whoami') return { items: [], message: index.whoami };
  if (query === 'ls projects') return { items: projectItems(index) };

  if (query === 'ls posts') {
    const items = postItems(index);
    return items.length > 0 ? { items } : { items, message: NO_POSTS_MESSAGE };
  }

  if (query === 'cat blog/latest') {
    const latest = postItems(index)[0];
    return latest ? { items: [latest] } : { items: [], message: NO_POSTS_MESSAGE };
  }

  if (query === 'goto' || query.startsWith('goto ')) {
    const wanted = query.slice('goto'.length).trim();
    const items = sectionItems(index).filter((item) => matches(item, wanted));
    return items.length > 0 ? { items } : { items, message: UNKNOWN_MESSAGE };
  }

  if (query === 'theme light') {
    return { items: [{ label: 'Light mode', hint: 'Theme', action: 'theme-light' }] };
  }
  if (query === 'theme dark') {
    return { items: [{ label: 'Dark mode', hint: 'Theme', action: 'theme-dark' }] };
  }
  if (query === 'say hi') {
    return { items: [{ label: 'Say hi', hint: 'Section', href: SAY_HI_HREF }] };
  }
  if (query === 'resume') {
    return {
      items: [{ label: 'Resume', hint: 'PDF', href: index.resumeUrl, external: true }],
    };
  }

  const items = [
    ...sectionItems(index),
    { label: 'Blog', hint: 'Page', href: '/blog/' },
    ...postItems(index),
    ...projectItems(index),
    ...commandItems(),
  ].filter((item) => matches(item, query));

  return items.length > 0 ? { items } : { items, message: UNKNOWN_MESSAGE };
}

export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

/** `/` opens the palette unless the person is typing; Ctrl+K and Cmd+K always do. */
export function isOpenShortcut(event: KeyLike, typingInField: boolean): boolean {
  if (event.altKey) return false;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') return true;
  if (event.ctrlKey || event.metaKey) return false;
  return event.key === '/' && !typingInField;
}
