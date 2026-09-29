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
      'Led the zero-downtime move of the global routing layer from Kubernetes NGINX to a serverless, Envoy-backed stack on CloudFront and Lambda@Edge.',
      'Built a Kubernetes admission webhook that routes image pulls through an ECR cache, saving $100k a year across 10,000+ services.',
      'Saved over $300k a year by moving Datadog, S3, ECR and SQS traffic to AWS VPC endpoints.',
      'Built Kubechecks and tuned Argo CD, giving 5,000+ applications CI checks and faster releases.',
      'Led zero-downtime upgrades of every Kubernetes cluster.',
      'Cut support toil by 50% through automation.',
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
      'Automated provisioning across AWS, GCP and Azure with Terraform and Ansible.',
      'Bootstrapped and upgraded Kubernetes clusters with Kops and kubeadm, secured with OpenID login and RBAC.',
      'Introduced GitOps with Argo CD, and automated DNS and certificates with ExternalDNS and cert-manager.',
      'Set up monitoring with Elastic Stack and Prometheus.',
      'Mentored four SRE interns. All four were promoted within 12 months.',
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
      'Built and maintained Django applications, with end-to-end and unit tests across the suite.',
      'Built a SaaS product that deploys DHIS2 servers automatically, using Ansible, Docker Compose, Celery and RabbitMQ.',
      'Cut query times with database optimisation and caching.',
      'Upgraded projects from Django 1.11 and Python 2 to Django 2.0 and Python 3.',
    ],
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
