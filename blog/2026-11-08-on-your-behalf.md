---
date: 2026-11-08
title: "Act on Your Behalf: A five-minute token for a STAC export"
description: "Alice narrows her notebook's Kubernetes access for a catalogue export. The Job's S3 access still depends on the workspace credentials it receives."
image: "blog/images/2026-11-08-delegated-workspace-access.svg"
tags: "earth-observation, delegated-access, token-exchange, keycloak"
status: draft
---

# Act on Your Behalf: A five-minute token for a STAC export

Using a five-minute token, Alice's notebook submitted a Job in the STAC
namespace to export three catalogue records to GeoParquet in S3. The token
narrowed the notebook's Kubernetes permissions, while the Job's S3 access
still depended on the workspace credentials passed through a Kubernetes
Secret.

Alice's normal login also lets her provision managed services, connect to
a Kubernetes cluster or virtual cluster, and access other data in her
team's private object storage. Giving an export script that full access
is a large grant of trust for a small task. She needs to read the catalogue
and write one result.

The [STAC with managed PostgreSQL notebook](https://github.com/EOEPCA/workspace/blob/main/docs/getting-started/stac-fastapi-pgstac.ipynb)
follows that export from token request to checked file. The same access
problem applies to a scheduled pipeline
or an agent working on an Earth observation (EO) task.

## The namespace profile Alice needs

Alice has administrator access to `ws-alice/vc0`. She deploys STAC FastAPI
PgSTAC, connects it to the managed `catalog` PostgreSQL database, and
registers three NAIP Items. These are catalogue records; the setup does
not copy the source imagery.

STAC is already connected to the running PostgreSQL database when the
export starts, so the exporter reads the registered Items through STAC
and writes the result to object storage. The namespace profile governs
the Kubernetes operations that start the exporter; STAC's database login
and the S3 output credentials still have their own permissions.

To submit the export with fewer permissions, she needs a namespace access
profile. The [workspace declaration](https://github.com/EOEPCA/workspace/blob/main/setup/examples.yaml)
defines `demo` with the Kubernetes `edit` role in `stac-fastapi-pgstac`.
It also binds the managed PostgreSQL connection into that namespace as
`managed-postgres`. The full declaration is in the linked example.

```yaml
spec:
  users: [alice]
  vclusters:
    vc0:
      groups:
        - name: demo
          namespace: stac-fastapi-pgstac
          role: edit
```

[Provider Datalab](https://provider-datalab.versioneer.at/) prepares these
services and access settings through Crossplane: managed databases,
virtual clusters, and Keycloak clients and role mappings.
[Workspace API](https://github.com/EOEPCA/rm-workspace-api) uses the published
connection references to return service credentials and request token
exchange. Keycloak issues the token; Kubernetes and the data services
enforce the permissions they accept.

Workspace API resolves ready service connections from the Secret
references published by Provider Datalab in `status.connections`.

Alice can inspect the PostgreSQL connection in the workspace UI:

![The Workspace connections view shows PostgreSQL expanded, with its host, port, database, user, and masked password.](blog/images/2026-11-08-workspace-credentials.png "Workspace UI with example connection values: PostgreSQL is expanded and its password is masked.")

## Requesting the five-minute token

The [Workspace token API](https://github.com/EOEPCA/rm-workspace-api/blob/main/docs/workspace-tokens.md)
supports two flows. A request without `scope` returns a workspace
service-account token. A request with configured profile scopes exchanges
the caller's token for one that keeps the user's identity and selected
runtime roles.

Alice requests the `demo` profile:

```bash
curl --get \
  -H 'Authorization: Bearer <user-access-token>' \
  --data-urlencode 'scope=ws-alice:vclusters_vc0_demo' \
  https://api.example.org/workspaces/ws-alice/token
```

The caller must be authorized to issue the token and already hold `ws_api`,
the requested profile roles, and the required audiences. Administrator
status does not bypass these checks. Workspace client credentials stay
on the API server.

The exchanged token keeps Alice's identity, `ws_api`, and
`vcluster_vc0_demo`, without her workspace or cluster administrator roles.
The relevant claims look like this; the user ID is a placeholder, and
other identity and time claims are omitted:

```json
{
  "sub": "<alice-user-id>",
  "aud": ["workspace-api", "ws-alice"],
  "resource_access": {
    "ws-alice": {
      "roles": ["ws_api", "vcluster_vc0_demo"]
    }
  }
}
```

Selecting a connection profile alone would leave her token permissions
intact. The exchange uses a workspace client whose baseline role mapping
contains only `ws_api`. Each configured profile has an optional client
scope mapped to its runtime role. The broader interactive scope is blocked
during exchange, and Workspace API validates the returned identity,
audiences, scopes, and roles. Changing the audience alone would not remove
administrator roles belonging to that same client.

![Alice requests the demo profile through Workspace API. Keycloak exchanges her token, and the result keeps her subject and namespace role while excluding administrator roles.](blog/images/2026-11-08-stac-token-downscoping.svg "Alice keeps her administrator access. The notebook uses the restricted token for the export setup and submission.")

## From the notebook to the Job

[Provider Storage](https://provider-storage.versioneer.at/latest/) supplies
the workspace's S3 connection, including its endpoint and credentials.
Alice runs a notebook cell that uses the exchanged token to request
`s3:primary` from Workspace API. That cell creates the Kubernetes Secret
`catalog-export-storage` with the returned storage credentials. It uses
the restricted Kubernetes connection to apply the Secret, install the
export script and a suspended CronJob template, then start one Job.

Kubernetes supplies the storage credentials to the export Pod through
`envFrom`. Neither Alice's login token nor the exchanged token runs inside
the Pod. The notebook completes the handoff before it starts.

Replacing the submitting token does not change those copied values. The
Secret must be updated when credentials rotate. New export runs pick up
the rotated credentials at startup; a running container keeps its existing
values.

The notebook checks the permissions and verifies the exported file:

| Check                                              | Result                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| Identity and workspace roles                       | Alice's subject; only `ws_api` and `vcluster_vc0_demo`                  |
| Token lifetime                                     | 300 seconds                                                             |
| Create Jobs in `stac-fastapi-pgstac`               | Permission check allowed it; one export Job completed                   |
| Create cluster roles or list Pods in `kube-system` | Both denied by `kubectl auth can-i`                                     |
| Export to `s3://ws-alice/exports/naip.parquet`     | Three records; IDs, geometry, GeoParquet metadata, and checksum checked |

The two denied operations are permission checks. The permitted export is
an actual completed Job: the notebook downloads its GeoParquet output
and checks the contents and checksum. The hourly schedule stays suspended.
The checks cover one small metadata export.

![The vCluster validates the restricted token and applies the demo namespace RoleBinding. Job creation is allowed in stac-fastapi-pgstac; cluster-role creation and kube-system Pod listing are denied by permission checks.](blog/images/2026-11-08-stac-namespace-enforcement.svg "The notebook checks permitted and denied operations, then submits a real export Job.")

## The S3 credentials still belong to the workspace

Alice narrowed what her notebook could do in Kubernetes. The Job still
received the workspace's existing S3 credentials. Selecting `s3:primary`
did not create a policy for `exports/naip.parquet` or limit writes to one
output prefix. The requested filename is a destination, not an enforced
access rule.

The retained `ws_api` role can also resolve other service connections.
A namespace profile does not reduce that permission to one connection.
This matters if Alice hands the token to another process: its Kubernetes
permissions are smaller, but it can still request the service credentials
that role permits.

A credential broker could sit behind Workspace API and use Provider
Datalab's declared access settings. For this export, it would issue
credentials for the permitted inputs and output location, operations,
and lifetime. It would also have to prevent the caller from retrieving
a broader connection. A narrow key is of little help if the same caller
can fetch wider credentials.

On backends that support STS, the broker could request temporary
credentials with a policy restricted to that grant. The connection API
and S3 client would need to carry the session token and expiry as well as
the access key. Other backends need their own supported mechanism.
The notebook does not yet perform that exchange or apply a per-task IAM
policy. A check of that extension would need to show that the export can
read its inputs and write its result, while access to another task's data
or broader credentials fails.

## The role and the runtime

The exchanged token expires after five minutes. An accepted Job continues
after that, and an enabled CronJob can keep creating Jobs. The credentials
inside the Pod have their own lifetime too. The export template therefore
sets a ten-minute Job deadline and permits one retry; the schedule stays
suspended. Stopping the work means stopping active Jobs and any schedule
that could start more.

The namespace role also needs care. Kubernetes RBAC grants add together,
so other bindings to Alice's identity or retained groups could add access
again. The built-in `edit` role allows Secret access and workload creation
in the namespace. It fits this submission example, but is too broad for
a worker that only checks a result. Unrelated credentials should stay
outside a namespace that the worker can edit.

A virtual cluster does not provide every other boundary. In vCluster's
shared-node model, tenant Pods run on the host cluster's nodes. The platform
team still needs host-side quotas, admission rules, and enforced network
policies. ResourceQuota and LimitRange can bound requests and workload
limits; they do not turn a namespace into reserved compute capacity.

## The catalogue outlives the export

Alice can discard an exporter attempt while another colleague continues
to use the same catalogue. The PostgreSQL service and source archive have
a different lifetime from the export Job. Copying them for each attempt
adds storage and transfer work; deleting the worker must leave shared
data intact.

This is where the managed-service contract helps the team. An engineer
declares the services and connections the application needs. The platform
team maintains the operators, capacity, access rules, and recovery
procedures. A shared catalogue needs an owner, retention rules, backups,
and a checked restore procedure. Changes to its schema need coordination
with the people who still use it.

To try the example, start with the [Workspace notebook guide](https://eoepca.readthedocs.io/projects/workspace/en/latest/usage/notebook-guide/).
Change a spatial filter or add a check for missing assets, then have a
colleague run the saved process from a fresh environment. Check the result,
stop the work, and remove the attempt's resources while leaving the
catalogue available.

## Where an agent helps

An agent could help Alice try a Python library and a SQL query for the
same regional export. Both attempts would read the same input snapshot,
write to separate locations, and use the same result checks. An engineer
could inspect either attempt's code, dependencies, and command output,
then continue from a failed step.

The platform enables these patterns with separate working environments
and shared managed services. A vCluster provides the Kubernetes API for
Jobs and services; engineers and agents can use `kubectl`, Helm, and
normal clients within their grants. The exporter, service requests,
connection references, and checks can stay with the code.

For Alice's export, a saved run would include the source revision, image
digest, dependency locks, input snapshot, and expected Item IDs. A colleague
could repeat it from a terminal or continuous integration, while an agent
could call the same steps when trying a change. A fresh run would still
need ready services and valid grants; saved connection references do not
preserve the services or the data behind them.

There is also an identity gap to close. The notebook's token keeps
Alice's subject, but does not identify a separate worker acting for her.
Operational records need to connect the submitting client and selected
profile to the Job, input data, and output, without storing secrets.
[OAuth token exchange](https://www.rfc-editor.org/rfc/rfc8693.html#section-4.1)
already defines `act` for the current actor and `may_act` for a party
authorized to act.

[Keycloak's Token Exchange Delegation](https://www.keycloak.org/securing-apps/token-exchange#_token_exchange_delegation)
is a preview feature, disabled by default. Its client delegation flow
checks delegation permissions and user consent, and can keep the user in
`sub` while identifying the client in `act`. The notebook's profile
exchange does not use that flow. The worker would still need S3 credentials
limited to its task.

A submitted cloud Job can already continue after the laptop closes. An
agent that keeps making decisions needs a remote worker and valid access
for that work. Bring it in while the task needs decisions or code changes.
Once the exporter works, a regular Job can run it.
