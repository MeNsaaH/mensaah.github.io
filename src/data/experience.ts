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
  bullets: string[];
}

/** Newest first. At most one role may have no `end`. */
export const roles: Role[] = [
  {
    version: 'v3.0',
    company: 'Zapier',
    title: 'Site Reliability Engineer',
    shortTitle: 'SRE',
    start: '2022-07',
    bullets: [],
  },
  {
    version: 'v2.0',
    company: 'Deimos',
    title: 'DevOps Engineer',
    shortTitle: 'DevOps',
    start: '2020-04',
    end: '2022-07',
    bullets: [
      'Creating and maintaining infrastructure on AWS, GCP and Azure.',
      'Using Terraform to automate infrastructure creation.',
      'Setting up and maintaining Kubernetes clusters on cloud providers, and clusters deployed using Kops and kubeadm.',
      'Monitoring Kubernetes clusters using Elastic Stack and Prometheus.',
      'Deploying applications on Kubernetes (ExternalDNS, Elastic Stack, Prometheus and others) using Helm, Kustomize or Argo CD.',
      'Setting up pipelines (Azure, GitLab) to run jobs.',
    ],
  },
  {
    version: 'v1.0',
    company: 'eHealth4Everyone',
    title: 'Backend Developer (Remote)',
    shortTitle: 'Backend',
    start: '2018-06',
    end: '2019-07',
    bullets: [
      'Maintenance and improvement of existing Django applications. Maintenance tasks ensured all applications have proper tests and also optimization of Django database queries. Creating background tasks using Celery for long running processes which revolved around executing Ansible scripts for infrastructure setups and generating exports from data files (CSV, JSON, XML) using Python.',
      'Implementation of mock-ups using Django templates and ensuring template re-usability. Upgrading projects from Django 1.11/Python 2 to Django 2.0/Python 3.',
      'Orchestrated CI pipeline using GitLab CI to run implemented tests and build projects before deployment.',
      'Creation and maintenance of existing Django applications. Used Celery task queues with Django to run long running processes and Bootstrap to design templates.',
      'Creation of SaaS application to autodeploy DHIS2 servers using Ansible to automate infrastructure setup, Docker (Compose) for container orchestration, Celery for executing Ansible scripts, RabbitMQ as message queue for communication between Django and Celery server, caching using Memcached. Tasks also involved design of application mockups using Bootstrap.',
      'Maintenance of PyQt5 projects which used requests to pull data from API endpoints.',
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
