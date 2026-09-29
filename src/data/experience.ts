export interface Role {
  /** Release label shown in the deploy log, for example 'v3.0'. */
  version: string;
  company: string;
  title: string;
  /** Short form for the telemetry panel, for example 'SRE'. */
  shortTitle: string;
  /** YYYY-MM */
  start: string;
  /** YYYY-MM. Leave out for the current role. */
  end?: string;
  /** One short line under the title, for example a promotion. */
  note?: string;
  bullets: string[];
  /** Public work from the role, shown after the bullets. */
  links?: { label: string; href: string }[];
}

/** Newest first. At most one role may have no `end`. */
export const roles: Role[] = [
  {
    version: 'v3.1',
    company: 'Zapier',
    title: 'Senior Site Reliability Engineer (Remote)',
    shortTitle: 'Senior SRE',
    start: '2022-07',
    note: 'Joined as SRE. Promoted to Senior SRE in June 2025.',
    bullets: [
      'Led the zero-downtime migration of the global routing layer to a serverless, Envoy-backed stack, enabling canary rollouts and region-aware routing.',
      'Saved over $400k a year with AWS VPC endpoints and an admission webhook that pulls images for 10,000+ services through an ECR cache.',
      'Built Kubechecks, an open-source controller that checks Argo CD changes in CI, and tuned Argo CD to manage 5,000+ applications.',
      'Built SLO operators that automate SLO management, and onboarded teams until they were adopted across the organisation.',
      'Raised Grafana reliability to 99.5% and Thanos to 99.9% by sharding Prometheus, running Thanos in HA and cutting cardinality.',
      'Led cross-team initiatives: zero-downtime upgrades of every cluster, signed Git commits in every repository, and recurring cost and security reviews.',
    ],
    links: [{ label: 'Kubechecks', href: 'https://github.com/zapier/kubechecks' }],
  },
  {
    version: 'v2.0',
    company: 'Deimos',
    title: 'Site Reliability Engineer (Remote)',
    shortTitle: 'SRE',
    start: '2020-04',
    end: '2022-05',
    bullets: [
      'Mentored four SRE interns in Kubernetes, GitOps and cloud operations. All four were promoted within 12 months.',
      'Automated provisioning across AWS, GCP and Azure with Terraform and Ansible, and brought existing infrastructure under Terraform.',
      'Bootstrapped and upgraded Kubernetes clusters with Kops and kubeadm, secured with OpenID login and RBAC.',
      'Introduced GitOps with Argo CD, and automated DNS and certificates with ExternalDNS and cert-manager.',
      'Sped up slow Azure and GitLab pipelines with cached builds and leaner artifacts.',
      'Set up HashiCorp Vault for Kubernetes, VMs and applications, and monitoring with Elastic Stack and Prometheus.',
    ],
    links: [{ label: 'Open-source Terraform modules', href: 'https://github.com/deimoscloud' }],
  },
  {
    version: 'v1.0',
    company: 'eHealth4Everyone',
    title: 'Backend Engineer (Remote)',
    shortTitle: 'Backend',
    start: '2018-05',
    end: '2019-07',
    bullets: [
      'Built a SaaS product that deploys DHIS2 servers automatically, using Ansible, Docker Compose, Celery and RabbitMQ.',
      'Extended the open-source OnaData project for multi-platform data collection and better data visualisation.',
      'Raised stability with end-to-end and unit tests across the Django suite, run in GitLab CI before every deployment.',
      'Cut query times with database optimisation and caching, and upgraded projects to Django 2.0 and Python 3.',
    ],
    links: [{ label: 'OnaData', href: 'https://github.com/onaio/onadata' }],
  },
];

export type RoleStatus = 'Active' | 'Retired';

export function roleStatus(role: Role): RoleStatus {
  return role.end === undefined ? 'Active' : 'Retired';
}

export function currentRole(list: Role[] = roles): Role | undefined {
  return list.find((role) => role.end === undefined);
}

/** 'Zapier / SRE', or 'Standby' between roles. */
export function activeDeployment(list: Role[] = roles): string {
  const role = currentRole(list);
  return role ? `${role.company} / ${role.shortTitle}` : 'Standby';
}
