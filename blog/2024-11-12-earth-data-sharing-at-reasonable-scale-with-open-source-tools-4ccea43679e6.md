---
date: 2024-11-12
title: "Earth Data Sharing at Reasonable Scale with Open Source Tools"
description: "TL;DR: Efficiently sharing earth data products at a reasonable scale should be possible relying on familiar concepts and open-source tools - not another complex platform."
tags: "data-management, data-versioning, earth-observation"
origin_url: https://medium.com/@stefan.achtsnit_41940/earth-data-sharing-at-reasonable-scale-with-open-source-tools-4ccea43679e6
origin_title: Medium
---

# Earth Data Sharing at Reasonable Scale with Open Source Tools

**TL;DR:** Efficiently sharing earth data products at a reasonable scale should be possible relying on familiar concepts and open-source tools - not another complex platform.

When we refer to reasonable scale for earth data products, we mean that tools should reliably manage thousands of generated data items with a total volume ranging from gigabytes to terabytes, all without unnecessary complexity or over-engineering. Our vision is that the approach should fulfill 80% of users' needs right out of the box, while still providing enough flexibility to configure and adjust for up to 99% of specific requirements. For the remaining 1% - which involves highly specialized needs - users may require custom development or a dedicated team to create tailored solutions.

## Key Tools for a Reasonable Scale Earth Data Sharing Solution

These tools enable users to **select, browse, package, and share** data effectively, without requiring a new platform. Here's how each stage of the data-sharing process works:

## 1. Data Browsing and Selection

Browsing is crucial for selecting data items to share. While search functions are beneficial, many users still prefer a hierarchical structure for file navigation. In earth data workflows, users often rely on Jupyter Lab or Jupyter Notebooks, which provide intuitive navigation in an organized file browser widget, often linked to S3-compatible storage APIs, such as Amazon S3. These Storage APIs facilitate logical grouping in the requests through delimiters, allowing for efficient retrieval also of large number of objects.

A great starting point to leverage this familiarity is the open-source File Browser ([https://filebrowser.org](https://filebrowser.org/)) tool - a lightweight application built with Vue.js and Golang that can operate both locally and remotely. It enables intuitive file browsing and selection through a streamlined interface, designed for simplicity and core functionality. Additionally, it offers straightforward download and sharing capabilities through proxying data for accessible content.

## 2. Mounting Remote Folders for Expanded Access

Accessing remote data sources greatly enhances flexibility in data exploration, enabling users to mount sources like NFS shares or S3 buckets through FUSE, making data appear as if it's stored locally in the filesystem. However, establishing these mounts requires storage credentials, necessitating caution, especially when configuring them remotely for access by multiple users.

> Directly modifying content in a shared, remote filesystem folder can introduce unforeseen complexities and risks, which we will explore further in a subsequent post on the "mutable shared state" problem. For this reason, we strongly recommend utilizing read-only remote mounts and will propose alternative solutions specifically designed for collaborative work on data in the future.

To streamline the process of source management, we have developed a tool called _sourceD_ to facilitate the addition, removal, and tracking of source mount, functioning as a daemon for FUSE processes. When integrated (see below) with the previously mentioned File Browser tool, it allows users to browse read-only remote sources, such as S3 buckets, without complicated setups, ensuring convenient remote access while maintaining system stability.

## 3. Secure Data Sharing with Minimal Proxying

Data sharing requires secure mechanisms to control authorized access instead of merely exposing files. While an authentication layer can be integrated externally (e.g. using [https://oauth2-proxy.github.io/oauth2-proxy](https://oauth2-proxy.github.io/oauth2-proxy/))[,](https://oauth2-proxy.github.io/oauth2-proxy/) it is necessary to establish a dedicated authorization strategy. For some use cases, obfuscated hashes may be sufficient, while others might require a comprehensive authorization system that grants access permissions to specific users or groups.

> Leveraging the built-in capabilities of file browsers to generate hashes for sharing is a valuable starting point, allowing for more advanced authorization approaches to be developed in the future.

However, authorization is just one facet of the overall solution; direct proxying can be inefficient and introduce network latency. A common strategy in object storage systems is to employ temporary URLs, which provide direct, short-term access to data, thereby minimizing data hops and enhancing the sharing process. Services like AWS's presigned URLs, Azure's Shared Access Signatures, and MinIO's temporary access tools support this approach.

By leveraging temporary URL capabilities, users can secure direct access to data without the need for heavy proxying, allowing for efficient and straightforward data sharing with minimal configuration.

## 4. Packaging and Sharing Data Collections

While sharing individual files is already useful, many users prefer to share curated collections of files in custom structures, particularly for earth data packages in modern formats like Zarr, which may include multiple data items (chunks) or metadata files. A practical method for creating such packages is to use symbolic links to form new structures that consist solely of these links. This approach is viable in standard file systems and can be easily executed via the command line.

> Furthermore, this packaging method addresses the challenge of reproducibility. For instance, if only a prefix (a folder) is shared in a bucket, the appearance of new data, such as daily updates, may surprise collaborators. Thus, maintaining an index that includes all the files within the data package is essential.
>
> It's also important to note that modifying the content of existing files is a different matter. However, features like object storage hashes and bucket versioning are increasingly becoming standard offerings.

To enhance this process, we have integrated such symbolic link creation functionality into above File Browser tool, allowing users to create their own data packages in a user-friendly manner that mimics file copying, where individual items are simply referenced by files within the data package. This intuitive approach for data packaging is the reason we named our maintained fork of File Browser _packageR (_[https://github.com/versioneer-tech/package-r](https://github.com/versioneer-tech/package-r)). Simplifying the organization of curated datasets while maintaining the flexibility and efficiency inherent in file system capabilities.

## 5. Annexing for Efficient Data Collection Sharing

Users not only curate data packages; they also seek to share them as complete immutable packages. The temporary URL approach provided by storage layers only functions at the individual object level, necessitating the creation of a separate URL for each file. However, is it practical to generate potentially large numbers of temporary URLs when users may not resolve all of them immediately? While generating these URLs is not particularly costly, it does involve some expense. The more pressing concern is that these URLs are temporary and will expire after a set period, which means the data package could become unusable if not resolved quickly by the end user.

Fortunately, the concept of annexing presents a viable solution by introducing the necessary level of indirection. Instead of immediately returning temporary URLs, information on where the annexed file can be located is provided, allowing for resolution at a later time. The advantage of this method lies in its reliance on standard HTTP concepts with redirects, enabling tools like _curl_ or _wget_ to interact with them effortlessly.

The key point is that these so-called pointer files contain either the direct storage layer URL or instructions on how to resolve the URL to obtain a temporary storage URL. We have integrated this resolution endpoint into the backend of _packageR_, internally delegating it to the _sourceD_, which manages the necessary credentials. This creates a seamless end-to-end solution.

## Additional Benefits for Users

1.  **Enhanced Metadata**: Users can add additional text files (such as README.md, code files, or Jupyter notebooks) alongside the pointer files in a data package that references the annexed files. This allows for content descriptions and satisfies governance and provenance needs by including necessary metadata.
2.  **Version Control**: The data packages are organized as folders in the file system, allowing users to version them using _Git_, as the large files are replaced by _Git_ manageable pointer files. This means you can easily track changes and maintain, backup and archive data packages with common _Git_ workflows.
3.  **Improved User Experience**: Users have the option in _packageR_ to just download data packages as ZIP files containing both text and pointer files, or they can opt for _Git_ tarballs in specific formats for use with tools like _Git Annex_ or _DVC_. This functionality enables to work within a standard _Git_ repository and resolve pointers transparently using commands like `git annex get` or `dvc get`, leveraging familiar solutions in data management without introducing new concepts.

## Open Source Solutions for Scalable Earth Data Sharing

The suite of open-source tools introduced - an improved file browser with packaging and annexing features, along with a source mount management tool - offers a scalable and flexible solution for the earth data community. Developed and maintained by Versioneer ([https://versioneer.at](https://versioneer.at/)), these tools are currently being validated in real-world applications, such as the distribution of EOX Cloudless ([https://cloudless.eox.at](https://cloudless.eox.at/)) data products to end customers and in ongoing ESA projects facilitating Earth Science research.

The tools are open, flexible, and tailored to the unique data sharing and management needs of the earth data community. Stay tuned, as data sharing is just one step in the lifecycle of a data product. Facilitating collaborative experimentation and creation of data products is another area where we are concentrating our efforts.
