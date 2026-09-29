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
      {
        text: 'Had some of the best classmates around, where we learnt concepts of computer architecture, data structures and much more. Even worked on Arduino IoT devices, Raspberry Pi and assembly language as well.',
      },
      {
        text: 'I was involved in a lot of projects: part of a school research group where we focused on the advancement of SDNs and WSNs.',
      },
      { text: 'Graduated with First Class Honors.' },
      {
        text: 'I was also part of the founders of a developer community to mentor upcoming developers:',
        link: { label: 'FUT Developers Circle', href: 'https://futminna-dev-circle.github.io' },
      },
    ],
  },
];
