---
date: 2026-06-28
title: "Before the Code, Before the Portal"
description: "How packageR helps EO teams inspect, share, and publish workspace data where it already lives."
tags: "earth-observation, cloud-native-data, data-access, stac, package-r, datalab, eoxhub, eodash"
image: blog/images/2026-06-28-package-r-authenticated-image-preview.png
---

# Before the Code, Before the Portal

_How packageR helps EO teams inspect, share, and publish workspace data where it already lives._

Earth observation teams should not have to download a directory just to find out what is inside it.

They should not have to write Python only to check whether a generated GeoTIFF looks right. They should not have to build a custom portal only to show a few output files. And they should not need broad bucket credentials just to connect a dashboard to one useful result.

This is a common gap in EO workflows.

The data is already in object storage. The processing job has finished. The workspace contains the expected files. But the next question is still practical: what is here, what looks useful, what can be shared, and what is ready to move toward publication?

A bucket can store EO data. It cannot, by itself, make that data easy to inspect, share, or reuse.

That is where [packageR](https://package-r.versioneer.at/latest/) fits.

packageR is a browser-based first-look and sharing layer for object-storage-backed workspace data. It helps users browse folders, inspect files, preview supported assets, create scoped shares, expose public outputs, and connect selected results to catalog workflows.

The main idea is simple: do not turn every small data question into code, downloads, or a new portal.

This is the first article in a series on Versioneer platform tooling for Earth science data lifecycles. We start with packageR because many lifecycles begin with a simple question: what is in this workspace, and can it be inspected or shared safely?

## Use case 1: check the output after a processing run

Imagine an EO team has just run a flood mapping, snow cover, burn scar, or land surface temperature workflow. The output folder contains a Cloud Optimized GeoTIFF, a thumbnail, logs, QA artifacts, checksums, a style file, and maybe a STAC JSON file.

The first task is not deep analysis. The first task is orientation.

Does the output exist? Does the raster open? Does the preview roughly match the expected area? Are the QA files present? Is this the final product or an intermediate file? Is there enough here to justify opening a notebook, VS Code, QGIS, xarray, GDAL, or a validation workflow?

packageR helps at that moment. A user opens a browser view over mounted workspace storage, navigates the product folder, checks file details, previews supported image assets, and decides what deserves deeper work.

That is different from analysis. packageR does not replace Jupyter, QGIS, xarray, GDAL, Dask, or domain-specific viewers. It helps users decide when those tools are worth opening.

This matters because EO outputs are rarely single files. A result can include COGs, STAC JSON, GeoParquet indexes, thumbnails, QA layers, provenance, logs, style files, licenses, and Zarr stores. A raw object listing only shows that files exist. packageR helps people understand the folder well enough to choose the next step.

Cloud-native formats make this more useful. A [Cloud Optimized GeoTIFF](https://www.cogeo.org/) is still a GeoTIFF, but it is organized so clients can request only the parts of the file they need. packageR supports that direction by keeping data in storage and using presigned access where configured, instead of forcing every byte through the browser application.

![packageR image preview over aerial data](blog/images/2026-06-28-package-r-authenticated-image-preview.png "A supported image asset can be previewed in packageR before the user moves into heavier analysis tools. Source: packageR documentation.")

## Use case 2: a no-code view inside DataLab

The point is not to avoid DataLab.

The point is to avoid making every first question start with code.

A DataLab is the workbench around the data. It can provide JupyterLab, VS Code Server, terminals, dashboards, storage access, credentials, quotas, and collaboration rules. That is where deeper analysis, validation, scripting, and production work belong.

But before opening a notebook or terminal, users often need a plain view of the workspace.

This is how packageR fits into the EOEPCA+ work. The EOEPCA Workspace Building Block brings together object storage, interactive runtimes, and collaboration tooling. It gives users browser access to data, editors, terminals, and secure share links within the same workspace context.

Inside a DataLab session, packageR is the first-look component. Users can browse mounted storage, inspect generated outputs, preview supported files, and create scoped links. If that is enough, no code was needed. If the result needs deeper work, the analysis tools are already next to the data.

The same pattern appears in [Provider Datalab](https://provider-datalab.versioneer.at), where a workspace can include VS Code Server, terminals, a storage browser, object-storage access, and tools such as `awscli` and `rclone`.

The split is simple: packageR gives the first look. DataLab gives the deeper workbench. Object storage remains the durable foundation.

## Use case 3: a simple publishing facade

Sometimes a result does not need a full publication workflow yet. It just needs to be visible.

A team may want to expose a COG, thumbnail, GeoJSON file, style file, or small validation result. A dashboard may need a stable URL. A colleague may need to review a few outputs without getting access to the full workspace.

packageR can act as a simple publishing facade for that.

In a workspace deployment, a public share can be mapped with a rule such as `publish=/home`. The important part is the boundary. Users do not all write into one shared public directory. Each user writes into a scoped area below `/home`.

Alice can publish Alice's files. Bob can publish Bob's files. Neither user needs permission to overwrite the other person's public outputs.

This matches the packageR access model. The feature documentation describes static default shares and user-default access rules, where non-admin users can be restricted to a sanitized username path below a configured home base path. The [public-sharing walkthrough](https://package-r.versioneer.at/latest/generated/usecases/public-sharing/) shows the same separation in practice.

For users, the workflow is simple: put selected outputs into the publish area, and packageR exposes them through the public facade.

No local download. No separate upload into a portal. No broad bucket credentials for consumers. No shared write area where one user can accidentally overwrite another user's published files.

![packageR public share directory listing](blog/images/2026-06-28-package-r-public-share-directory.png "A public share exposes a scoped directory listing without giving consumers access to the wider workspace. Source: packageR documentation.")

This is not the final governed publication gate. It is the useful middle ground between private workspace output and a formal published data product.

## Use case 4: stable public URLs for dashboards

The publishing facade becomes more useful when another application needs the data.

A dashboard, map client, or lightweight data viewer often wants a stable URL. But the actual bytes should still come from object storage where possible.

This is exactly the handoff needed by [EOxHub](https://hub.eox.at) and applications built with [eodash](https://eodash.org). eodash is a dashboarding library, not a storage layer. It can render EO dashboards, but the browser still needs web-reachable references to STAC, services, COGs, GeoTIFFs, GeoJSON, FlatGeobuf, and similar assets.

A browser cannot mount a workspace path such as `/home/alice/result.tif`. It also should not receive broad S3 credentials. It needs HTTP URLs with the right access behavior.

packageR helps create that bridge.

Authenticated file requests and public share requests can return S3-compatible presigned URLs with `?presign=true`. With `?followRedirect=true`, packageR redirects to the generated presigned URL using HTTP 307 while preserving the request method.

That means an eodash-based dashboard can point to a stable packageR public asset URL. At request time, packageR can generate a temporary object-store URL and redirect the browser to storage. The dashboard should keep the stable facade URL, not the temporary presigned target.

![packageR public share with presigned URL metadata](blog/images/2026-06-28-package-r-public-share-presign.png "The stable public facade can expose presigned access metadata while the temporary object-store URL remains an implementation detail. Source: packageR documentation.")

The EOxHub story makes this concrete. In EOxHub Workspaces, packageR is packaged as the web file browser around workspace storage. A workspace can expose a public path that maps to a path in an object storage bucket. When an application requests an asset under that public path with presigning and redirect enabled, packageR can generate the presigned object-store URL and return the redirect automatically.

An eodash-based dashboard can then access published outputs while the bucket itself remains private. The asset is reachable through a controlled facade, but the bucket is not turned into a public bucket.

That is the friendly story: packageR is not only a backend component. It is already part of a real workspace pattern where users can place geospatial outputs in a public area, get stable URLs, and connect those assets to applications.

![eodash dashboard endpoint integration visual](blog/images/2026-06-28-eodash-endpoint-integration.png "Browser dashboards need web-reachable geospatial assets and services. Static frame from the eodash endpoint-integration visual. Source: eodash.org.")

## Use case 5: move from shared files to cataloged products

A public folder is useful. A catalog is better when a result becomes reusable.

For Earth observation, [STAC](https://stacspec.org/en/) gives teams a common way to describe spatiotemporal assets so they can be indexed, discovered, and used by shared tooling.

packageR can bridge the file view and the catalog view. Shares can carry catalog metadata. A public catalog endpoint can read a configured Parquet catalog with DuckDB and return STAC `Feature` or `FeatureCollection` JSON. Matching asset links can be rewritten to packageR public-share URLs with `?presign=true&followRedirect=true`, so catalog discovery connects back to object-storage-backed access.

This gives teams a gradual path. First, users inspect the result in packageR. Then selected files move into a controlled publish area. A dashboard can use stable public URLs. If the result becomes more than a quick shared output, the same assets can be described through STAC and made discoverable through catalog tools. The [Catalog & STAC walkthrough](https://package-r.versioneer.at/latest/generated/usecases/catalog-stac/) shows that in practice.

That is the transition from "here is a folder" to "here is a product candidate."

## What packageR is, and what it is not

packageR started as a fork of [File Browser](https://github.com/filebrowser/filebrowser). It keeps familiar ideas such as users, shares, a file tree, and browser-based inspection.

The packageR-specific part is that data can live in object storage while appearing as a regular file tree, often through FUSE or another platform storage integration. packageR then adds presigned access, supported previews, public sharing, and catalog workflows such as STAC.

The boundary is important.

packageR is mainly for browsing, inspection, curation, sharing, preview, and catalog access. Large uploads and downloads should usually go directly to the bucket with S3-compatible tools.

It can preview TIFF and GeoTIFF files in the browser through a `geotiff.js` renderer. It detects Parquet mainly for catalog and STAC workflows. Zarr preview is not implemented today.

That is fine. packageR does not need to be a universal EO visualization engine. Its job is to remove friction from the first questions:

- What is here?
- Can I inspect it?
- Can I expose this subset?
- Can an application consume it?
- Can this move toward a cataloged product?

When the question becomes scientific interpretation, validation, time series analysis, large-scale processing, or production automation, users should move into the right tool. The difference is that they can do so after they know which data is worth opening.

## A bucket is not enough

Object storage is the right foundation for EO data, but it is not the user experience.

A bucket can hold the files. It cannot explain which output is useful. It cannot preview a GeoTIFF for a quick check. It cannot safely expose one user's public result while protecting another user's files. It cannot give a dashboard a clean public facade. It cannot turn a folder into a STAC-readable product candidate.

packageR fills that practical layer.

It helps teams inspect data before writing code. It helps workspace users publish selected outputs without copying them somewhere else. It gives applications stable facade URLs while still allowing object-storage-backed access through presigned redirects. It connects shared files to catalog workflows when a result is ready to become more than a folder.

packageR is not the platform. It is the small, useful layer between workspace storage and the next decision.
