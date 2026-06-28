---
date: 2026-01-28
title: "Earth Observation Has a Processing Problem-But Not the One We Think"
description: "Compute is no Longer the Limiting Factor. Coordination Is. For a long time, I was convinced that the main bottleneck in Earth Observation was simply compute. If only we had..."
tags: "data-processing, data-mesh, earth-observation, data-orchestration"
image: blog/images/2026-01-28-earth-observation-has-a-processing-problem-but-not-the-one-we-think-5deefe3ae47e-1.png
origin_url: https://medium.com/@stefan.achtsnit_41940/earth-observation-has-a-processing-problem-but-not-the-one-we-think-5deefe3ae47e
origin_title: Medium
---

# Earth Observation Has a Processing Problem-But Not the One We Think

![](blog/images/2026-01-28-earth-observation-has-a-processing-problem-but-not-the-one-we-think-5deefe3ae47e-1.png)
_Compute is no Longer the Limiting Factor. Coordination Is._

For a long time, I was convinced that the main bottleneck in Earth Observation was simply compute. If only we had bigger clusters, more storage, and easier access to the cloud, everything else would fall into place. That belief shaped an entire generation of EO engineering. Without the luxury of an always-available HPC system, I gradually moved in the cloud from carefully curated machines and shared clusters to elastic cloud infrastructure-from pets to cattle, from local NFS shares to virtually unlimited object storage, from hand-written bash scripts to distributed frameworks.

And to be fair, it worked. Frameworks like Spark, Dask, Ray made it possible to [scale EO processing across clouds](https://www.nature.com/articles/s41597-025-04513-y) and process entire archives in parallel. Tasks that once required a week-long batch run suddenly finished before lunch. Spinning up a cluster became a credit card operation instead of a procurement process. From a technical perspective, this is real progress, and the engineering maturity of EO processing stacks has improved dramatically.

And yet, something strange happened. Despite faster pipelines and better infrastructure, many EO projects still struggle to become dependable operational products. They work beautifully in demonstrations, but friction appears the moment they meet real business processes. The uncomfortable conclusion is this: we mostly solved the compute problem. The remaining gap is about orchestration, state, and productization-not how fast we process data, but how we manage processes and trust results over time.

## The scientific mental model

Research workflows typically assume a clean, almost idealized structure. Data is ingested, a well-defined processing chain runs end-to-end, and a reproducible result is produced. The entire system can be expressed as one coherent graph: deterministic, automated, self-contained. This mindset is deeply embedded in our tools. Distributed frameworks encourage describing everything as one large directed acyclic graph. If all steps are encoded correctly, the system simply executes the graph and produces the answer. For science, this works remarkably well because it optimizes for clarity, repeatability, and performance. But business reality rarely behaves like a single graph.

## The operational reality

Operational EO environments are messy by design. Satellite acquisitions do not arrive like a clean benchmark dataset. Scenes are delayed, orbits are missing, and half of a tile may be covered by clouds. Atmospheric conditions change between passes. A preprocessing chain behaves differently because an auxiliary DEM or calibration file was updated. A cloud mask turns out to be too aggressive and needs to be recomputed. A customer asks for the same product but only for a smaller AOI or with slightly different thresholds.

None of this fits neatly into a single, one-shot pipeline. What starts as a tidy workflow on paper quickly becomes a living process. Some scenes are reprocessed, others skipped. Certain steps require manual quality control-inspecting mosaics, fixing masks, adjusting parameters, and triggering partial reruns. Products are regenerated for new time windows or updated inputs. The system spends most of its time not computing, but waiting, branching, retrying, and coordinating.

What looked like one pipeline turns into a long-lived process with pauses, retries, forks, and decisions-not a straight line, but a state machine; not fully automated, but human-in-the-loop; not executed once, but repeatedly, in many small variations across seasons, regions, and customers. At this point the limiting factor is no longer compute. It is coordination over time, and that is where many EO systems start to feel brittle.

## Industry already figured this out

If you zoom out from EO and look at where the broader software and data industry invests its money, the priorities are revealing. Billions have flowed into [durable workflow and orchestration](https://temporal.io/blog/what-is-durable-execution) systems. Platforms such as Airflow, Temporal, AWS Step Functions, Azure Durable Functions, Prefect, and Dagster exist for one reason: real processes span days or months, involve humans, and must survive failures. Stateless batch jobs are not enough. Systems need memory.

At the same time, analytics platforms like Databricks and Snowflake became multi-billion-dollar companies not because they execute SQL slightly faster, but because they solved trust problems. Transactional semantics, lineage, time travel made it possible to treat data as reliable products rather than loose files. Underneath, table formats like Iceberg, Delta Lake, and Hudi introduced [database-like guarantees on top of object storage](https://www.min.io/learn/open-table-format). More recently, the surge of interest in agentic AI is essentially another attempt to tackle orchestration: systems that can decide what to do next, react to exceptions, and [coordinate complex tasks](https://www.anthropic.com/engineering/building-effective-agents) that previously required manual glue code.

Seen together, the pattern is clear. The market is investing in coordination, state, and reproducibility, not in faster map algebra. These are exactly the challenges we face when trying to run EO workflows operationally.

## The data problem behind the workflow problem

There is another layer that often goes unnoticed. In structured data engineering, one of the biggest breakthroughs of the last decade was surprisingly simple: [versioned datasets](https://docs.databricks.com/aws/en/delta/history) and the ability to [take snapshots](https://docs.snowflake.com/en/user-guide/object-clone), branch, experiment safely, and roll back. Time travel in Iceberg or Delta Lake sounds like a convenience feature, but in practice it completely changes how teams work. Experiments become cheap, reproducibility becomes trivial, and audits become possible. You no longer argue about which input was used; you simply reference the snapshot ID.

This idea has proven so valuable that the industry is now pushing it even further. Beyond versioned tables, there are significant investments into making [full database forking and cloning](https://neon.com/blog/practical-guide-to-database-branching) a first-class primitive as well. Modern data platforms increasingly support instant copies of entire databases or environments for testing, experimentation, or customer-specific variants. Instead of exporting and re-importing data, teams simply branch the whole system state and work in isolation.

EO workflows rarely have that luxury. We still tend to treat object storage as a pile of files. Intermediate results are overwritten, derived products drift silently, and reproducing last quarter's output often means hoping nothing changed in the meantime. For science this is [inconvenient](blog.html?post=2025-10-31-towards-a-pragmatic-storage-ecosystem-for-earth-sciences-71f9bbeda5b8). For operations it is unacceptable. This is why concepts such as content-addressed storage, deduplication, bucket versioning, and data forking are becoming more relevant. Systems like LakeFS or DVC bring Git-like semantics to large binary assets, allowing raster cubes and derived products to be snapshotted and branched just like code or tables. Once you have that, experimentation stops being risky and trust increases dramatically.

## Where EO often gets stuck

A pattern I see repeatedly is that teams invest enormous effort into optimizing processing engines while treating orchestration and data semantics as secondary concerns. We debate whether Spark or Dask is faster, benchmark cluster sizes, and tweak chunking strategies. Meanwhile, the actual blockers in production are much simpler and more fundamental: can we re-run only one step, prove which inputs generated this result, pause a workflow and resume tomorrow, allow multiple teams to collaborate safely on the same data, or publish something as immutable and auditable? These are not performance questions. They are system design questions that require different primitives-workflow engines, versioned storage, packaging, lineage, and governance. In other words, product infrastructure.

## A shift in mindset

Perhaps the biggest change required is conceptual. Instead of thinking in terms of pipelines that process data, we need to [think in terms of products that evolve over time](https://martinfowler.com/articles/data-mesh-principles.html). A product has versions, owners, and releases. It can be audited and reproduced months later. It is not just the result of a single execution, but the outcome of many coordinated steps across people and systems. This perspective aligns much more closely with how modern software is built and operated. Data engineering already moved there. Software engineering has lived there for decades. EO is only now starting to make that transition.

## The opportunity ahead

This is actually encouraging. It means the next wave of innovation in EO will likely not come from slightly better algorithms or marginally faster compute. Those improvements matter, but they are incremental. The real leverage lies in better orchestration, stronger data semantics, and clearer packaging of results as portable, immutable artifacts. When those pieces are in place, reproducibility stops being a best practice and becomes a property of the system, and trust stops relying on documentation and starts relying on architecture.

At that point, an organization can say with confidence that a product was generated from exactly this data state, with exactly this workflow, and can be reproduced anytime. That sentence is what businesses actually buy-not clusters, not frameworks, not faster jobs, but dependable products. If Earth Observation wants to close the gap between research and operations, this is where the focus needs to shift.
