export interface SkillGroup {
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['JavaScript/Node.js', 'Python', 'Go'] },
  {
    label: 'Frameworks and libraries',
    items: ['Django', 'React', 'Gatsby', 'React Native', 'Gin'],
  },
  {
    label: 'Tools',
    items: [
      'Git',
      'Kubernetes',
      'Terraform',
      'Ansible',
      'GitLab CI',
      'GitHub Actions',
      'TeamCity',
      'Azure DevOps',
      'Travis',
    ],
  },
  { label: 'Cloud platforms', items: ['GCP', 'AWS', 'Azure'] },
];

export const hobbies: string[] = [
  'Paintballing',
  'Attending meetups',
  'Movies',
  'Reading',
  'Gaming (FIFA, PES, adventures, shooting)',
  'Open source contribution',
];
