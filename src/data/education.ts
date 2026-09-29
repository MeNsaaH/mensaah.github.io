export interface EducationNote {
  text: string;
  /** Rendered after the text. */
  link?: { label: string; href: string };
}

export interface Education {
  institution: string;
  degree: string;
  /** YYYY-MM */
  start: string;
  /** YYYY-MM */
  end: string;
  notes: EducationNote[];
}

export const education: Education[] = [
  {
    institution: 'Federal University of Technology, Minna',
    degree: 'Bachelor of Engineering in Computer Engineering',
    start: '2014-01',
    end: '2019-11',
    notes: [
      { text: 'Graduated with First Class Honours.' },
      {
        text: 'Member of a research group working on 5G, wireless sensor networks and software-defined networks.',
      },
      {
        text: 'Co-founded a community that mentors new developers:',
        link: { label: 'FUT Developers Circle', href: 'https://futminna-dev-circle.github.io' },
      },
    ],
  },
];

export const certifications: string[] = [
  'Google Cloud Certified Professional Cloud Architect',
  'Google Cloud Certified Professional DevOps Engineer',
  'Certified Kubernetes Application Developer (CKAD)',
  'Linux Kernel Internals and Development (LFD420)',
];
