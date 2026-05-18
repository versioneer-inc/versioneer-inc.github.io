---
date: 2025-10-31
title: "Towards a Pragmatic Storage Ecosystem for Earth Sciences"
description: "At Versioneer, we share a single vision: to make it effortless for teams to publish, discover, and use each other's data. Such an ecosystem should feel like a true commodity:..."
tags: "data-versioning, composable-infrastructure, cloud-workspace"
image: blog/images/2025-10-31-towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8-1.png
origin_url: https://medium.com/@stefan.achtsnit_41940/towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8
origin_title: Medium
---

# Towards a Pragmatic Storage Ecosystem for Earth Sciences
At [Versioneer](https://versioneer.at), we share a single vision: to make it effortless for teams to publish, discover, and use each other's data.

Such an ecosystem should feel like a true commodity:

- Provisioning is self-service and policy-driven, so getting started takes minutes, not weeks-with [storage](https://versioneer-tech.github.io/provider-storage), [compute](https://provider-datalab.versioneer.at) [workspaces](https://github.com/EOEPCA/workspace), access controls and catalog registries are automatically provisioned and pre-wired, making the system easy to operate, safe to use, and ready to scale-if needed across clouds.
- Producers can [ship](blog.html?post=2025-07-16-standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d) well-described, versioned datasets; consumers can easily find, [preview](https://github.com/versioneer-tech/package-r), and integrate them-allowing everyone to focus on creating value rather than fighting infrastructure.
- Governance is built in, not bolted on, ensuring trust, traceability, and compliance by design.

![](blog/images/2025-10-31-towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8-1.png)

The world's system and software engineers have already done a remarkable job delivering the low-level tooling for large-scale data access and transformation. Infrastructure can now be abstracted and automated like never before. What remains challenging, however, is the **plumbing**-how all these components are stitched together into something that feels cohesive, consistent, and easy to use.

This is where Versioneer supports the journey-by building [composable infrastructure](blog.html?post=2025-10-01-building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6) that blends data-engineering expertise with platform-engineering practices to enable what we call a **pragmatic data mesh**. We don't claim to have a silver-bullet solution, but through our [open-source tooling](https://github.com/versioneer-tech) and professional services, we try to help organizations of all kinds-from enterprise departments to cross-project collaborations and open research initiatives-create shared, governed environments where data can flow freely and meaningfully between teams working toward common goals.

## The Context: Research Domains and Their Complexity

The domains we typically operate in with our partners-such as [EOX](https://eox.at)and others in the Earth sciences-share two defining characteristics.

- First, they are **research-oriented**, where the primary goal is to publish and share ideas in a FAIR (Findable, Accessible, Interoperable, Reusable) way-often without knowing exactly how or by whom the data will be used. This already contrasts with the common notion of a [data product](https://martinfowler.com/articles/data-mesh-principles.html?utm_source=chatgpt.com#DataAsAProduct), which assumes a clearly defined consumer or business outcome.
- Second, the data itself is **complex and heterogeneous**. It is rarely tabular or uniform; instead, it combines structured and unstructured components, legacy formats, domain-specific software, and diverse computational environments.

In such contexts, the goal is not to chase a mythical next-generation storage system but to **combine and orchestrate existing technologies** so that they collectively serve a broad and diverse community-from global archives to small research teams. The real task is not to reinvent storage, but to align it with how scientists and engineers actually work and how data is supposed to be used.

> Storage design should begin with how data are consumed, not how they are written.

## From Formats to Access Patterns

Across Earth observation and modelling domains, a few recurring usage patterns appear consistently:

![](blog/images/2025-10-31-towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8-2.png)

1. Archival storage provides long-term durability and efficient push/pull access. It forms the immutable foundation for provenance, reproducibility, and reliable reprocessing.

2. Visualization encompasses both static and dynamic display. Simple map or image previews rely on range-readable formats such as Cloud-Optimized GeoTIFF (COG), while interactive visualization-involving filtering, temporal slicing, or layer composition-benefits from columnar or chunked layouts such as GeoParquet or Zarr.

3. Exploration and analysis take place in interactive environments such as notebooks or workspaces, where users control parallelism, thread counts, and caching. This pattern emphasizes direct, flexible access and responsiveness to user-driven queries.

4. Processing and preparation cover the repetitive and automated workloads-from training and inference to staging and subset creation. These workflows benefit from predictable chunk keys, co-located caches, and efficient materialization of filtered or regional subsets close to compute, often as temporary or shareable "views."

> Different usage patterns demand different performance and durability guarantees.

These categories are not technology choices but **behavioral contracts between users and storage**.The challenge is to support all of them without fragmenting infrastructure or enforcing disruptive conversions.

## Object Storage as the Common Ground

> Object storage is unchallenged as the common commodity layer, with many mature and reliable offerings across clouds and on-premise platforms. Choose the best balance between cost and guarantees, keeping infrastructure simple and immutable while allowing downstream systems to evolve and optimize dynamically.

Object storage has quietly become the universal substrate across clouds and institutions. It scales elastically, handles immutability by design, and already provides fairness and reliability at global scale.

This principle was already well articulated years ago in "[A Step-by-Step Guide to Building a Big Data Portal](https://medium.com/pangeo/step-by-step-guide-to-building-a-big-data-portal-e262af1c2977)"-and it remains entirely true today:
"Put your data in cloud object storage, make it self-describing, and you essentially have your portal."

Initiatives like [Source Cooperative](https://source.coop) demonstrate how this foundation can be used pragmatically: datasets remain in the formats chosen by their providers and are exposed via standard HTTP or S3 endpoints.

This approach treats object storage as the **lowest common denominator**-the point of stability where different communities meet. Higher-level services, catalogs, and visualization layers sit on top but never interfere with the raw data path. Contributors are guided toward best practices, not forced into conversions. Innovation can then happen independently on both sides: producers keep their pipelines, and consumers develop new ways of accessing the same bytes.

## Virtualization Instead of Conversion

> Support users in creating FAIR data through education, tooling, and stewardship guidance-but remain pragmatic about what can ultimately be delivered. Emphasize progress over perfection. By adding virtualized access later, long-term flexibility and interoperability can be maintained, even as technologies and formats evolve.

A growing family of tools demonstrates how to adapt to existing data rather than replace it. Kerchunk and VirtualZarr turn traditional NetCDF or HDF5 archives into virtual Zarr-like structures by mapping byte ranges through lightweight reference files.

For the user, the dataset behaves like a cloud-native array-fully chunked and parallelizable-yet the data never move. These technologies matter because most Earth science data will remain in older formats for a long time. They shift transformation to the **consumer side**: notebooks, visualization services, or analysis platforms virtualize data on demand, using the same storage underneath.

This keeps infrastructure simple and immutable while allowing downstream systems to optimize dynamically.

## Optimization Within, Not Across, Formats

> Each format is only ever optimal for specific consumption patterns. A layout tuned for time-series analysis may perform poorly for visualization or machine learning. Accept these trade-offs and adhere to open standards without altering the original data for data sharing.

Every format has its own internal tuning knobs-chunk size, compression codec, column-group size, pyramid structure, and more. Within each domain, those can be tuned carefully to match usage patterns: Zarr chunk dimensions to expected slicing, GeoParquet row groups to filter operations, COG overviews to zoom levels.

But there will never be a single perfect configuration for all workloads. Each format can only ever be great for a specific **consumption pattern**. A dataset optimized for notebook analysis might perform poorly for dynamic visualization or model training. Accepting those trade-offs is central to the pragmatic approach: tune locally, design globally.

## Versioning Beyond the Format

> Embrace the natural evolution of data with the right tooling while remaining cost-aware: preserve immutability, and when updates occur, store only the modified objects instead of duplicating entire datasets.

Data products naturally evolve-through new corrections, reprocessings, or the incorporation of timelier inputs. Some modern formats, such as Zarr, are beginning to experiment with built-in versioning models; for instance, [Icechunk](http://icechunk.io)introduces Git-like commits and branching directly within array stores. While powerful, these mechanisms remain limited to their respective ecosystems. The broader challenge of lineage and reproducibility extends across all formats-from TIFF and Parquet to NetCDF.

A metadata-level versioning layer, independent of any specific storage or format, can bridge this gap. By maintaining digests, manifests, and relationships, it provides transparent provenance across datasets and transformations. Excellent tooling for versioning structured and unstructured data exists-from [DVC](https://dvc.org) and [Git-Annex](https://git-annex.branchable.com) to [LakeFS](https://lakefs.io). Combined with **immutable**object storage, these approaches form a reproducible substrate for scientific collaboration.

## Openness, Fairness, and Responsible Use

> A sustainable data ecosystem maintains openness and fairness by enabling effortless exploration, isolating intensive workloads to dedicated environments, and replacing rigid access limits with a culture of transparent, cost-conscious accountability.

A healthy data ecosystem must balance open access with fair use. Users should be encouraged to explore data directly-listing, inspecting, and sampling through standard streaming interfaces-without being forced to download gigabytes of data upfront. Yet shared access inevitably introduces the familiar noisy-neighbor problem: a single over-enthusiastic user running large parallel downloads can degrade service for everyone else.

The solution lies in segmentation by purpose. Lightweight, exploratory access should remain frictionless, while sustained, high-volume processing is redirected to dedicated environments-cloud workspaces, institutional HPC clusters, or staging areas with caching and replication.

Fairness then becomes a matter of policy and economics, not restriction. Cloud providers already distribute load globally and charge transparently for usage; scientific infrastructures can follow the same principle. By **simplifying the provisioning** of storage and compute environments-enabling them to spin up on demand and shut down automatically when idle-platforms can foster openness by default while making costs or quotas visible to those who consume resources most heavily.

The challenge thus shifts from performance contention to **cost awareness**-from throttling curiosity to encouraging responsibility.

## Closing Thought

The future of Earth science data handling will not be defined by a single new format or platform, but by the ability to combine the best of what already exists. To meet diverse consumption patterns, we at Versioneer believe in**building a storage ecosystem** rather than a monolith-one that can evolve alongside the community it serves.

![](blog/images/2025-10-31-towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8-3.png)

**Update:** For a reflection on cost considerations within the storage ecosystem, see [this follow-up post](blog.html?post=2025-10-31-the-cost-of-redundancy-522874a985da).

Within each format, optimization will continue, but real progress lies in connecting these approaches coherently: ensuring that archives remain trustworthy, visualizations stay responsive, analyses scale gracefully, and everyone-from students to researchers-can participate on equal terms.

Our mission is not to reinvent storage, but to make it work together for the long tail of science-through a pragmatic approach that delivers on the true promise of a data mesh: making data collaboration seamless, reproducible, and scalable.
