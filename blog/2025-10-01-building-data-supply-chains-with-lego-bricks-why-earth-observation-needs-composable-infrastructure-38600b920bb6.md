---
date: 2025-10-01
title: "Building Data Supply Chains with Lego Bricks: Why Earth Observation Needs Composable Infrastructure"
description: "Earth Observation has always been about scale. Petabytes of satellite imagery, countless sensor streams, and the ever-growing demand to turn raw data into actionable products...."
tags: "supply-chain-data, crossplane, composable-infrastructure"
image: blog/images/2025-10-01-building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6-1.png
origin_url: https://medium.com/@stefan.achtsnit_41940/building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6
origin_title: Medium
---

# Building Data Supply Chains with Lego Bricks: Why Earth Observation Needs Composable Infrastructure

![](blog/images/2025-10-01-building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6-1.png)

Earth Observation has always been about scale. Petabytes of satellite imagery, countless sensor streams, and the ever-growing demand to turn raw data into actionable products. But for many teams, the real bottleneck isn't access to the satellites or sensors. It's the **plumbing**-how data is stored, shared, governed, and reused across groups.

Think about the typical workflow: one team downloads a large archive, extracts a subset for their analysis, and maybe, after some emailing and manual transfers, another team gets access to a derivative copy. Every step introduces duplication, inconsistency, and delays. Instead of focusing on science or application building, researchers and engineers often find themselves reinventing the same infrastructure patterns.

That's where **composable infrastructure** comes in-a way to assemble reusable building blocks instead of starting from scratch every time. In the cloud-native world, these building blocks aren't abstract ideas. They're real, standardized units: providers, controllers, and compositions that can be combined just like Lego bricks.

## From Buckets to Collaboration: A Simple Story

Imagine a team of researchers working in some on-demand cloud workspace. The workspace gives them elastic compute power that integrates seamlessly with their usual tools. When the team spins up their workspace, they also declare a storage claim. Instantly, a dedicated bucket called team-sea-ice is provisioned for them.

This bucket becomes their **sandbox**: a safe space to upload raw satellite imagery, calibration files, and generated data products. They don't have to worry about IAM roles or bucket policies-the system automatically creates the bucket, the IAM user, policies, and all the necessary access credentials. Those credentials are handed back as a Kubernetes Secret in their namespace, ready to be mounted into notebooks, workflows, or analysis pipelines.

But soon, the team discovers something interesting: a subset of their data is relevant to another group working on climate models. Instead of duplicating data manually, they mark their bucket as **discoverable**. With a simple declarative request, the other group asks for access, providing a reason. The first team then grants **ReadOnly** rights, and suddenly the second group has direct, governed access to the same dataset.

Now, reverse the roles: the scientists working on ocean models produce a refined product-for example, a downscaled time series for a region of interest. Instead of keeping it private, they decide to **share it back**. By granting **ReadWrite** permissions to their collaborators in the sea-ice team, they enable them not only to consume the data but also to contribute new observations and validation results.

This creates the foundations of a **data supply chain**: each team enriches the product at their step, and the permission model ensures **clarity, accountability, and traceability**. No endless email threads, no ad-hoc data copies scattered across laptops. Just **in-place sharing**, with access controlled declaratively.

> Side note: Many organizations share data directly through raw storage resources like S3 buckets or large NFS folders. That approach is common and works at small scale. But in most cases, it's worth adding a software layer on top-to provide governance, metadata, and smoother collaboration. That's a story for another blog post, and it's also at the core of what we focus on at
>
> Versioneer
>
> . The key point is that
>
> even higher-level platform concepts still rely on the same fundamental storage and access primitives
>
> described here-they're just building on top of them.

## Why This Matters

This kind of collaboration unlocks three critical capabilities:

1. **Scalability**
   No more manually wrangling terabytes of data. Buckets, policies, and credentials scale automatically with demand, so teams can focus on science instead of infrastructure.
2. **Reproducibility**
   Every request, grant, and permission is captured **declaratively**. This means workflows are auditable, traceable, and trustworthy-ensuring results can be repeated and verified.
3. **Collaboration at Speed**
   Scientists, developers, and analysts can share data products in real time. No waiting for IT tickets or ad-hoc workarounds-just seamless, governed access that accelerates discovery.

These aren't abstract ideals. They're the real pain points in Earth Observation projects-and they're solved by treating infrastructure as composable building blocks.

## The Lego Analogy: Building Blocks All the Way Down

So how do we make this work? Enter [**Crossplane**](https://www.crossplane.io).

Crossplane is the orchestration layer that turns cloud APIs into Kubernetes resources. But the real magic comes from its concept of **compositions**. A composition is like a Lego block built from smaller Lego blocks. Instead of exposing every low-level detail, it packages a set of infrastructure resources into a higher-level abstraction.

> With Crossplane, providers and compositions, we can finally treat infrastructure as Lego.

For example:

- At the **lowest level**, we have individual providers like provider-aws, provider-minio, or provider-otc. Each of them manages the raw building blocks-buckets, IAM or bucket policies, and secrets-based on their platform-specific concepts.
- On **top of these**, we add provider-kubernetes. This acts as the glue layer, binding policies and credentials back into Kubernetes-native resources. It makes them observable and lets us state dependencies.
- And **above all**, we define our provider-storage**composition**. This is the Lego block that users actually interact with. From their perspective, they don't need to think about IAM roles, access policies, or secret wiring. They simply declare a Storage resource-and everything else is provisioned, connected, and exposed automatically:

```yaml
apiVersion: pkg.internal/v1beta1
kind: Storage
metadata:
  name: team-sea-ice
spec:
  buckets:
    - bucketName: bucket-sea-ice
      discoverable: true
```

Buckets, IAM users, and policies are automatically provisioned, and the corresponding access credentials are surfaced as a Kubernetes Secret. This Secret can then be consumed directly or further exposed through additional APIs or user interfaces on top.

The important point is that all of these concepts **manifest inside the Kubernetes cluster itself**. Buckets, access policies, and secrets are not abstract cloud artifacts hidden behind proprietary consoles-they are exposed as **first-class Kubernetes resources**. That means:

- They are accessed and managed through the **standard Kubernetes API layer**, the same way you would handle Pods, Deployments, or Services.
- They become instantly usable with **common Kubernetes tooling** like kubectl, GitOps workflows (Flux, ArgoCD), or CI/CD pipelines.
- They are fully **auditable and observable**: every request, status, and event flows through Kubernetes' reconciliation model and can be logged, traced, or monitored.
- They are **securable** using Kubernetes-native mechanisms like **RBAC**, meaning access to infrastructure resources can be controlled with the same fine-grained policies already used for cluster workloads.
- They are **orchestrated by Crossplane**: compositions define how low-level resources come together into higher-level abstractions, and Crossplane's controllers continuously reconcile the declared state against the actual state in the cloud or storage backend.

In other words, provider-storage takes the complexity of distributed cloud resources and brings them into the same declarative, Kubernetes-native control plane. Infrastructure is no longer a separate world that requires its own scripts and manual steps-it becomes part of the same fabric where applications run, governed by the same APIs and policies.

It's **Lego on top of Lego**: low-level providers build basic blocks, and compositions snap them together into something teams can use immediately.

## Platform Engineering in Action

This is platform engineering at its core. Instead of every team writing Terraform scripts, managing cloud credentials, and debugging IAM policies, we provide a curated set of reusable, versioned building blocks. Teams just claim them, like renting Lego kits.

- Need a new storage bucket? Claim a Storage object.
- Need to collaborate with another group? Add a bucketAccessRequest.
- Want to grant access? Add a bucketAccessGrant.

```yaml
apiVersion: pkg.internal/v1beta1
kind: Storage
metadata:
  name: team-ocean-model
spec:
  buckets:
    - bucketName: ocean-model-private
    - bucketName: ocean-model-shared
      discoverable: true
  bucketAccessRequests:
    - bucketName: bucket-sea-ice
      reason: "Consume sea-ice indices for downstream modeling"
      requestedAt: "2025-10-01T12:07:00Z"
  bucketAccessGrants:
    - bucketName: ocean-model-shared
      grantee: sea-ice
      permission: ReadWrite
      grantedAt: "2025-10-01T12:12:00Z"
```

Everything else-the plumbing, the credentials, the policies-is handled automatically. Interested in learning more? Explore the [Usage & Concepts](https://provider-storage.versioneer.at/latest/how-to-guides/usage_concepts)in the provider-storage documentation.

This approach means Earth Observation platforms such as [EOxHub Workspaces](https://hub.eox.at), developed by our colleagues at EOX, can scale effectively. Every new project, every new team doesn't start from zero. They inherit a reliable, declarative system that lets them focus on science and data, not infrastructure.

![](blog/images/2025-10-01-building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6-2.png)

## Building the Future of EO Collaboration

**The lesson here is simple:** Earth Observation isn't just about satellites or sensors. It's about the supply chain of data products that connects raw data to end users. And that supply chain needs building blocks-reusable, composable, trustworthy.

When the Lego bricks are efficiently orchestrated and stacked correctly-starting with cloud providers at the foundation and building up to high-level compositions such as **Versioneer's offerings** alongside open-source contributions:

- **Storage**-buckets, policies, credentials
- **Data Labs**-reproducible analysis workspaces
- **Registries**-OCI-based data product packaging

...teams gain the freedom to collaborate faster, scale their work, and innovate without being slowed down by infrastructure complexity.

These building blocks aren't just technical choices. They're **strategic enablers**. They make it possible for teams to stop reinventing the wheel and start building the future together. And in Earth Observation, where collaboration and data sharing are the lifeblood of progress, that might just be the biggest breakthrough of all.
