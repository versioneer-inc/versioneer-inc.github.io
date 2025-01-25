---
date: 2024-12-30
title: Minimize ROT Data on All Levels
image: https://versioneer.at/working-with-earth-data.png
---
# Tooling to Minimize ROT Data in Earth Sciences on All Levels

**Note**: This blog post is part 2 of a 3-part series on practices to minimize ROT data in data-intensive domains like Earth Sciences.

The rapid growth of datasets often leads to unnecessary redundancy, which drains storage resources. While traditional deduplication methods are typically applied at the server (remote storage) level, more advanced, application-aware strategies—such as smart metadata management—can significantly reduce ROT data at both the client side (local or shared cache) and server side.

Effective data management becomes particularly crucial when users are working on related projects in parallel, or collaborating in shared environments like JupyterHub. In such settings, minimizing redundancy is key to reducing storage overhead. Tools like **Git LFS (Large File Storage)** and **DVC (Data Version Control)** provide targeted solutions to minimize redundant data at both ends—server and client—ensuring storage is used efficiently. 

## Minimizing ROT Data on the Server Side (Remote Storage)

When large datasets are shared or experiments are run in parallel, the duplication of large files or datasets across different user environments can quickly lead to inefficient storage use. Generic storage-level solutions like deduplication in specific file systems (e.g. ZFS) may help reduce redundancy. But they often introduce additional compute and memory overhead, and can slow down a real-time working environment like a shared network file system, and are therefore ofteb used only for archival or final publication purposes.

Additionally, handling various types of data (such as machine learning user-curated labels versus automatically captured satellite images) demands distinct approaches depending on factors like size, frequency of change, and user requirements. This often necessitates more specialized and adaptable tools tailored to each specific use case.

Here’s where **DVC** and **Git LFS** prove indispensable in minimizing redundancy at the server side, allowing large files (such as datasets and machine learning models) to be stored externally in remote storage system (e.g. cloud or object storage), only retaining metadata pointers to those files in the version control system.

Both tools ensure that large files are stored in deduplicated form when pushed to remote storage, making it easy to avoid storing duplicates of data on the server side.

## Minimizing ROT Data on the Client Side (Local resp. Shared Cache)

When individual users work on multiple related projects, in parallel experiments or in collaborative environments like JupyterHub, where many users access shared datasets and run experiments in a distributed fashion, client-side caching plays a pivotal role in reducing unnecessary duplication.

When users access large datasets or models frequently, caching helps avoid downloading or storing the same data multiple times. However, inefficient caching mechanisms can lead to redundant data accumulation, counteracting the goal of data efficiency.

Here’s where **DVC** and **Git LFS** can help on the client side:

- **DVC** provides a local cache for datasets and models, either on the user's machine or on a shared platform, preventing duplication when multiple users or experiments access the same data.
- **Git LFS** ensures that only metadata (pointers) for large files are stored in Git, with the actual files either cached locally or stored remotely. This setup ensures that multiple users or experiments can refer to the same dataset without duplicating the data itself.

In fact, **DVC** takes it a step further by offering a local cache with deduplicated data, linking only the relevant files. This cache can use symbolic or hard links, or even reflinks (depending on the underlying file system, see https://dvc.org/doc/command-reference/cache), which ensures that the same data is shared across users or experiments without unnecessary duplication.

This client-side caching is especially valuable when users collaborate on similar or related experiments. By utilizing these tools, data is efficiently cached and reused, helping to reduce ROT data across multiple workflows.

## Key Benefits of Using Git LFS and DVC for Minimizing ROT Data

Here are the core benefits these tools provide to reduce ROT data across both server and client sides:

- Both handle large files externally while maintaining lightweight metadata or pointers within the version control system. This minimizes redundancy on both the server and client sides, ensuring storage is used more efficiently.
- As users work on related projects or experiments, the caching mechanism ensures that only the necessary changes are stored, while unchanged data is simply referenced. This avoids unnecessary duplication. This is particularly useful in environments like JupyterHub, where users may run similar experiments using shared data.
- They integrate seamlessly with a variety of remote storage solutions, including cloud object storage or enterprise systems, which may offer additional features like **deduplication** or **compression** on more granular block or chunk level as well.

Automated cleanup policies are a critical component of maintaining an efficient workflow. By using tools like **DVC's** pipeline functionality or **Git hooks**, users can automatically prune outdated or obsolete files from their local cache or remote storage. Regular cleanup ensures that only the most relevant data is retained, while ROT data is consistently removed. The importance of implementing such data governance practices will be further explored in part 3 of this series.