---
date: 2025-07-16
title: "Standardizing the EO Data Supply Chain: Enabling Reproducible Data Collaboration at Scale"
description: "As reliance on Earth Observation (EO) data intensifies-spanning sectors from agricultural insurance to climate monitoring and emergency response-the reliability and..."
tags: "data-packaging, supply-chain-data, open-container-initiative"
image: blog/images/2025-07-16-standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d-1.jpeg
origin_url: https://medium.com/@stefan.achtsnit_41940/standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d
origin_title: Medium
---

# Standardizing the EO Data Supply Chain: Enabling Reproducible Data Collaboration at Scale

![](blog/images/2025-07-16-standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d-1.jpeg)

As reliance on Earth Observation (EO) data intensifies-spanning sectors from agricultural insurance to climate monitoring and emergency response-the reliability and reproducibility of data access have become more critical than ever. As EO data pipelines grow in complexity and significance, the challenge extends beyond simple storage: how can it be ensured that data reaches its consumers in a state they can trust, reuse, and act upon?

> Reproducible Data Collaboration is the defining challenge of the EO data supply chain.

Much like its industrial namesake, a data supply chain encompasses every stage a dataset moves through-from raw ingestion, calibration, fusion, and annotation to packaging, versioning, and delivery. The goal is to ensure that by the time a dataset arrives at its point of use-whether that's a human analyst, a machine learning model, or an application running on an edge device-it is not just accessible, but fully reproducible, context-rich, and verifiably complete.

## The File-Based Legacy

Across much of the broader Earth data ecosystem-including but not limited to Earth Observation (EO)-data sharing is still dominated by a file-based mindset. This includes not only EO datasets like satellite imagery or land cover classifications, but also meteorological and environmental datasets such as wind fields, temperature grids, and atmospheric reanalysis products. Widely used formats like NetCDF and GRIB, often used for gridded environmental and meteorological time series, are passed around as individual files via FTP, object storage, shared folders, or presigned links. This model has clear advantages: it's intuitive, compatible with legacy tools, and deeply ingrained in scientific and operational workflows. But as Earth data scales in volume, variety, and strategic importance, this approach begins to falter. What it lacks is structure: not just in how data is described, but in how it is versioned, grouped, delivered, and verified-within and across organizational boundaries.

## Discovery Isn't Delivery

Recognizing this, the community has already begun to move toward more structured approaches. One of the most impactful developments in recent years has been the rise of the [SpatioTemporal Asset Catalog](https://stacspec.org) (STAC)-a specification for describing EO datasets in a standardized, JSON-based format. STAC catalogs, collections, and items provide a machine- and human-readable way to represent data holdings, enabling clients to search by time, space, or metadata and resolve assets through href links. With STAC, data providers can expose rich, navigable catalogs instead of ad hoc folders, and clients can explore these catalogs to find the data they need.

STAC also complements other domain-specific conventions such as the Climate and Forecast (CF) metadata conventions used in NetCDF, enabling multi-disciplinary interoperability. Together, these frameworks enable more precise, machine-readable descriptions of datasets that span remote sensing, meteorology, and environmental science.

This was-and remains-a major milestone. STAC decouples metadata from storage and aligns the EO world with web-native discovery practices. But STAC alone doesn't define how datasets are packaged, delivered, or verified. Each STAC Item may point to multiple assets, but there is no guarantee that those assets arrive together, unchanged, or in a form ready for downstream use. What STAC solves is discovery; what remains is to solve delivery, integrity, and packaging.

## Two Emerging Paths: Structured Access vs Reproducible Packaging

While many EO tools and users still think in terms of files-save, load, inspect-the underlying nature of data has changed. Formats like Zarr, partitioned Parquet, and chunked NetCDF organize data across many files, folders, or object keys. These are not monolithic blobs but logical datasets: collections whose structure matters just as much as their content. For example, a Zarr store consists of binary chunk files organized in a folder tree, with JSON metadata files describing array shapes, data types, and chunking. Partitioned [GeoParquet](https://geoparquet.org) datasets use directory paths to encode attributes like year, region, or product type, and open table formats such as [Apache Iceberg](https://iceberg.apache.org) are emerging as preferred backends for Parquet datasets-offering transactional semantics, scalable metadata handling, and support for dynamic, appendable datasets.

The relevance of this topic is underscored by efforts at major public agencies. ESA's [Earth Observation Processor Framework](https://eopf.copernicus.eu) (EOPF) for CSC Data Processors Re-engineering efforts is enabling interoperable distribution of analysis-ready Copernicus Sentinel datasets- offering harmonized processing pipelines, metadata via STAC, and output in cloud-native formats such as Zarr. Meanwhile, NASA's [EOSDIS system](https://www.earthdata.nasa.gov/about/esdis/eosdis)-including its network of DAACs and the Common Metadata Repository (CMR)-continues to evolve in support of standardized discovery and access to large EO data holdings. These initiatives emphasize transparency and reproducibility, often shaped by strong community input and shared concerns: how to structure and describe folder-based data, how to bundle and compress it, where to locate metadata such as STAC Items, and whether flat or nested layouts are more effective for cloud-native workflows. At the same time, they must balance the long-term sustainability goals of archival systems with the need to deliver data that is as fresh and as fast as possible.

This is where the split becomes clear. Different workflows require different relationships with data:

- For interactive exploration and analytics, sophisticated data access strategies and storage systems have continued to evolve-from domain specific client-side tooling such as GDAL (with Cloud-Optimized GeoTIFF support) to cross domain fsspec-based analytics stacks and embedded engines like [DuckDB](https://duckdb.org) (with its spatial extension), all of which can be orchestrated within large-scale processing frameworks like Apache Spark and Dask or full-featured spatial backends such as Apache Sedona and TileDB. Together, they enable fast, queryable, mutable, and fine-grained access to dynamic datasets. Drawing on decades of database, HPC, and cloud-native innovation, many domains are now converging toward shared conventions for large-scale spatial and temporal data access.
- In contrast, downstream workflows such as machine learning, regulatory audits, offline validation, or on-device inference require more than just access to data-they demand reproducible packaging. This means datasets must be versioned, portable, self-contained, and verifiably complete, so they can be reused without relying on external systems or reinterpreting metadata. Several packaging standards address these needs. [BagIt](https://en.wikipedia.org/wiki/BagIt) ensures data integrity through directory-based manifests and checksums and is widely used in digital preservation. [RO-Crate](https://www.researchobject.org/ro-crate), often published via RoHub, wraps data and metadata in a JSON-LD format, supporting provenance and FAIR principles. The broader [Research Object model](https://www.researchobject.org/initiative/research-object-model) captures full analysis context, including code and workflows. Other solutions exist, especially for tabular data, but they have remained confined to specific domains without gaining wider adoption.

Support for both modes demands fundamentally different mechanisms. While access technologies have matured through collaborative efforts across disciplines, packaging remains fragmented, lacking a common foundation. Within this gap, a compelling opportunity has emerged for the Earth data community to adopt standardized, cross-domain packaging practices.

## What OCI Could Offer

The [Open Container Initiative](https://opencontainers.org) (OCI), best known for its role in standardizing Docker images, provides exactly the kind of model needed for structured, reproducible delivery. An OCI artifact consists of compressed layers of content, a config blob with structured metadata, and a manifest that links everything together. These artifacts can be pushed and pulled from registries like Docker Hub, AWS ECR, Quay.io, or Harbor-part of a vast and mature ecosystem that already powers the global software supply chain. The ability to reuse these ubiquitous registries and client tools across domains significantly lowers the barrier to adoption.

Notably, OCI registries can act as access gateways, enforcing access control at the artifact level without requiring direct exposure of underlying storage backends (e.g., S3, GCS, Azure Blob, NFS, Ceph, IPFS). OCI also provides support for content-addressable storage, layered packaging, deduplication, cryptographic attestation, and version control-all of which align closely with Earth data distribution needs.

In the EO context, OCI artifacts can encapsulate not only the data but also its organization, versioning, and lineage. Each artifact may contain STAC metadata in the config, sensor-specific folders as layers, and annotations or derived products linked via OCI referrers. Importantly, a docker pull or oras pull is not merely a download-it is a registry-to-runtime synchronization of a complete, content-addressable, verifiable data package.

This framing is further strengthened by recent advancements in the OCI 1.1 specification. OCI 1.1 formally introduces the concept of non-container artifacts-such as datasets, models, or configuration bundles-as first-class citizens within OCI registries. It extends the OCI Image Specification to support fully flexible media types, enabling domain-specific communities to standardize around meaningful conventions without altering the core registry mechanics.

## The Structure of an OCI Artifact

The OCI specification comprises three core components:

- **Image Specification**-Defines the structure of artifacts and their metadata.
- **Distribution Specification**-Governs the protocol for pushing and retrieving artifacts from registries.
- **Runtime Specification**-Describes how artifacts are executed; this is less relevant in the context of data packaging.

Each OCI artifact consists of:

- **Config Blob**-In EO contexts, this can hold structured metadata such as spatial extent, temporal coverage, data lineage, or sensor type.
- **Layers**-The actual data payloads, stored as compressed binary blobs and addressed via cryptographic hashes. Layers may be organized by space, time, modality, or processing level.
- **Manifest**-The linking structure that ties together the config and layers. It specifies digests, media types, and ordering.

![](blog/images/2025-07-16-standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d-2.png)
_OCI artifacts example_

Artifacts can be published, discovered, pulled, and verified using standard tools such as the ORAS CLI, Docker, or compatible SDKs. This introduces a robust, interoperable mechanism for data delivery-supporting structured metadata, referrers, artifact linking, and layered reuse to promote modularity and efficiency.

## Comparing Delivery Patterns

While the technical structure of OCI artifacts addresses the challenge of reproducible packaging, real-world data sharing rarely happens in isolation. It is shaped by organizational constraints, access policies, deployment topologies, and human workflows. In other words, packaging alone is not enough-it must align with how datasets are actually shared and consumed across teams and systems.

Four dominant sharing models can currently be identified:

- **Direct team-based access**-Data is made available through shared storage within a trusted environment, such as mounted network drives or shared object storage buckets.
- **Presigned URLs**-Temporary, expiring links are issued to allow time-limited access to specific files or folders, without exposing broader storage permissions.
- **Peer-to-peer staging**-The consumer sets up their own storage space like a bucket, and the provider delivers data by copying or syncing files into it, typically using a loose folder structure.
- **Scoped credential delegation**-Access is granted through temporary, limited-scope credentials, often using mechanisms like AWS STS or OAuth2-based delegation flows.

OCI-based packaging can be viewed as a structured enhancement of peer-to-peer staging. When you request an OCI artifact from a registry, the process resembles a "push" from that OCI registry into your (local or remote) OCI runtime-a controlled, versioned, and verifiable transfer that replaces the loosely defined copy-and-paste semantics of traditional file sharing.

## Evaluation in Practice

To evaluate this approach, we applied OCI packaging to the Panoptic Agricultural Satellite Time Series (PASTIS) [benchmark dataset](https://github.com/VSainteuf/pastis-benchmark), which integrates Sentinel-1 radar, Sentinel-2 optical, SPOT very high-resolution (VHR) imagery, and semantic labels.

![](blog/images/2025-07-16-standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d-3.png)
_Structure of the PASTIS benchmark dataset_

Two intentionally contrasting partitioning strategies were explored:

- **PASTIS-2433**: The dataset was split into 2,433 per-patch subsets. Each patch was packaged into a separate TAR archive and added as an individual layer in a single OCI artifact. This resulted in an artifact with 2,433 layers, each approximately 30-35 MB in size. Metadata for each patch was embedded in the config blob.
- **PASTIS-t4**: The dataset was partitioned into four large, tile-based subsets, each covering a distinct spatial region. Each tile was packaged as a separate TAR-based layer within the artifact, with each layer approximately 15-20 GB in size. Tile-level metadata was recorded in the config blob.

The benchmark results, initial setup instructions, and partitioning scripts have been made publicly available via the [Versioneer research site](https://research.versioneer.at/paper-oci-supply-chain).

We published these artifacts to multiple OCI-compatible registries and confirmed that, even under realistic conditions, they could be reliably pushed, pulled, deduplicated, and inspected using standard OCI tooling. Large layers (20 GB and above) were accepted without issue. Thousands of small layers were handled efficiently. Metadata annotations remained intact, and content integrity was successfully verified.

![](blog/images/2025-07-16-standardizing-the-eo-data-supply-chain-enabling-reproducible-data-collaboration-at-scale-78c83fe81c3d-4.png)
_Results from OCI Experiments_

These experiments demonstrate that OCI-based packaging can accommodate both fine-grained and coarse-grained partitioning strategies. Importantly, integrity checks, digest validation, and artifact-level attestations were all supported and reproducible-capabilities that are essential in workflows where trust, traceability, and regulatory compliance are required.

## From Files to Packages

These findings resonate with a broader trend across the data ecosystem:

> There is an increasing demand for materialized and curated datasets-well-defined, harmonized data packages that are immediately usable for downstream analysis or model training.

Platforms like [Hugging Face Datasets](https://huggingface.co) have demonstrated the effectiveness of this paradigm by offering versioned datasets with structured metadata and reproducibility guarantees. Domain-specific initiatives like the [Earth Observation Training Data Lab](https://eotdl.com) (EOTDL) are now emerging to bring similar capabilities to the EO community.

The proposed approach leveraging OCI artifacts for packaging doesn't replace files. It wraps them. It augments them. It provides a framework for delivery, provenance, and collaboration. It respects the legacy of file-based workflows while enabling the structure and integrity that the EO data supply chain increasingly demands.

With OCI artifacts, a standard, portable, and verifiable method exists to distribute EO datasets across domains, workflows, and infrastructures. When combined with metadata discovery via STAC and delivered through existing tooling, data is not just discoverable, but also distributable and reproducible in its delivery.

As the OCI ecosystem continues to evolve, new tooling-ranging from general-purpose clients like [ORAS](https://oras.land) and Docker to domain-specific interfaces-will become increasingly relevant for Earth Observation workflows. At the same time, community-driven efforts to formalize metadata conventions, annotation keys, and media types will be essential to ensure semantic interoperability across domains. The machine learning community is already advancing similar OCI-based standards for model packaging, reflecting a broader shift toward reproducible, domain-aware artifact ecosystems.

Looking further ahead, the foundational principles of OCI-layered storage, content-addressable integrity, and manifest-based composition-position registries to become more than distribution endpoints. With support for partial access via HTTP range requests, and growing adoption of formats like GeoParquet, Zarr, and Cloud-Optimized GeoTIFF, OCI-based infrastructure could serve as a general-purpose, versioned storage backend for dynamic, queryable data assets.

This shift opens the door to building future-ready data supply chains-where structured metadata, reproducible packaging, and scalable access converge to support transparent, trusted, and efficient Earth data collaboration at scale.
