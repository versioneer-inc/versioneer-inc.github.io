---
date: 2026-09-04
title: "Platform Reliability and Remediation Operations: From Alert to Recovery"
description: "A practical operating model for Kubernetes service health, incident investigation, controlled remediation, recovery verification, and learning."
tags: "kubernetes, platform-operations, reliability, incident-response, gitops"
---

# Platform Reliability and Remediation Operations: From Alert to Recovery

An alert is the start of an investigation, not proof of a cause. A recent
deployment may be related to an incident, but timing alone does not prove it.
A restart may complete while the service remains unavailable. A green
dashboard may be misleading when its data is stale.

Reliable operations therefore connect monitoring, human investigation, a safe
change, and measured recovery. Keep coordinates this response as a workflow.
Operators retain decision authority for production changes, while each workflow
keeps the trigger, context, action result, and verification together.

This guide is for platform operators who respond to service degradation and
restore service. The
[platform operations overview](blog.html?post=2026-09-03-platform-operations)
explains how this discipline relates to Security Operations and Lifecycle and
Continuity Operations. This guide describes a realistic starting point built
from deployed monitoring, alerting, dashboards, logs, synthetic checks, and
GitOps. It explains how Keep connects these tools into a controlled remediation
path.

## The Reliability and Remediation Flow

The guide uses the following toolchain:

- Prometheus collects metrics and evaluates recording and alerting rules.
- Alertmanager groups alerts and routes them to a receiver.
- Keep groups alerts, adds context, and runs remediation workflows.
- Grafana shows service and Kubernetes dashboards.
- Loki stores workload logs collected by Grafana Alloy.
- Kubernetes status and events show the current workload state.
- Synthetic checks test selected public service paths.
- Git and the GitOps controller show the desired configuration, deployed
  revision, and synchronization state.

Keep is the workflow and remediation layer. It connects an alert to the
evidence, an authorized action, and a verification result. Grafana, Loki,
Kubernetes, Git, CI, and GitOps remain the sources of detailed operational
state.

| Stage       | Control                                                                                  | Record or evidence                                                                               |
| ----------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Detect      | Prometheus rules, service metrics, infrastructure metrics, and synthetic checks          | Time series, rule result, and alert                                                              |
| Route       | Alertmanager and Keep                                                                    | Alert state, labels, annotations, timestamps, and receiver history                               |
| Investigate | Keep workflow steps with Grafana, Loki, Kubernetes, synthetic output, and GitOps history | Workflow run, saved query or dashboard link, log time range, workload state, and recent changes  |
| Decide      | Restricted manual Keep workflow for production changes                                   | Workflow identity, authorized operator, target, reason, and recovery path                        |
| Act         | Keep provider action, CI workflow, Kubernetes operation, or GitOps change                | Keep action result, job output, Kubernetes events, Git commit, and GitOps synchronization result |
| Verify      | Synthetic check, service metrics, alert state, logs, and workload status                 | Before-and-after evidence and an observation period                                              |
| Learn       | Incident review and tracked follow-up work                                               | Timeline, findings, owner, due date, and completed change                                        |

```text
Service and platform signals
          |
          v
     Prometheus ----> Alertmanager ----> Keep workflow
          |                                  |
          v                                  +--> collect context
       Grafana <-----------------------------+--> operator gate
          ^                                  +--> provider action or GitOps
          |                                  |
          +---------- verify recovery <------+
```

The operator gate is deliberately visible. Keep standardizes the workflow, but
it does not authorize its own production access. A successful action also does
not prove that users recovered, so verification remains part of the workflow.

## The User-Visible Service Comes First

Infrastructure alerts are necessary, but they do not describe every user
problem. High CPU can be harmless while normal CPU can hide a broken service.
The first question is therefore: which user operation is unhealthy?

An SLI measures service behaviour. An SLO states the expected level over a time
window. The error budget is the allowed amount of failure. For a request-driven
service, useful indicators include availability, error rate, and latency. For
data and processing platforms, they can also include:

- catalogue or result freshness
- queue age and processing completion time
- expected versus produced items
- data correctness and completeness
- access to published assets
- dependency and storage availability

External synthetic checks are important because they test the path from a
user-like location. Internal metrics then help locate the failing layer. A
synthetic request may show that a search API is slow, while gateway,
application, Kubernetes, and database metrics help explain where the delay is
appearing.

Service ownership, objectives, and runbooks are versioned in Git. Each important
service has an owner, a user-facing health check, an escalation path, and links
from its Keep alert to the relevant Grafana dashboard and runbook.

Paging is reserved for conditions that need prompt human action. Lower urgency
degradation belongs in a ticket or review queue. Diagnostic signals remain
available without all becoming notifications. An alert that operators routinely
ignore is not a useful control.

## Alerts Are Evidence, Not Conclusions

Consider a slow API. Its synthetic check fails, the gateway reports upstream
latency, two application Pods are near their memory limits, database latency is
normal, and the GitOps controller synchronized a revision 20 minutes earlier.

These are observations. The deployment is a useful lead, but it is not yet the
cause. The Pods may be the cause, an effect, or unrelated noise.

The alert should tell the operator what fired, for which service and
environment, when it started, and how severe it is. Labels and annotations
link to the dashboard and runbook. Keep groups and enriches the alert and starts
the matching response workflow. The original Prometheus alert remains the
source of the detection signal.

The operator then adds the surrounding evidence:

- the affected user operation and visible impact
- the alert expression and current value
- dashboard and query links with the selected time range
- related workload state, events, and logs
- synthetic check results
- recent deployments, configuration changes, and GitOps state
- known dependency problems
- missing or stale telemetry

The Keep incident record holds this material. It stores links and time ranges
instead of large copied datasets. Observations remain separate from hypotheses,
and missing evidence is explicit rather than silently ignored.

Read-only investigation also needs limits. Wide log searches and expensive
metric queries can add load during an incident. Bounded time ranges and result
sizes reduce that risk. Secrets, full request bodies, and unrelated personal
data remain outside the collected evidence.

## Investigation Across the Toolchain

The practical investigation path is simple:

1. Keep provides the alert, incident state, and matching workflow. Alertmanager
   provides the original routing state.
2. The linked Grafana view identifies the affected service operation.
3. Gateway, application, workload, and dependency signals provide comparison
   with the user-facing symptom.
4. Loki provides logs for the affected workloads and time range.
5. Kubernetes status and events expose failed scheduling, restarts, rollout
   problems, resource pressure, or storage faults.
6. Git and GitOps history show deployments near the start of the problem.
7. The incident record holds the working hypothesis, supporting evidence,
   uncertainty, and selected mitigation.

A runbook is useful when it reflects real incidents and real tools. It states
what to check, where to find it, which results point to a specific failure
domain, when to stop, and when to escalate. The runbook is versioned as
Markdown beside the deployment configuration and linked from the Keep alert.

During an active incident, the operator needs enough confidence to choose a
safe mitigation. Full root-cause analysis can happen after recovery. A complete
analysis must not delay a safe mitigation, and a successful mitigation is not
proof of the root cause.

## Remediation Through Keep

Keep is the remediation workflow tool. Alert-triggered workflows collect and
enrich evidence. Production changes run through separate manual workflows that
are restricted to authorized operators. This division prevents an alert from
changing production before an operator confirms the target and impact.

Each remediation workflow has five parts:

1. A trigger connects the workflow to one alert class or manual operation.
2. Evidence steps collect the current workload, log, metric, and GitOps state.
3. Conditions confirm the target, current state, and stop conditions.
4. A provider action runs the approved Kubernetes, CI, or GitOps operation.
5. Verification steps repeat the user-facing check and inspect service health.

The workflow is versioned in Git and provisioned into Keep. Its manual trigger
uses Keep workflow permissions so only the operations role can start a
production action. Each provider credential has only the access required for
its defined action and target.

The Keep Kubernetes provider runs bounded operations such as a rollout restart
or a scale change. Durable configuration changes still use Git and GitOps. Keep
starts the approved CI workflow, records its result, and follows the GitOps
revision to the cluster. An unrecorded direct production change does not meet
the remediation control.

A production workflow records the exact target, current state, reason, likely
user impact, stop condition, recovery path, operator, and action result. The
Keep workflow run connects this decision to the provider result. Kubernetes,
CI, Git, and GitOps remain the detailed source records.

Retries are bounded and visible. When an action does not improve the service,
the workflow stops and returns to investigation or escalation. Repeated
restarts can hide a deeper fault and remove useful evidence.

## Recovery Verification

Command completion is only the first check. Recovery should be verified at
several levels:

- **Change:** the command, workflow, or GitOps synchronization completed.
- **Resource:** the workload or dependency reached the intended state.
- **Service:** the affected user operation works again.
- **Indicator:** latency, errors, availability, freshness, or completion moved
  back towards the expected range.
- **Stability:** the service remained healthy for a suitable observation time.
- **Side effects:** another service, tenant, dependency, or resource did not
  become unhealthy.

Recovery evidence includes a repeated external synthetic check, relevant
service indicators, workload health, logs, and a useful independent signal.
The alert that detected the problem is not sufficient on its own. It may need
time to resolve because of its evaluation window, and a missing time series can
look healthy if data freshness is not visible.

An error budget consumed during an incident is not restored when the service
recovers. Recovery stops further consumption; it does not erase the past
failure.

Failed verification returns the flow to investigation or escalation. The Keep
workflow record shows that the action ran but did not restore the service. This
result is useful evidence and remains visible in the incident timeline.

## Evidence at Two Levels

Operators need a summary view and a path to the detailed record.

Grafana is the summary layer. It should show user-facing health, SLO or burn
rate, important dependencies, workload state, and whether data is fresh. The
dashboard should use the same recording rules that drive alerts where
possible. This reduces disagreement between the page and the dashboard.

The detail remains in the source systems:

| Question                       | Detailed evidence                                                             |
| ------------------------------ | ----------------------------------------------------------------------------- |
| What fired?                    | Prometheus rule, Alertmanager alert, labels, value, and timestamps            |
| Did the notification arrive?   | Alertmanager receiver state and Keep event                                    |
| Is the dashboard trustworthy?  | Query result, last sample time, scrape health, and rule health                |
| What happened in the workload? | Kubernetes status, events, resource metrics, and Loki logs                    |
| What changed?                  | Git commit, deployment revision, and GitOps synchronization history           |
| What did the operator decide?  | Keep incident timeline with operator, reason, target, and recovery path       |
| What action ran?               | Keep workflow run, provider result, job, commit, Kubernetes events, and actor |
| Did users recover?             | Synthetic result, service indicators, alert state, and observation window     |

A dashboard that shows only alert totals or current CPU is not enough. Every
Keep and Grafana summary leads to the related query or source record. The view
also shows stale or missing data. Keep connects the response record without
copying all detailed telemetry into one store.

## Building Reliable Keep Workflows

Keep workflows remain small, versioned, and testable:

1. Every important service alert names an owner, dashboard, runbook, and
   user-facing check.
2. One alert class starts one enrichment workflow, which prevents duplicate
   actions.
3. Production remediation uses a manual trigger with restricted workflow
   permissions.
4. Provider credentials use least privilege and fixed target scopes.
5. Each action has a precondition, bounded retries, a stop condition, and a
   recovery path.
6. Verification uses the same synthetic and service indicators that define
   user health.
7. Workflow tests cover a successful action, a rejected precondition, an action
   failure, and failed recovery verification.
8. Git provisioning keeps the reviewed workflow definition aligned with the
   running Keep configuration.

The first production workflow handles one narrow and reversible action.
Additional workflows follow only after tests show that their targets, failure
modes, and recovery paths are understood. Keep provides the workflow record;
the connected tools provide the detailed action and service evidence.

## Learning from Incidents and Reducing Toil

After recovery, a blameless review covers the impact, timeline, useful and
missing signals, decision points, mitigation, verification, and communication
gaps. Each follow-up needs an owner, priority, due date, and a way to prove
completion.

Repeated manual work is operational toil. Its frequency and duration show where
the process needs improvement. Unnecessary work is removed at its source before
stable and well-understood steps become versioned Keep workflows. Keep
automation removes repetition without hiding uncertainty or expanding
production authority.

Controlled failures in a safe environment test the operating loop. A good
exercise starts with a clear hypothesis, limited blast radius, abort condition,
restoration procedure, and evidence to retain. Its scope includes alert
delivery, stale data, a failed deployment, an unsuccessful mitigation, and
recovery verification—not only the happy path.

## Sign-off Evidence

Reliability sign-off uses the checks below. Each check retains timestamps,
links, command or workflow output, and the name of the operator who ran it.

1. **User-facing health.** The external synthetic check runs against the
   healthy service and a controlled failing route in the test environment.
   **Pass:** The healthy request meets its status and latency target, the failed
   request is detected, and both results identify the service and environment.
2. **Alert delivery.** A test Prometheus alert is triggered for an important
   service. **Pass:** The rule enters the firing state, Alertmanager selects the
   intended receiver, and Keep receives one alert with the owner, environment,
   severity, service operation, dashboard, and runbook link.
3. **Missing telemetry.** One test scrape target and one test log source are
   interrupted. **Pass:** Grafana marks both sources stale, missing-data alerts
   reach Keep within two collection intervals, and the panels recover after the
   sources return.
4. **Investigation path.** An operator starts with the test alert and no extra
   instructions. **Pass:** Within 15 minutes, the incident record contains the
   affected user operation, Grafana time range, Prometheus rule, Loki query,
   Kubernetes state and events, and the current GitOps revision.
5. **Runbook execution.** The three most frequent incident runbooks are run in
   the test environment against their stated fault. **Pass:** Each runbook names
   its Keep workflow, required evidence, stop condition, and escalation path,
   and restores the test service without an undocumented step.
6. **Workflow control.** The production workflow definition in Git is compared
   with the workflow provisioned in Keep. **Pass:** The definitions match, the
   trigger is manual, execution is restricted to the operations role, the
   provider uses least privilege, and retries and target scope are bounded.
7. **Keep remediation.** A reversible workload fault is introduced in the test
   environment and an authorized operator starts the matching Keep workflow.
   **Pass:** The workflow records its identity, operator, reason, target,
   provider action, result, recovery path, and verification; failed or
   inconclusive steps remain visible.
8. **Recovery.** The user-facing check is repeated after remediation. **Pass:**
   Three consecutive synthetic checks succeed, the service indicators remain
   inside their SLO thresholds for at least 15 minutes, the workload is ready,
   and no monitored dependency becomes unhealthy.
9. **GitOps reconciliation.** A reviewed test change is applied through Git,
   followed by a temporary direct change in the test cluster. **Pass:** GitOps
   reaches the reviewed revision, detects the direct drift, and returns the
   cluster to the recorded desired state.
10. **Incident record and learning.** The completed exercise record is
    reviewed. **Pass:** It links the original alert, investigation evidence,
    decision, Keep workflow, failed actions, before-and-after verification, and
    one improvement with an owner, due date, and completion test.

Reliability sign-off passes only when all checks pass. A ready workload or a
resolved alert without user-facing recovery evidence does not pass.

## Continue the Series

- Start with the
  [platform operations overview](blog.html?post=2026-09-03-platform-operations).
- Review
  [Platform Security Operations](blog.html?post=2026-09-03-security-operations).
- Continue with
  [Platform Lifecycle and Continuity Operations](blog.html?post=2026-09-05-platform-lifecycle-and-continuity-operations).

## About Versioneer's Platform Operations

Versioneer provides Kubernetes clusters that run in our customers' cloud
environments. This operating model keeps
Kubernetes Security Posture Management (KSPM)
in our hands while the infrastructure remains under customer control. We use
established, automated GitOps practices to operate Kubernetes fleets
consistently on customer infrastructure. This series captures the common
principles that guide our platform operations.
