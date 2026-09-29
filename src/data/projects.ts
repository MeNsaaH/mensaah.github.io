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
    description:
      'A cloud resource management tool to destroy, stop, resume, or clean up unused resources.',
    links: [{ label: 'View project', href: 'https://github.com/mensaah/reka' }],
  },
  {
    name: 'Dhistance',
    description:
      'A SaaS application for automating the deployment process of DHIS2 instances on servers. Tasks done involved creating a flexible architecture and database model and implementing them. The application was implemented using Django (Python), where deployment tasks were executed using Ansible, Docker and Celery in the background. I implemented templates using Bootstrap.',
    image: dhistance,
    links: [{ label: 'View project', href: 'https://dhistance.com' }],
  },
  {
    name: 'Datakojo',
    description:
      'Datakojo is a platform for conducting online surveys built using Django and Celery for background tasks.',
    image: datakojo,
    links: [{ label: 'View project', href: 'https://datakojo.com' }],
  },
  {
    name: 'Signalum',
    description:
      'A Linux package to detect and analyze existing connections from Wi-Fi and Bluetooth, created using Python. It also comes with a GUI application.',
    image: signalum,
    links: [
      { label: 'View project', href: 'https://github.com/bisoncorps/signalum' },
      { label: 'View desktop application', href: 'https://github.com/bisoncorps/signalum-desktop' },
    ],
  },
  {
    name: 'Search Engine Parser',
    description:
      'Package to query popular search engines and scrape for result titles, links and descriptions. Aims to scrape the widest range of search engines.',
    image: search,
    links: [{ label: 'View project', href: 'https://github.com/bisoncorps/search-engine-parser' }],
  },
  {
    name: 'Gophie',
    description:
      'Gophie is a tool to help you search, stream and download movies from movie sites without going through all the stress of by-passing ads.',
    image: gophie,
    links: [{ label: 'View project', href: 'https://github.com/go-phie' }],
  },
];

export const moreProjects = [
  { label: 'GitHub', href: 'https://github.com/mensaah' },
  { label: 'open source organization', href: 'https://github.com/bisoncorps' },
] as const;
