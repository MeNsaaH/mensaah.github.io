import type { ImageMetadata } from 'astro';
import datakojo from '../assets/projects/datakojo.png';
import dhistance from '../assets/projects/dhistance.png';
import gophie from '../assets/projects/gophie.png';
import search from '../assets/projects/search.png';
import signalum from '../assets/projects/signalum.png';

export interface Project {
  name: string;
  description: string;
  /** Leave out to show the schematic placeholder tile. */
  image?: ImageMetadata;
  /** The first link is the main one, used by the command palette. */
  links: [{ label: string; href: string }, ...{ label: string; href: string }[]];
}

export const projects: Project[] = [
  {
    name: 'Reka',
    description: 'Cloud resource manager that stops, resumes or cleans up unused resources.',
    links: [{ label: 'View project', href: 'https://github.com/mensaah/reka' }],
  },
  {
    name: 'Dhistance',
    description:
      'SaaS that automates deploying DHIS2 instances, built with Django, Ansible, Docker and Celery.',
    image: dhistance,
    links: [{ label: 'View project', href: 'https://dhistance.com' }],
  },
  {
    name: 'Datakojo',
    description: 'Online survey platform built with Django and Celery.',
    image: datakojo,
    links: [{ label: 'View project', href: 'https://datakojo.com' }],
  },
  {
    name: 'Signalum',
    description:
      'Linux tool that detects and analyses Wi-Fi and Bluetooth connections, with a desktop app.',
    image: signalum,
    links: [
      { label: 'View project', href: 'https://github.com/bisoncorps/signalum' },
      { label: 'Desktop app', href: 'https://github.com/bisoncorps/signalum-desktop' },
    ],
  },
  {
    name: 'Search Engine Parser',
    description:
      'Python package that queries popular search engines and returns titles, links and descriptions.',
    image: search,
    links: [
      { label: 'View project', href: 'https://github.com/bisoncorps/search-engine-parser' },
      { label: 'API', href: 'https://github.com/bisoncorps/search-engine-api' },
    ],
  },
  {
    name: 'Gophie',
    description: 'Search, stream and download movies without the ads.',
    image: gophie,
    links: [{ label: 'View project', href: 'https://github.com/bisoncorps/gophie' }],
  },
];

export const moreProjects = [
  { label: 'GitHub', href: 'https://github.com/mensaah' },
  { label: 'open source organization', href: 'https://github.com/bisoncorps' },
] as const;
