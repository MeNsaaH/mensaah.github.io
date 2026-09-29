export const site = {
  name: 'Manasseh Mmadu',
  firstName: 'Manasseh',
  lastName: 'Mmadu',
  unit: 'MM-01',
  title: 'Site Reliability Engineer',
  summary: 'Built for backend systems, infrastructure and open source.',
  description:
    'Manasseh Mmadu is a Site Reliability Engineer working on backend systems, infrastructure and open source.',
  url: 'https://mensaah.me',
  /** The uptime counter starts here: the first listed role. */
  careerStart: '2018-06-01T00:00:00Z',
  runtime: 'Go, Python',
  orchestration: 'K8s, Terraform',
  resumeUrl:
    'https://docs.google.com/document/d/1m91RFBEX4rAiwB0F62iSgktYYPrA6Y1wNjrOEr9xJ5M/export?format=pdf',
  formAction: 'https://formspree.io/mrgedawv',
  about:
    'I am a dedicated and experienced Computer Engineer specializing in Backend Development and DevOps with a strong passion for open-source projects. With a deep understanding of infrastructure management and a drive for continuous improvement, I strive to optimize systems and automate processes for enhanced efficiency. My diverse skill set, combined with a commitment to staying updated on industry trends, allows me to deliver robust and scalable solutions.',
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
