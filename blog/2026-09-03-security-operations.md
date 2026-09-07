---
date: 2026-09-03
title: "Platform Security Operations: From Controls to Evidence"
description: "A practical Kubernetes security operations blueprint connecting CIS Level 1, Kyverno, Trivy, Falco, identity, observability, and evidence."
tags: "kubernetes, platform-operations, security, kspm, gitops"
image: blog/images/2026-09-03-security-control-paths.svg
---

# Platform Security Operations: From Controls to Evidence

A Kubernetes cluster can pass a security scan and still be unsafe. A valid Pod
can start a compromised process. A strong policy can exist while its admission
controller is unavailable. A dashboard can stay green after its data source
has stopped sending results.

This is why platform security needs several controls working together. Some
prevent unsafe changes, some find known risk, and some detect activity at
runtime. They must also leave useful evidence and tell operators when that
evidence is missing.

This guide is for platform operators who own security posture, prevention,
detection, evidence, and response for Kubernetes. Security engineers can review
the control design. Release reviewers can use the final section for sign-off.
A short
[platform operations overview](blog.html?post=2026-09-03-platform-operations)
explains how this discipline relates to Reliability and Remediation Operations
and Lifecycle and Continuity Operations.

The named products define the opinionated toolchain in this blueprint.

## The Security Story in One View

Every component should answer a clear operational question. If it cannot, it
is difficult to configure, monitor, or justify.

| Question                                               | Control                                                                                                                      | When it works                                                   | Detailed evidence                                                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Does the cluster align with the CIS Level 1 baseline?  | Distribution CIS Level 1 profile and self-assessment, with Trivy Operator for automated infrastructure and compliance checks | During installation, after an upgrade, and on a schedule        | Trivy compliance and infrastructure reports for every eligible node, plus manual checks and exceptions |
| Is a Pod specification acceptable?                     | Pod Security Admission (PSA) and Kyverno                                                                                     | At admission and during background review                       | Admission warnings, `PolicyReport`, `ClusterPolicyReport`, and `PolicyException` objects               |
| What known risk is present in the deployed state?      | Trivy Operator                                                                                                               | After deployment and when vulnerability or scanner data changes | Trivy Kubernetes report objects and scan Job state                                                     |
| What suspicious activity occurs while a workload runs? | Falco                                                                                                                        | During process execution on each Linux node                     | Structured Falco events with node, Pod, container, process, rule, and time context                     |
| Who can call a platform service?                       | Keycloak, Open Policy Agent (OPA), and Apache APISIX                                                                         | For each external request                                       | Identity claims, policy decision, gateway access record, and audit identifier                          |
| What can a workload access?                            | Kubernetes RBAC and NetworkPolicy                                                                                            | For Kubernetes API and Pod network access                       | Effective permissions, policy definitions, and allowed and denied test results                         |
| How does a secret or certificate reach a workload?     | Sealed Secrets, External Secrets Operator (ESO), and cert-manager                                                            | During secret synchronization and certificate issue or renewal  | Controller state, Kubernetes resources, and error records                                              |
| What needs a response?                                 | Grafana Alloy, Loki, Prometheus, Grafana, Alertmanager, and Keep                                                             | During normal operation and incidents                           | Detailed records, health metrics, dashboards, alerts, and response state                               |

![Security control paths](blog/images/2026-09-03-security-control-paths.svg "Workload, runtime, request, and operator evidence paths in the platform security model.")

The important difference is when each control works. Admission controls act
before a workload change is accepted. Scanners inspect what is deployed.
Runtime detection observes what a process actually does. Evidence from all
three paths feeds monitoring and response.

## Why Kyverno, Trivy, and Falco Belong Together

| Control | Main question                                                                 | Can prevent a change?  | Important limit                                                                                      |
| ------- | ----------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| Kyverno | May this Kubernetes object be created or changed?                             | Yes, in `Enforce` mode | It does not find package vulnerabilities or observe process activity.                                |
| Trivy   | What known image, configuration, RBAC, secret, or compliance risk exists now? | No                     | It scans state. It does not show what a process does while it runs.                                  |
| Falco   | Is a running process doing something that matches a detection rule?           | No, not by itself      | It detects selected behavior. It does not prove that an image is safe or that the cluster meets CIS. |

The three tools overlap just enough to support each other, but they do not
replace one another. Trivy and Kyverno first find unsafe configurations and
show whether workloads are compatible. Enforcement follows only for stable
rules that representative workloads can meet. Scanning continues because
objects, packages, and vulnerability data can change after admission.

Falco is the runtime detection component. It is necessary because a valid Pod
specification and a scanned image can still run a compromised process. Falco
uses Linux kernel events to detect actions such as an unexpected shell, access
to a sensitive file, a privilege change, or an unexpected connection. It adds
container and Kubernetes context.

Falco is a detection control, not a prevention control. This blueprint does not
let a Falco event stop a Pod automatically. An operator first assesses the
event and selects the response. This boundary prevents an untested or noisy
rule from causing an outage.

## The CIS Baseline Comes First

The Center for Internet Security (CIS) publishes hardening recommendations. Its
Kubernetes benchmark covers the control plane, nodes, identity, audit, network
policy, RBAC, and workloads.

**CIS Level 1 is a well-established and suitable target for a non-critical
system.** It is therefore the baseline for this blueprint. The goal is to meet
CIS Level 1 on every eligible cluster node and to record every manual check and
accepted exception. Representative workloads prove compatibility with this
baseline before enforcement.

CIS gives the platform a shared hardening baseline, but it is not Kubernetes
API conformance, a product certificate, or proof that a cluster is secure. A
result only has meaning when it carries enough context. A useful result records:

- Kubernetes distribution and version
- benchmark name and version
- scanner and rule version
- tested server and agent nodes
- automated, manual, and not-applicable checks
- accepted exceptions and assessment time

The platform records the CIS Level 1 benchmark version before it configures the
scanner profile. Benchmark scope and Kubernetes version support change over
time, so the benchmark must support the installed distribution and version.
The distribution hardening guide and self-assessment cover its specific and
manual checks. The benchmark result and the distribution assessment remain
separate records.

Trivy Operator is the platform scanner for automated infrastructure,
configuration, and CIS compliance checks. Its node collector gathers the node
configuration that the scanner needs. The operator stores detailed findings in
`InfraAssessmentReport`, `ClusterInfraAssessmentReport`, and
`ClusterComplianceReport` objects. These records make results visible in the
cluster and allow Prometheus and Grafana to show coverage, age, and trends.

A Trivy report is useful because it makes drift visible, but its compliance
profile must match the recorded CIS Level 1 benchmark. For example, a profile
named `k8s-cis-1.23` is a specific Trivy check bundle; its name does not prove
compatibility with another Kubernetes or distribution-specific benchmark.
Trivy does not complete manual controls. The matching distribution
self-assessment covers those controls, and sign-off uses both records.

This leads to a repeatable installation and upgrade workflow:

1. The platform record identifies the distribution, Kubernetes version, and
   role of each node.
2. Each node type uses the supported CIS Level 1 distribution profile.
3. The matching distribution guide and self-assessment cover manual controls.
4. The Trivy compliance profile maps to the recorded CIS Level 1 benchmark.
5. Trivy infrastructure and compliance checks cover every eligible node.
6. `PASS`, `FAIL`, `WARN`, `MANUAL`, and `NOT APPLICABLE` remain separate
   results.
7. Scheduled Trivy reports reveal later configuration and compliance drift.
8. PSA and Kyverno prevent reviewed workload problems from returning.

Falco does not replace any step in this assessment. It adds runtime evidence
after the workload starts.

## From Audit to Enforcement

Native PSA gives each namespace a clear Pod security boundary. Kyverno adds
custom rules, background checks, reports, and reviewed exceptions. Together
they can prevent known workload mistakes, but only after real workloads have
shown that the rules are compatible.

The PSA `audit` and `warn` versions must match the tested Kubernetes version.
Kyverno Pod Security rules use the same version where the installed release
supports it. A version difference remains a recorded gap because a pass against
an older rule does not prove a pass against the cluster rule.

New Kyverno policies start in `Audit` mode. This makes the effect visible
without blocking a deployment. A policy moves to `Enforce` only after
representative workloads complete these steps:

1. One test namespace receives version-pinned `audit` and `warn` labels.
2. A representative workload restarts or receives an update.
3. PSA warnings and Kyverno reports show the policy effect.
4. A required correction changes the owning controller template, not only the
   current Pod.
5. Installation, upgrade, scale, restart, backup, and recovery tests pass.
6. The namespace changes to `enforce` only when known workloads pass.

```bash
kubectl get namespace <namespace> --show-labels
kubectl get policyreport -A
kubectl get clusterpolicyreport
kubectl get policyexception -n kyverno-system
```

Enforced policies use `failurePolicy: Fail`. This setting prevents a failed
webhook from bypassing the security boundary. The accepted consequence is that
an unavailable webhook can block affected changes. Kyverno therefore runs with
redundant controllers, and a tested webhook failure path confirms fail-closed
behavior before enforcement.

Report retention is part of the control design. When reports omit `pass` or
`skip`, metrics preserve those results. A `skip` is not a pass. Each
`PolicyException` needs an owner, reason, narrow scope, compensating control,
and review date. Kyverno does not automatically expire an exception on that
date.

## Continuous Scanning with Trivy

Admission is only one point in time. Images, packages, configuration, and
vulnerability data continue to change, so scanning must continue after a
workload is accepted. Trivy reports image vulnerabilities, exposed secret
patterns, unsafe configuration, excessive RBAC, cluster compliance, and
software contents. Kubernetes report objects contain the detailed findings.
The first command below shows which report resources exist in the installed
operator version. Namespaced and cluster-scoped reports then remain separate in
the inspection commands.

```bash
kubectl api-resources --api-group=aquasecurity.github.io

kubectl get vulnerabilityreports,exposedsecretsreports,configauditreports -A
kubectl get rbacassessmentreports,infraassessmentreports,sbomreports -A

kubectl get clustervulnerabilityreports,clusterconfigauditreports
kubectl get clusterrbacassessmentreports,clusterinfraassessmentreports
kubectl get clustersbomreports,clustercompliancereports

kubectl get jobs -n trivy-system
```

A low finding count does not prove coverage. Coverage compares active image
digests with current reports and includes failed Jobs, old reports, missing
namespaces, and unscanned nodes. Exposure and impact determine the remediation
priority.

The scan configuration defines severity, unknown-result, and unfixed-result
scope. Each excluded class is a coverage limit. An ignore rule becomes reliable
only after a test with one known match and one known non-match.

The CI build scan covers the state before deployment, while Trivy Operator
covers the deployed state. The build scan finds known risk early. The operator
shows what is actually running in the cluster. One result does not prove that
the other scan occurred.

## Runtime Visibility with Falco

There is still a gap after policy and scanning: neither control can see how a
process behaves after startup. Falco fills that gap. Kyverno sees the requested
object, Trivy sees configuration and known image content, and Falco detects
selected process activity. Every applicable Linux node needs a sensor, and its
structured events feed the platform evidence and response systems.

A staged compatibility test establishes that Falco operates safely:

1. The official Falco Helm chart installs one DaemonSet sensor on every
   applicable Linux node.
2. Falco uses the modern eBPF driver. Kernel support for this driver is a node
   prerequisite. Falco, driver, plug-in, and rule versions are pinned.
3. The sensor receives only the host access and Linux capabilities required by
   the modern eBPF driver. A narrow PSA and Kyverno exception records the need;
   installation convenience does not justify broad privilege.
4. Maintained rules provide the starting point. Tests cover an unexpected
   shell, writes to protected paths, privilege changes, and unexpected
   connections.
5. Known platform behavior receives narrow, rule-specific exceptions with an
   owner, reason, scope, and review date. One noisy event does not justify
   disabling a broad rule group.
6. CPU, memory, event rate, kernel event drops, output drops, and delivery delay
   show the effect of workload activity on sensor load.
7. Every node class receives a safe test event after installation, kernel or
   Kubernetes upgrades, and Falco rule changes.

Falco produces events, not Kubernetes policy report objects. JSON output gives
the evidence path a stable structure. A useful event record includes:

- event time, rule, priority, tags, and source
- cluster, node, namespace, Pod, container, and image identity
- process, parent process, user, system call, file, or connection context
- Falco and rule version

File paths, commands, connection values, and other high-volume data do not
belong in Prometheus labels. These values can make Prometheus expensive and can
contain sensitive data. Full events belong in Loki. Metrics carry health,
rates, counts, and trends.

Falco writes unbuffered JSON events to its Pod log. Grafana Alloy collects this
log and sends it to Loki. Grafana reads the detailed events from Loki. Loki
alert rules send high-priority alerts to Alertmanager, which routes them to
Keep. This single event path prevents duplicate records and incidents:

```text
Falco JSON -> Pod log -> Grafana Alloy -> Loki -> Grafana
                                      |
                                      +-> Loki alert rule
                                          -> Alertmanager -> Keep
```

An end-to-end test proves more than a ready Falco Pod. It shows that the driver
captures events and that operators receive them. Rule tuning and testing
maintain alert quality. Response remains operator-led.

## Security Data as Useful Evidence

A finding is only useful when an operator can inspect it. Each control has a
different detailed record:

| Control        | Detailed record                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Kyverno        | `PolicyReport`, `ClusterPolicyReport`, and `PolicyException` objects                            |
| Trivy          | Vulnerability, secret, configuration, RBAC, infrastructure, compliance, and SBOM report objects |
| Falco          | Structured runtime event in Falco output and the retained Loki record                           |
| Kubernetes API | API audit event retained in Loki                                                                |
| Request access | Gateway record linked to the identity and policy decision                                       |

Kubernetes reports show current state, not an immutable history. One Kubernetes
object for each Falco event can overload the API and gives poor retention.
Runtime events therefore belong in Loki.

Grafana brings these sources together as an operational overview. It helps an
operator find the detailed record; it does not replace that record. Each
security dashboard must answer:

| Question                | Required evidence                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Is collection healthy?  | Ready controllers and sensors, Prometheus targets, failed scan Jobs, Falco driver state, and delivery errors             |
| Is the result current?  | Last scan, report, metric, and Falco health time, with an alert for missing updates                                      |
| Is the cluster covered? | Active images compared with Trivy reports, eligible nodes compared with CIS and Falco coverage, and monitored namespaces |
| What changed?           | Trends by policy, benchmark, rule, priority, severity, namespace, and tool version                                       |
| Where is the detail?    | Resource identity and a link or command that opens the Kubernetes report, Loki event, or audit record                    |
| What was accepted?      | Exception owner, reason, scope, compensating control, and review date                                                    |

For Falco, a useful dashboard shows sensor count versus eligible nodes, event
rate, kernel and output drops, rule version, events by rule and priority, and
delivery delay. A ready DaemonSet Pod does not prove event capture.

A dashboard that shows totals only can hide a failed collector or an old scan.
Security sign-off also needs report age, expected versus scanned resources,
Falco coverage, and links to detailed records.

## The Rest of the Request Path

### Identity and request authorization

In this toolchain, Keycloak authenticates the caller, OPA decides whether the
request is allowed, and APISIX enforces that decision. After a route, client,
role, or policy change, one allowed identity and one denied identity test the
policy boundary. A separate direct-backend check confirms that no unprotected
route bypasses the gateway. A successful login tests identity only; it does
not test authorization.

### Kubernetes permissions and network paths

RBAC controls Kubernetes API actions. NetworkPolicy controls selected Pod
network paths. Effective permission review and one allowed and one denied
network flow establish the actual boundary. The result must also show that the
cluster network plug-in enforces NetworkPolicy. DNS, the Kubernetes API, object
storage, identity services, databases, and cloud metadata endpoints are
high-value paths.

```bash
kubectl auth can-i --list \
  --as=system:serviceaccount:<namespace>:<account> \
  -n <namespace>
```

### Secrets and certificates

Sealed Secrets protects encrypted values stored in Git, which makes protection
of the controller key essential. ESO synchronizes values from the external
secret store. Both create Kubernetes Secrets, so RBAC still controls access to
the plain value.

cert-manager creates and renews TLS certificates. `Certificate`,
`CertificateRequest`, `Order`, and `Challenge` resources show the health of
that process. A valid certificate protects a connection to the named endpoint.
It does not authorize the caller or prove that all internal paths use TLS.

## Testing the Whole Response Path

Kubernetes API server audit events provide request-level evidence. Grafana
Alloy removes request and response bodies, adds security fields, and sends the
result to Loki. Loki alert rules detect RBAC changes, Pod `exec`, impersonation,
bursts of Secret access, and bursts of forbidden requests. Prometheus stores
control health metrics. Alertmanager routes alerts to Keep.

Collection is not proven until a known event reaches an operator. After
installation and upgrades, a safe test event needs a trace from its source to
Loki, Grafana, Alertmanager, and Keep. A safe Falco event in a disposable
workload needs the same trace through its rule, structured event, alert, and
response. Staging uses the Falco event generator with a reviewed set of safe
actions. Actions that change system files do not run in production.

Missing data needs its own test. Isolation of a test source should trigger its
health alert. A healthy Grafana page does not prove that Alloy, Trivy, Kyverno,
or Falco is producing current evidence.

## Sign-off Evidence

Security sign-off uses the checks below. Each check retains its command or test
output, object names, time range, and links to the detailed records.

1. **Platform and node identity.** The reviewer runs `kubectl version` and
   `kubectl get nodes -o wide`. **Pass:** The recorded distribution, Kubernetes
   version, node roles, operating-system versions, and node count match the
   command output.
2. **CIS Level 1 coverage.** The reviewer opens the newest
   `ClusterComplianceReport`, infrastructure reports, and manual
   self-assessment. **Pass:** The report names the approved CIS Level 1 profile,
   every eligible node has a current infrastructure result, and every `FAIL`,
   `WARN`, `MANUAL`, and `NOT APPLICABLE` result has a recorded disposition.
3. **Pod admission.** A compliant Pod, a Pod that violates the PSA baseline,
   and a Pod that violates a Kyverno rule are submitted in the test namespace.
   **Pass:** The compliant Pod is accepted, both violating Pods are denied by
   the named control, and the Kyverno report contains the expected resource and
   policy names.
4. **Fail-closed admission.** The Kyverno admission webhook is interrupted in
   the test cluster and the violating request is repeated. **Pass:** The request
   is rejected, no request bypasses the enforced rule, and admission returns to
   normal after the redundant controller recovers.
5. **Trivy coverage and freshness.** Active workload image digests and eligible
   nodes are compared with Trivy reports and scan Jobs. **Pass:** Every digest
   and node has a report newer than the configured scan interval, no scan Job
   is failed, and every critical finding has an owner and response record.
6. **Exceptions.** Kyverno exceptions, ignored Trivy findings, and accepted CIS
   gaps are listed. **Pass:** Every entry has an owner, reason, narrow scope,
   compensating control, and future review date; no expired entry remains
   active.
7. **Falco coverage and delivery.** Falco DaemonSet Pods are compared with
   eligible Linux nodes, and a reviewed safe event runs in a disposable Pod.
   **Pass:** One Falco Pod is ready on every eligible node, the event appears in
   Loki and Grafana within five minutes, the alert reaches Alertmanager and
   Keep, and Falco reports no unexplained kernel or output drops.
8. **Kubernetes API audit.** A test account reads a test ConfigMap and attempts
   a denied read of a test Secret. **Pass:** Loki contains both API audit events
   with actor, verb, object, result, and time; the denied request creates the
   expected alert in Keep.
9. **Identity and gateway enforcement.** An allowed identity and a denied
   identity request the same protected route, followed by a direct-backend
   request. **Pass:** APISIX permits the allowed request, denies the other two,
   and the gateway record links the Keycloak identity and OPA decision with one
   audit identifier.
10. **RBAC and network boundaries.** The named service account is checked with
    `kubectl auth can-i`, followed by one allowed and one denied network probe.
    **Pass:** The API permissions and network results match the approved access
    matrix, and the cluster network plug-in enforces the denied path.
11. **Secret handling.** One unique non-production marker passes through Sealed
    Secrets and a second marker passes through ESO. **Pass:** The disposable
    workload receives both values, while searches of Git, Loki, and report
    output find no plain-text copy of either marker.
12. **Certificate issue and use.** The reviewer inspects the cert-manager
    `Certificate` and performs a TLS connection to its public hostname.
    **Pass:** The resource is `Ready`, the chain and hostname validate, and more
    than 30 days remain before expiry.
13. **Dashboard freshness and detail.** A test telemetry source is interrupted
    and restored. **Pass:** Grafana marks the source stale within two collection
    intervals, the missing-data alert reaches Keep, and every panel used for
    sign-off opens the matching Kubernetes or Loki record.

Security sign-off passes only when all checks pass. An installed product or a
green total without a current detailed record does not pass.

## Continue the Series

- Start with the
  [platform operations overview](blog.html?post=2026-09-03-platform-operations).
- Continue with
  [Platform Reliability and Remediation Operations](blog.html?post=2026-09-04-reliability-and-remediation-operations).
- Explore
  [Platform Lifecycle and Continuity Operations](blog.html?post=2026-09-05-platform-lifecycle-and-continuity-operations).

## About Versioneer's Platform Operations

Versioneer provides Kubernetes clusters that run in our customers' cloud
environments. This operating model keeps
Kubernetes Security Posture Management (KSPM)
in our hands while the infrastructure remains under customer control. We use
established, automated GitOps practices to operate Kubernetes fleets
consistently on customer infrastructure. This series captures the common
principles that guide our platform operations.
