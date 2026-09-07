---
date: 2026-09-05
title: "Platform Lifecycle and Continuity Operations: From Release to Recovery"
description: "How GitOps, immutable artifacts, support tracking, tested recovery, and complete decommissioning keep Kubernetes platforms supportable."
tags: "kubernetes, platform-operations, lifecycle-management, disaster-recovery, gitops"
---

# Platform Lifecycle and Continuity Operations: From Release to Recovery

A platform can be healthy and secure today but still become unsafe to operate.
Software reaches end of support, certificates expire, direct changes cause
drift, and untested backups fail when they are needed.

GitOps supplies many lifecycle controls out of the box in declarative form.
Reviewed Git records the intended state. A GitOps controller applies that state,
reports the deployed revision, detects drift, and restores declared resources.
This gives operators a strong default for inventory, change control,
reproducibility, audit, and configuration recovery.

GitOps does not prove that a service works, restore application data, track all
support dates, or make an incompatible data change reversible. Lifecycle and
continuity operations add these missing controls. The
[platform operations overview](blog.html?post=2026-09-03-platform-operations)
explains the boundary with Security Operations and Reliability and Remediation
Operations.

## GitOps Is the Lifecycle Baseline

When platform state is declarative, lifecycle control becomes part of the normal
delivery path instead of a separate manual inventory and change process.

| Lifecycle need      | GitOps capability available by default                                    | Additional control still needed                                     |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Inventory           | Git contains declared resources, versions, dependencies, and environments | Owners, data classes, support dates, and external services          |
| Change control      | A pull request shows the exact change, review, approval, and history      | Compatibility tests, maintenance timing, and service checks         |
| Deployment          | The controller applies a known revision and reports synchronization state | User-facing verification and an observation period                  |
| Drift control       | Continuous reconciliation finds or corrects direct changes                | An emergency-change procedure and follow-up in Git                  |
| Rebuild or rollback | Git history can reapply a previous configuration                          | Data, schema, and external API compatibility                        |
| Decommissioning     | A reviewed deletion removes declared resources                            | Data disposition, access removal, external cleanup, and cost checks |

The Git repository is the source for desired state. The controller status and
the cluster or cloud APIs show observed state. Their comparison exposes stale
resources, failed reconciliation, and manual changes. Generated inventory views
can combine these sources with ownership and support data. They must show their
collection time and any missing source.

Direct production changes are sometimes necessary during recovery. The change
must be temporary. Operators either revert the change or record it in Git after
the urgent work. Otherwise, the controller can overwrite the change, or the
cluster can keep an unreviewed state.

## Artifacts and Supported Software

Declarative configuration must identify immutable artifacts. Each deployed
image or package uses a version and content digest. The digest connects the Git
revision to the exact released bytes.

CI and the registry retain the small set of records that GitOps cannot create:

- source revision and build result
- immutable artifact digest
- Software Bill of Materials (SBOM)
- build provenance and signature or attestation result
- vulnerability and licence result at the time of evaluation
- Git revision and environments that deploy the digest

These records answer different questions. An SBOM lists components but does not
prove how the artifact was built. Provenance describes the build but does not
prove that the result is safe. A vulnerability result changes as new findings
become known. The immutable digest links all records to one release.

Lifecycle tracking also covers Kubernetes, operating systems, runtimes,
operators, APIs, databases, base images, certificates, and managed services.
For each important component, operators record the current and target version,
compatibility limits, end-of-support date, owner, and dated upgrade plan.
Security Operations assesses vulnerabilities and exceptions. Lifecycle
Operations makes sure that the required replacement reaches each environment.

## Planned Change and Maintenance

Most configuration changes can use one GitOps path:

1. A pull request states the reason, scope, affected services, current and
   target state, and recovery method.
2. CI checks the configuration, policy, compatibility, and the exact artifact.
3. Review and approval accept the remaining risk.
4. The GitOps controller applies the change in stages.
5. Service checks and indicators confirm the outcome before the next stage.
6. Git, CI, controller, and service results form the change evidence.

The pull request can therefore be the main change record when it contains the
required context and links to the test evidence. A successful synchronization
is necessary, but it is not proof of service health.

The plan defines stop conditions and either rollback or forward recovery.
Database migrations, storage formats, and external APIs can make rollback
unsafe. The last safe stop point and restore conditions must be known before
the change starts.

Maintenance and recovery also need capacity headroom. The platform must be able
to drain a node, run old and new versions during a rollout, restore data in an
isolated environment, and operate after the approved failure-domain loss.
Repeated maintenance tasks need a tested procedure, an abort condition, and a
visible result for every target.

## Continuity Depends on Tested Recovery

GitOps can rebuild declared platform configuration, but Git is not a backup for
application state. Recovery scope can include databases, object stores, queues,
file systems, identity and key material, registry artifacts, and controller
state that cannot be recreated safely.

Each data class has an owner, backup schedule, retention period, access rule,
storage location, recovery point objective (RPO), and recovery time objective
(RTO). Recovery copies remain outside the main failure domain. The minimum
procedure and protected emergency access also remain available when the normal
platform, identity service, Git service, or documentation service is not.

A successful backup job proves only that a job completed. An isolated restore
test must also prove that:

- the required data and keys are present and readable
- dependencies start in the documented order
- the service starts and completes a real operation
- the measured recovery point and duration meet the RPO and RTO

A disaster-recovery exercise goes further. It removes an approved failure
domain and tests detection, decision authority, access, restore, traffic change,
service verification, communication, and return to the normal GitOps state.
Measured results and unresolved gaps improve the next recovery plan.

## Complete Decommissioning

Retirement starts with a reviewed Git change, but it does not end when the
controller removes a workload. Operators also remove service identities,
permissions, secrets, certificates, routes, DNS records, storage, backups,
alerts, dashboards, contracts, and recurring costs. Data is exported, retained,
or deleted according to the approved disposition.

A dependency check occurs before removal. A service with no user traffic can
still support scheduled jobs, federation, backup, or recovery. The final record
states what was removed, who approved it, and how the data was handled.

## Sign-off Evidence

The following checks retain the source record, collection time, operator, test
result, and unresolved gaps.

1. **Declarative inventory and drift.** The reviewer compares Git, GitOps, and
   observed platform state. **Pass:** Each supported environment and service has
   an owner, version, support date, and data class; the controller is at the
   reviewed revision; each difference has a tracked correction.
2. **Artifact and support trace.** The reviewer traces one deployed digest from
   each artifact class and reviews platform support dates. **Pass:** Each digest
   links to source, build, SBOM, provenance, signature result, and deployment;
   no unsupported component or unowned near-term expiry remains.
3. **Planned change.** A representative upgrade uses the production artifact
   and procedure in a staged test. **Pass:** CI and compatibility checks pass,
   GitOps reaches the reviewed revision, a user-facing check stays within its
   threshold, recovery succeeds, and no direct drift remains.
4. **Isolated restore.** A current backup from each required data class is
   restored outside the main environment. **Pass:** Integrity checks and a real
   service operation pass, and the measured recovery point and duration meet
   the recorded RPO and RTO.
5. **Disaster recovery.** An exercise removes the declared failure domain and
   treats a normal control service as unavailable. **Pass:** An authorized
   operator obtains protected recovery access, restores the minimum service,
   verifies a user operation, meets the RPO and RTO, and reconciles the result
   with Git.
6. **Decommissioning.** A disposable service completes the retirement process.
   **Pass:** No workload, access, route, storage, monitoring object, inventory
   entry, dependency, or recurring cost remains, and the data disposition
   record is retained.

Lifecycle and continuity sign-off passes only when all checks pass. A completed
deployment or backup job without a tested service outcome does not pass.

## Continue the Series

- Start with the
  [platform operations overview](blog.html?post=2026-09-03-platform-operations).
- Review
  [Platform Security Operations](blog.html?post=2026-09-03-security-operations).
- Review
  [Platform Reliability and Remediation Operations](blog.html?post=2026-09-04-reliability-and-remediation-operations).

## About Versioneer's Platform Operations

Versioneer provides Kubernetes clusters that run in our customers' cloud
environments. This operating model keeps
Kubernetes Security Posture Management (KSPM)
in our hands while the infrastructure remains under customer control. We use
established, automated GitOps practices to operate Kubernetes fleets
consistently on customer infrastructure. This series captures the common
principles that guide our platform operations.
