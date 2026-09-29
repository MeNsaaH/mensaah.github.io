---
title: "Why container_cpu_cfs_throttled_periods_total lies about CPU throttling in Kubernetes"
description: "A fixture with an unbroken_metric_name_that_cannot_wrap_at_a_space, wide code and a wide table."
pubDate: 2026-09-30
tags: [k8s, "K8s ", "Site Reliability"]
---

Intro with `inline code` and a [link](https://example.com/a/very/long/url/that/keeps/going/and/going/and/going/without/any/break/characters).

## What happened

```bash
kubectl get pods --all-namespaces --field-selector=status.phase!=Running -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName
```

| Time | Event | Owner | Notes that go on for quite a while to force width |
|---|---|---|---|
| 09:00 | CoreDNS CrashLoopBackOff | me | Something long enough to make the table wider than a phone screen |
