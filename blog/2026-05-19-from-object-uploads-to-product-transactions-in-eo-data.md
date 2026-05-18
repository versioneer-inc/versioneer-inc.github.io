---
date: 2026-05-19
title: "From Object Uploads to Product Transactions in EO Data"
description: "A narrative summary of our recent ESA and project initiative presentation on product-level transactions, EarthCODE publication gates, lakeFS-style Write-Audit-Publish workflows, and an EOEPCA Data Product Orchestrator building block."
tags: "earth-observation, earthcode, eoepca, lakefs, composable-infrastructure"
image: blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-02.png
---

# From Object Uploads to Product Transactions in EO Data
*A recent ESA and project initiative presentation, expanded into the story behind the Data Product Orchestrator.*

Object storage has enabled much of the current cloud-native shift in Earth Observation. It is cheap enough, durable enough, scalable enough, and familiar enough that almost every EO platform ends up using it somewhere. We should not replace that foundation lightly.

But a bucket full of valid objects is not yet a published data product.

That was the core of a recent presentation we gave to ESA and the wider project team. The talk proposed a Data Product Orchestrator building block for [EOEPCA](https://eoepca.org/), which could become a foundation component for [EarthCODE](https://earthcode.esa.int/) and EarthCODE-connected platforms. But it started from a much smaller observation: the thing users rely on is not the single object. It is the product state.

A product state is the moment where assets, metadata, indexes, validation outputs, policy, provenance, and publication status all agree. Today, we often approximate that state with conventions, careful scripts, and stewardship discipline. The argument of the presentation was that this boundary deserves to become infrastructure.

## 1. The core problem

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-02.png)

The first real slide put the issue plainly: **EO object storage needs product-level commits**.

S3-compatible stores know how to put, get, list, and delete objects. EO products, however, are usually object sets. A Sentinel-derived product may include COGs, STAC Items, a STAC Collection, checksums, a GeoParquet index, QA reports, license information, and access policy. A Zarr-based product may contain thousands or millions of chunks plus metadata that must match those chunks.

For the consumer, the important question is not only "does this object exist?" It is "which complete, validated, governed product version am I seeing?"

That is the missing boundary. We need a product-level transaction around:

- assets
- metadata
- indexes
- validation outputs
- provenance
- policy
- publication state

Without that boundary, publication remains a sequence of object uploads with good intentions around it.

## 2. S3 got better, but commits are still missing

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-03.png)

The next slide was deliberately historical. S3 consistency has improved a lot. Strong read-after-write and list consistency removed many old surprises from cloud-native data work.

That improvement matters. It also does not solve product publication.

Object consistency tells us that an object is visible after it is written. It does not make a multi-object EO update atomic. If a new release changes COG assets, STAC metadata and QA outputs, a reader can still encounter a half-updated product unless something else defines the release boundary.

So the problem moved. It is no longer primarily "will the object appear?" It is "how do we expose the previous valid product or the next valid product, but never the product mid-switch?"

## 3. COG and STAC already use a soft transaction

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-04.png)

COG and STAC workflows already show how producers solve this informally.

The common pattern is:

- write assets into object storage
- verify that the assets are complete and valid
- publish or update STAC Items, Collections, or GeoParquet
- let consumers discover the product through the catalog boundary

This is sensible. The discovery layer becomes the soft transaction: do not advertise the product until the objects behind it are ready.

But it is still a convention. The object store does not know that a STAC update is the publication step. It does not know whether QA passed, whether the license is correct, whether this version supersedes a previous one, or whether a steward approved the transition to public.

That discipline works until the workflow becomes federated, automated, or repeated by many teams. Then conventions need to turn into a contract.

## 4. Zarr makes the contract visible

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-05.png)

Zarr makes the multi-object nature of EO products impossible to ignore.

A Zarr store is not a single file. It is a structured set of chunks and metadata. The chunks are separate objects. The metadata tells readers what those chunks mean. Consolidated metadata often acts as the final object that makes a version readable.

That means timing matters. If metadata and chunks do not describe the same state, the store may be technically present and still wrong for readers.

The slide used monthly vegetation signals as the example, but the point is general. Array-native EO products need a coherent publication state. Naming conventions and "write metadata last" are useful, but they are not enough as the shared system boundary.

## 5. Rechunking is not just copying

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-06.png)

Rechunking makes the version problem sharper.

The same data may need different physical layouts for different uses. A raster-oriented layout may be best for map-like access. A layout organized for object or parcel time series may be better for agricultural monitoring, infrastructure analysis, or repeated regional analytics.

Moving between those layouts is not just a bulk copy:

- unchanged data should be reused
- new chunks may be created
- indexes must be updated
- metadata must describe the new layout
- consumers should not see the product mid-switch

So rechunking is a product version event. It changes the published state of the product. If we treat it only as a folder transformation, we lose the part that matters most for consumers: the moment when one coherent representation becomes another.

## 6. EarthCODE adds governance to publication

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-07.png)

The EarthCODE part of the presentation changed the language from storage mechanics to governance.

In EarthCODE, a product may move through states like candidate, validation, publication-ready, and public. Along the way there may be metadata review, validation, licensing decisions, embargo handling, access policy, stewardship approval, and eventually PRR handover (Project Results Repository for ESA-guaranteed long-term archival).

That is why the Data Product Orchestrator is not a nicer upload screen. It is a lifecycle layer.

This is already visible in the working EarthCODE demonstrator. The next step is to turn it into one logical access and governance layer across multiple storages, with staged -> committed -> published transitions, product-level policies, tracked state, and eventually automated PRR handover.

In other words: publication is a governance step, not merely the moment when bytes arrive.

## 7. The operating pattern is Write-Audit-Publish

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-08.png)

For this, an already established operating pattern is useful:

**Write. Audit. Publish.**

Write in an isolated area. Audit the proposed product state. Publish only after the assets, metadata, indexes, QA, and policy are coherent.

This gives producers room to work without exposing intermediate states. It gives reviewers and stewards something concrete to inspect. It gives consumers a stable published version. It also fits the lifecycle language EarthCODE already needs: candidate is not public, validation is not publication, and publication-ready is still not the same as published.

The important thing is that Write-Audit-Publish is not a new ceremony. It is the operational shape that many good teams already follow. The proposal is to make it reliable and reusable.

## 8. lakeFS gives us a generic WAP substrate

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-09.png)

The next slide introduced lakeFS as a concrete way to implement Write-Audit-Publish on top of object storage.

lakeFS gives us branches, commits, diffs, merges, and S3-compatible access while keeping object storage as the data plane. For EO products, that maps neatly to the publication problem:

- write product changes on a branch
- validate and inspect that branch
- compare it to the published state
- merge when the product is approved

The merge becomes the product-level commit. It is the controlled moment where the new product state becomes visible.

This matters because it avoids a false choice. We do not have to abandon object storage or move EO products into a monolithic database. The large assets stay in object storage. The version and transaction semantics sit above it. Unchanged objects can be reused, which is essential for evolving datasets.

## 9. Choose the abstraction at the product boundary

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-10.png)

The architecture slide made a short excursus into Icechunk, because it has become popular in the more heavily Earth-science-oriented expert community.

Icechunk is a strong and interesting option for Zarr-first workflows. For gridded, chunked array data, a Zarr-specific transaction layer can be exactly the right abstraction.

EarthCODE and EOEPCA, however, need to cover broader EO product shapes:

- COGs
- SAFE-like structures
- STAC JSON
- STAC GeoParquet
- Zarr stores
- QA outputs
- provenance
- licenses
- operational indexes

So the question is not "which tool wins?" The question is "what is the product boundary?"

For heterogeneous EO products, lakeFS is a useful generic substrate. For deeply Zarr-native products, Icechunk may be the right specialized tool. A good Data Product Orchestrator should allow that honesty instead of pretending one storage abstraction solves every case.

## 10. The EO profile sits on top

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-11.png)

lakeFS gives generic transactions. EOEPCA and EarthCODE still need EO semantics.

That is the role of an EO profile on top:

- product validation
- EO-aware actions and hooks
- product-level authorization
- access instrumentation
- a product state model
- a client library for producer workflows

The goal is not to make every EO user think in lakeFS internals. The goal is to make the right workflow easy: create or reuse a product workspace, write assets and metadata, run validation, request promotion, and publish through a controlled state transition.

Consumers should still get the familiar surfaces they expect: S3-style access, HTTP-style access, STAC and GeoParquet discovery, and stable published states.

This is where Versioneer's composable infrastructure work matters. We already care about making storage, credentials, lifecycle policy, registries, and workspaces reusable as building blocks. Product transactions are the data-side counterpart: the reusable state boundary for the products flowing through those building blocks.

## 11. A product needs a concrete shape

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-12.png)

The concrete product slide made the proposal tangible. The exact paths are less important than the contract: assets, metadata, indexes, QA, OSC-facing material, and product state all live inside one transaction boundary.

Around that boundary we can attach useful behavior:

- commit hooks validate product structure
- promotion checks enforce lifecycle rules
- an authorization layer applies product-level policy
- a client transaction context helps producers write safely
- state transitions make the lifecycle inspectable
- publication happens as one controlled transition

That is the difference between a bucket layout and a product model. The bucket layout stores files. The product model tells the system what those files mean together.

## 12. Versions should reuse unchanged content

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-13.png)

The versioning slide addressed the practical fear behind any product-versioning conversation: copies.

EO products are large. If every product version requires a full copy, versioning quickly becomes expensive and operationally unattractive.

But many product changes are small compared to the full product volume. A license fix, QA correction, metadata improvement, partial update, or revised index should not duplicate every unchanged asset.

As a supporting example from a related EarthCODE discussion, we looked at the DeepESDL platform, where multiple versions of ESDC ([Earth System Data Cubes](https://earthsystemdatalab.net/)) were produced. The concrete case was the ESDC v3.0.0 to v3.0.1 update: two published Zarr views, each exposed as 83,172 objects, with almost identical total size, 71.746 GiB for v3.0.0 and 71.754 GiB for v3.0.1.

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-esdc-version-comparison.png)

The interesting part is that only 19 of 42 ESDC variables changed between the two versions. A full copy would treat the whole product as new. A product transaction can instead publish a new product state while reusing the unchanged content. That is exactly where object-level reuse and product-level versioning belong together.

A version should not be a folder name. It should be a committed product state that can be compared, audited, reproduced, and served.

## 13. The technical argument in one view

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-14.png)

The summary slide is where the argument stops being about individual formats and becomes an architectural statement.

COGs, STAC, Zarr, rechunking, EarthCODE publication gates, lakeFS, and Icechunk all point at the same pressure point from different directions: EO products need a reliable moment of truth. Not a hopeful folder state. Not a catalog update that happens to be last. Not a spreadsheet saying that publication is done. A product state that can be written, checked, compared, approved, published, and later explained.

That is why the Data Product Orchestrator belongs in the EOEPCA building block conversation. It gives the community a shared name and shape for something many platforms already need: a product transaction layer over object storage. EarthCODE gives the governance pressure, lakeFS gives a broad transactional foundation, and the EO profile adds the domain semantics that make this useful for real providers and consumers.

The point is not to make storage more complicated. The point is to make publication less fragile.

## 14. The strategy behind this

![](blog/images/2026-05-19-from-object-uploads-to-product-transactions-in-eo-data-slide-15.png)

Our broader strategy at Versioneer is the same one we have been circling from different angles in recent posts.

In [EO's real processing problem](blog.html?post=2026-01-28-earth-observation-has-a-processing-problem-but-not-the-one-we-think-5deefe3ae47e), the argument was that compute is no longer the main bottleneck. The hard part is coordination, state, reproducibility, and productization. Faster processing helps, but operational trust comes from knowing which inputs, workflow, validation, and product state produced a result.

In [the composable infrastructure post](blog.html?post=2025-10-01-building-data-supply-chains-with-lego-bricks-why-earth-observation-needs-composable-infrastructure-38600b920bb6), the argument was that EO teams should not rebuild storage, credentials, policies, registries, and workspaces for every project. Those capabilities should become reusable building blocks with clear contracts.

In the newer [composable governance post](blog.html?post=2026-05-17-from-lego-bricks-to-composable-governance-why-agentic-data-platforms-need-a-resource-model-8871e7b1f036), that idea moved one level higher: a platform capability should not only be an API call. It should have desired state, observed state, policy, status, audit, and reconciliation around it. Governance becomes something the platform can reason about, not something hidden in scripts and exception lists.

The Data Product Orchestrator is the same strategy applied to publication. A data product should become a governed lifecycle object, not just a directory convention. It should have a state, a transaction boundary, validation rules, access policy, history, and a path to preservation. Data can stay at a trusted origin, be indexed in place, or be copied when needed, but the publication decision should be explicit and inspectable.

This is what we want to contribute back through EarthCODE and EOEPCA: not another project-specific service, but a reusable product publication pattern. lakeFS gives us a strong open foundation for object-store transactions. The EO profile, lifecycle model, APIs or CRDs, controllers, examples, and documentation are where the EO-specific value belongs.

If we get that right, platforms do not need to choose between raw buckets and custom black boxes. They get composable product infrastructure: durable object storage underneath, product transactions at the publication boundary, governance around the lifecycle, and enough shared semantics that other teams can inspect, deploy, extend, and trust the result.

That is the real journey from object uploads to product transactions.
