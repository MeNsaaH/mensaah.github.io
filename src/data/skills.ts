export interface SkillGroup {
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['Python', 'Go', 'Bash'] },
  {
    label: 'Tools',
    items: [
      'Kubernetes',
      'Terraform',
      'Ansible',
      'Argo CD',
      'Helm',
      'GitLab CI',
      'GitHub Actions',
      'Azure DevOps',
    ],
  },
  { label: 'Cloud platforms', items: ['GCP', 'AWS', 'Azure'] },
];

export const hobbies: string[] = [
  'Paintballing',
  'Meetups',
  'Movies',
  'Reading',
  'Gaming',
  'Open source',
];
