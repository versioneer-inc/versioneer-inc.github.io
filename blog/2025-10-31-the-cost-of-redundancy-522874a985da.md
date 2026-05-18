---
date: 2025-10-31
title: "The Cost of Redundancy"
description: "In the previous blog post, we explored how building a data ecosystem-rather than a single monolithic data platform-creates flexibility, scalability, and resilience. We argued..."
tags: "data-storage, data-redundancy"
image: blog/images/2025-10-31-the-cost-of-redundancy-522874a985da-1.png
origin_url: https://medium.com/@stefan.achtsnit_41940/the-cost-of-redundancy-522874a985da
origin_title: Medium
---

# The Cost of Redundancy
In the [previous blog post](blog.html?post=2025-10-31-towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8), we explored how building a data ecosystem-rather than a single monolithic data platform-creates flexibility, scalability, and resilience. We argued that storage design should start from how data assets are consumed, not merely how they are written. The proposed model consists of distinct layers, each optimized for its specific role within the data lifecycle. We also noted that different usage patterns-from long-term preservation to real-time analysis-demand varying levels of performance, accessibility, and durability guarantees.

Naturally, this raises a pragmatic question:

> If data exists across multiple layers, does that mean we're paying for the same storage several times?

![](blog/images/2025-10-31-the-cost-of-redundancy-522874a985da-1.png)

At first glance, this may seem inefficient. But in reality, **redundancy is not duplication-it's design**. Each layer provides a distinct set of guarantees, and what may appear to be the same data twice-or simply stored in a different format, such as losslessly compressed for archival-in fact reflects different responsibilities within the broader ecosystem.

## Guarantees Come First

Each storage class or layer exists to deliver specific guarantees. Understanding what you pay for-and why-is the foundation of cost-efficient architecture design.

- **Durability**-ensures that data remain intact over time, typically achieved through multiple physical copies or erasure coding across different hardware or regions.
- **Availability**-guarantees that data can be accessed whenever needed, backed by redundant infrastructure and failover mechanisms.
- **Disaster resilience**-protects against full site or zone failures through multi-AZ or multi-region replication, reducing the risk of catastrophic loss.
- **Performance and locality**-keeps data close to compute and ensures low-latency access, relying on premium hardware, caching, and intelligent placement.

Each storage class or layer exists to deliver specific guarantees. Understanding what you pay for is the key to designing cost-efficient architectures.

## Redundancy Is Already Built In

Even a single bucket in most cloud environments is redundant by design. Services such as AWS S3, OTC, or OVHCloud typically store each object across **multiple availability zones**-that is, geographically separated data centers within the same region. You already pay for duplication-it's what ensures durability and availability.

If that level of resilience isn't required, most providers offer **Single-AZ storage** at a lower price. The trade-off is clear: reduced cost means reduced protection. A system failure, maintenance window, or even a rare disaster could make the data temporarily or permanently unavailable.

The [OVHcloud Strasbourg data-centre fire in 2021](https://www.reuters.com/world/blaze-destroys-servers-europes-largest-cloud-services-firm-2021-03-10) remains a sobering example of this risk: an entire facility was destroyed, leading to total data loss for customers who hadn't replicated their content elsewhere.

## Different Layers, Different Guarantees

When designing a multi-layer data ecosystem, we're not duplicating cost-we're aligning storage to purpose.

Archival storage provides long-term durability, immutability, and cost-efficiency. It's optimized for preservation, not performance, and serves as the disaster-resilient backbone of the ecosystem. Because it already safeguards against data loss across regions or storage classes, other tiers can afford to trade redundancy for efficiency.

If temporary unavailability during a data center outage or maintenance window is acceptable, a single-data center setup may be sufficient for the other storage layers.

For on-demand processing, it may even be more cost-effective to re-provision data from other layers when needed rather than maintaining expensive built-in replication. These environments are typically short-lived, and their resilience comes from automation and reproducibility, not redundancy.

No single storage configuration can meet all these goals simultaneously. When comparing offerings, it is essential to read carefully through the provider's price list and the associated capabilities and guarantees-as similar-sounding services can differ significantly in durability, availability, and performance levels.

The ecosystem approach ensures that each layer contributes exactly the right level of **performance, resilience, and cost-efficiency** for its role-together forming a coherent, dependable foundation for **scalable data operations**.

> Paying more doesn't mean paying twice-it means paying for stronger SLAs, faster access, or more resilience.

In such an ecosystem, every layer has a **clear purpose**: you're not paying for the same storage multiple times, but **once for durability, once for performance, and once for compute locality**-each at the most efficient price point.

## The Takeaway

Efficiency doesn't come from minimizing copies; it comes from understanding why each copy exists. Some data will live for decades in immutable form, some will be cached near compute for fast processing, and others will move dynamically between tiers as part of an automated lifecycle.

With good metadata and version tracking, all layers can operate as a single, intelligent system where cost, performance, and reproducibility remain in balance by design.

**Redundancy, in this sense, isn't waste-it's architecture**.
