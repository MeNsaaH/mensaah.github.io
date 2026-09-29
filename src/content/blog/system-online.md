---
title: "System online"
description: "The blog is live. What to expect from these field notes."
pubDate: 2026-09-29
tags: [meta]
draft: false
---

This is the first entry in my field notes.

I plan to write about the things I work on day to day: reliability engineering,
infrastructure, Kubernetes, Terraform, and the open source projects I maintain.
Some posts will be postmortems, some will be short notes on a tool or a fix.

## How this blog works

Each post is a Markdown file in the same repository as the rest of this site.
Publishing is a push to `master`:

```bash
git add src/content/blog/my-new-post.md
git commit -m "post: my new post"
git push
```

More soon.
