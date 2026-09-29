export const site = {
  name: 'Manasseh Mmadu',
  firstName: 'Manasseh',
  lastName: 'Mmadu',
  unit: 'MM-01',
  title: 'Senior Site Reliability Engineer',
  summary: 'Built for multi-cloud Kubernetes platforms, automation and open source.',
  description:
    'Manasseh Mmadu is a Senior Site Reliability Engineer building multi-cloud Kubernetes platforms and developer-first infrastructure.',
  url: 'https://mensaah.me',
  /** The uptime counter starts here: the first listed role. */
  careerStart: '2018-05-01T00:00:00Z',
  runtime: 'Go, Python',
  orchestration: 'K8s, Terraform',
  resumeUrl:
    'https://docs.google.com/document/d/1m91RFBEX4rAiwB0F62iSgktYYPrA6Y1wNjrOEr9xJ5M/export?format=pdf',
  formAction: 'https://formspree.io/mrgedawv',
  /** One string per paragraph. */
  about: [
    'Unit MM-01 was assembled at the Federal University of Technology, Minna, from a Computer Engineering degree and an unhealthy interest in why servers fall over.',
    'Early versions wrote Django. Later versions were upgraded to Kubernetes, Terraform and Go and deployed to Zapier. The current version leads zero-downtime migrations, sets the reliability standards other teams build on, and mentors newer units.',
    'Known issue: could spend five hours investigating a minor performance bug. No fix planned.',
  ],
  blogTitle: 'Field notes',
  blogDescription:
    'Field notes on reliability, infrastructure and open source by Manasseh Mmadu.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/mensaah' },
    { label: 'Stack Overflow', href: 'https://stackoverflow.com/users/7167357/mensaah-m' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/manasseh-mmadu' },
    { label: 'Twitter', href: 'https://twitter.com/iamMensaah' },
  ],
} as const;

/** Home page sections in order. The section number is the position in this list. */
export const sections = [
  { id: 'about', label: 'About', nav: true },
  { id: 'deploys', label: 'Deploys', nav: true },
  { id: 'education', label: 'Education', nav: false },
  { id: 'projects', label: 'Projects', nav: true },
  { id: 'skills', label: 'Skills', nav: false },
  { id: 'hobbies', label: 'Hobbies', nav: false },
  { id: 'say-hi', label: 'Say hi', nav: false },
] as const;

export type SectionId = (typeof sections)[number]['id'];

/** '01' for the first section, '07' for the seventh. */
export function sectionNumber(id: SectionId): string {
  const index = sections.findIndex((section) => section.id === id);
  return String(index + 1).padStart(2, '0');
}
