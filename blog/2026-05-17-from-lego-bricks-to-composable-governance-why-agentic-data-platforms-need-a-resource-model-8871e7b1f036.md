---
date: 2026-05-17
title: "From Lego Bricks to Composable Governance: Why Agentic Data Platforms Need a Resource Model"
description: "In the earlier post on building data supply chains with Lego bricks, we argued that Earth Observation does not only have a scale problem. It has a plumbing problem. Petabytes of..."
tags: "crossplane, composable-infrastructure, data-governance"
image: blog/images/2026-05-17-from-lego-bricks-to-composable-governance-why-agentic-data-platforms-need-a-resource-model-8871e7b1f036-1.png
origin_url: https://medium.com/@stefan.achtsnit_41940/from-lego-bricks-to-composable-governance-why-agentic-data-platforms-need-a-resource-model-8871e7b1f036
origin_title: Medium
---

# From Lego Bricks to Composable Governance: Why Agentic Data Platforms Need a Resource Model
![](blog/images/2026-05-17-from-lego-bricks-to-composable-governance-why-agentic-data-platforms-need-a-resource-model-8871e7b1f036-1.png)

In the [earlier post](blog.html?post=2025-10-01-building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6) on building data supply chains with Lego bricks, we argued that Earth Observation does not only have a scale problem. It has a plumbing problem. Petabytes of data, countless sensor streams, and increasingly capable processing environments are already available. The hard part is how data is stored, shared, governed, reused, and turned into dependable products across teams. The proposal was simple: stop rebuilding the same infrastructure patterns again and again, and start composing reusable building blocks instead. Storage, Data Labs, registries, providers, controllers, and compositions become the Lego bricks of a modern EO data supply chain.

That argument still stands. But something has changed since then. The next users of these building blocks will not only be researchers, engineers, data stewards, and platform teams. Increasingly, they will also be agents.

> Agents will request workspaces. Agents will inspect data. Agents will suggest access changes. Agents will trigger processing. Agents will prepare publications. Agents will help debug failed workflows. Agents will eventually become normal participants in the data supply chain.

This does not make the platform problem smaller. It makes it more visible. Because the moment an agent can do something useful, it can also do something risky.

## The first instinct: put a gateway in front of everything

The agent ecosystem is already discovering this. The Model Context Protocol, or MCP, has become one of the main ways to connect AI applications to external systems, tools, workflows, and data sources. That is useful because it reduces integration friction. Instead of every agent, tool, and data source having its own custom integration, MCP gives the ecosystem a common shape.

> But once agents can call tools, the next question appears immediately: who is allowed to call which tool, under which identity, with which parameters, for which task, and with what audit trail?

That is why MCP gateways are emerging. They sit between agents and MCP servers, adding authentication, authorization, tool filtering, observability, and policy enforcement. This is not surprising. It is the normal platform story repeating itself: first we connect things, then we realize connected things need rules.

For external APIs, the gateway pattern is often the right answer. If a tool is outside our control, a governed proxy gives us a boundary. It can authenticate, filter, rate-limit, log, and observe tool access. That is valuable.

But for platform capabilities we own, there is a better pattern. **Do not only govern the API call. Govern the intent**.

## A gateway governs a call. A resource governs a lifecycle.

This distinction matters.

- A gateway can answer a question like: May this agent call create_bucket with these parameters?
- A resource model can ask a richer question: May this actor declare this storage intent, in this namespace, under this policy, with this lifecycle, for this owner, and with these access consequences?

The second question is much closer to what platform teams actually need.

Creating a bucket is rarely just creating a bucket. In a real data platform, it may also mean choosing a backend, creating credentials, applying lifecycle rules, granting access, exposing connection details, recording ownership, making storage discoverable, linking it to a workspace, checking quota policies, and reporting whether everything is ready. That is not a single tool call. **It is a lifecycle object**.

This is why the Kubernetes resource model is so important. A Kubernetes resource is not just a request. It is a durable object with metadata, desired state, observed state, references, labels, events, RBAC, admission, audit, and reconciliation around it. Once a platform capability is expressed as a resource, it can be reviewed, validated, watched, reconciled, audited, and composed with other resources.

> This is the point where the Lego analogy needs an upgrade. Lego bricks are useful because they are reusable. But Lego systems work because they also have a connection model. The studs fit. The geometry is predictable. Pieces can be combined without negotiating a new interface every time.

A data platform needs the same thing:

- The bricks are storage, workspaces, registries, catalogs, credentials, snapshots, policies, and controllers.
- The connection model is the Kubernetes resource model.

The next step is composable governance.

## From composable infrastructure to composable governance

In the previous posts, our [storage resource](https://provider-storage.versioneer.at/) was the simple story. A team declares a storage claim. Behind the scenes, the platform creates buckets, users, policies, credentials, and Kubernetes Secrets. The team does not need to think about IAM policies or backend-specific storage details. It declares what it needs, and the platform composes the rest.

That remains a strong example. But the next step is not only that storage becomes composable. Governance around storage must become composable too.

Imagine an agent helping a research team prepare a new sea-ice analysis environment. In a naive tool-calling model, the agent might call separate tools to create a bucket, create an access key, create a workspace, mount a dataset, create a database, grant access to another team, publish a preview, and update a catalog.

Every tool call now needs its own policy logic. Every tool needs to know something about ownership, namespace, quota, data sensitivity, access rules, and audit requirements. The more useful the agent becomes, the more the policy surface grows.

This is where sprawl returns. Not infrastructure sprawl this time, but governance sprawl.

A Kubernetes-native model avoids much of this by changing the action surface. The agent does not call every backend directly. It declares a small number of platform resources.

For example:

```yaml
apiVersion: pkg.internal/v1beta1
kind: Storage
metadata:
  name: team-sea-ice
  namespace: research
spec:
  principal: team-sea-ice
  buckets:
    - bucketName: bucket-sea-ice
      discoverable: true
  bucketAccessGrants:
    - bucketName: bucket-sea-ice
      grantee: team-ocean-model
      permission: Read
      grantedAt: "2025-10-01T12:17:00Z"
```

This is not just a YAML version of an API call. It is a **platform contract**.

The resource can be reviewed before it is applied. RBAC can decide who may create it. A policy engine can validate the fields. Crossplane can compose it into backend-specific resources. Controllers can reconcile it over time. Status can show whether the bucket, credentials, and grants are actually ready.

The same idea applies to a cloud workspace, what we call a Data Lab:

```yaml
apiVersion: pkg.internal/v1beta2
kind: Datalab
metadata:
  name: team-sea-ice
spec:
  users:
    - alice
    - bob
  sessions:
    - name: default
      state: started
  data:
    readOnlyMount: true
  databases:
    pg0:
      names:
        - analysis
      storage: 20Gi
  registry:
    enabled: true
  security:
    policy: baseline
```

Again, the agent is not manually wiring every component. It is asking for a governed workspace. The platform decides how that request becomes namespaces, storage mounts, credentials, database instances, quotas, security defaults, and runtime access.

This is the difference between giving an agent a toolbox and giving it a platform contract.

## Crossplane is the composition layer, not the whole story

[Crossplane](https://www.crossplane.io/) is important here because it gives us a practical way to define these higher-level APIs and compose them into lower-level resources. An XRD defines the shape of a custom API, while a Composition defines how that API creates other resources.

That is the platform pattern Versioneer is leaning into: expose reusable capabilities as Kubernetes resources, while keeping implementation details behind a versioned, inspectable, composable contract.

- A [storage resource](https://provider-storage.versioneer.at/) does this for S3-compatible storage. It packages bucket creation, access policies, credentials, lifecycle rules, and cross-user sharing into one spec.
- A [Data Lab resource](https://provider-datalab.versioneer.at/) does this for governed cloud sandboxes. It packages VS Code Server, terminals, storage access, optional vclusters, managed data services, registries, quotas, and security defaults behind one claim.

These are not isolated tools. They are examples of a pattern. Storage becomes a resource. A lab becomes a resource. Credentials become a resource output. Access becomes declared state. A database becomes part of a composed workspace. A registry becomes part of the same platform contract.

The more capabilities are expressed this way, the more the platform can reason about them.

## Policy becomes another brick

The real power appears when policy is no longer an afterthought.

> In many systems, governance is bolted on after the interface exists. First there is an API. Then there is a gateway. Then there is an exception list. Then there is a special rule for one team, another rule for one agent, and another rule for one workflow.

That can work for a while, but it does not compose well.

A Kubernetes-native approach lets policy participate directly in the lifecycle of the resource. Tools such as [Kyverno](https://kyverno.io/) can validate or mutate resources before they become part of the cluster state. That means policies can be written against the platform object itself.

A discoverable bucket may require metadata about data sensitivity. A write grant to another team may require a reason. A Data Lab with elevated permissions may require a short lifetime. An agent-created workspace may require a budget class.

These rules are not hidden inside a prompt, a script, or a gateway-specific plugin. They become part of the platform.

This is composable governance: policy becomes another building block that can be combined with storage, workspaces, identity, registries, catalogs, and lifecycle controllers.

## Status is the platform's memory

The other half of the resource model is status.

This is where the platform stops being just a provisioning interface and starts becoming operationally useful. In Earth Observation, this matters a lot. As argued in the earlier processing post, EO workflows are often less limited by raw compute than by the coordination layer around processing: state, orchestration, reproducibility, validation, and productization.

Real operational workflows are not one clean pipeline. They involve pauses, retries, quality checks, updated inputs, partial reruns, product releases, and humans in the loop.

Agents will need to operate in that messy reality. They cannot rely on "the workflow ran" as proof that the system is ready. They need a way to inspect what the platform actually observed.

That is what status can provide.

```yaml
status:
  storage:
    mountedBuckets:
      - name: bucket-sea-ice
        quota: 500Gi
        used: 137Gi
  services:
    postgres:
      ready: true
      backup:
        lastRun: "2026-05-17T02:00:00Z"
        status: "Succeeded"
      slo:
        availability: "99.72% / 99.9%"
        latency: "97.8% < 100ms / 95% < 100ms"
```

This is not a metrics database. Metrics, logs, traces, and large datasets belong in systems designed for those purposes.

> But status can summarize operational meaning. A human can read it. A controller can react to it. A GitOps system can wait on it. An agent can reason over it.

This is why status is not decoration. It is the memory of the platform object.

## The practical middle ground: governed sessions

Governance should not become a loose collection of rules spread across scripts, prompts, APIs, gateways, dashboards, and human memory. Composable governance does not mean building one giant control plane that owns everything. It means exposing important platform capabilities as clear, reusable resource contracts. Behind these contracts, the platform can still use object storage, Kubernetes, Crossplane, Kyverno, GitOps, registries, databases, caches, vector stores, observability systems, and external identity providers. But users and agents should not have to wire all of that together themselves.

The practical middle ground is the Data Lab session. A session is an always-available or on-demand cloud sandbox for a team, a user, or a project. Humans can use it directly through terminals, VS Code, notebooks, dashboards, and APIs. They can also start agents inside the same session. These agents do not need a separate special environment. They work in the same sandbox as the user or team that started them, with the same identity boundaries, storage access, network limits, and platform rules.

The session gives humans and agents a ready-made working environment. It provides compute, memory, file and object storage, and access to higher-level services such as Postgres, Redis, MongoDB, Qdrant, registries, catalogs, or other data services. But the important part is that this environment can also include its own Kubernetes API interface, through a dedicated namespace or a separate vcluster.

> This Kuberntes cluster is where new processes are started. When a human submits a processing job, deploys a temporary service, runs a validation task, or starts a workflow engine, it leverages the Kubernetes API. When an agent does the same, it acts through the same API interface. This is a key simplification: agents do not need a new platform-specific execution model. They already know how to interact with Kubernetes concepts such as resources, namespaces, jobs, services, status, and logs. The platform can therefore expose a familiar Kubernetes interface, while still keeping the real host cluster protected.

This creates a simple split: the team gets freedom inside the session, while the platform keeps control around it. The outer platform governs the session before it even starts. Operators can define which teams may create sessions, which session types they may use, how long sessions may live, how much CPU, memory, GPU, and storage they may consume, whether internet access is allowed, which datasets may be mounted, which managed services may be added.

The same Kubernetes-native controls still apply around the sandbox. RBAC controls who may create or change sessions. ResourceQuotas and LimitRanges bound consumption. NetworkPolicies limit communication. Admission control and Kyverno can enforce allowed images, security settings, labels, service accounts, and other rules. GitOps can add review, history, and rollback. That is the useful middle ground:**self-service for the team, but governance for the platform**.

For agents, this is especially important. An agent should not be trusted just because it is useful. But it should also not be blocked from useful work because direct backend access would be too risky. A governed session gives it a bounded place to act. The agent can use the workspace, data access, services, network paths, and additional Kubernetes capabilities like a vcluster that the platform has explicitly made available.

> Side note: this also makes it easier to introduce your own customized agents. These agents do not need to learn a completely new platform model. They can build on concepts that already exist and are well documented: Kubernetes resources, namespaces, RBAC, vclusters, Kyverno policies, quotas, services, jobs, logs, and status. The platform does not create a new world for agents. It lets agents work in the existing cloud-native world, but inside a governed boundary. More on that in a follow-up post.

MCP gateways are useful when agents need governed access to external tools and APIs. But for platform capabilities we own, the stronger pattern is to model the capability as a resource, controlled from the outside by the same Kubernetes-native governance model that already protects the human team.
