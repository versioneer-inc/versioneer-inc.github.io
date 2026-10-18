---
date: 2026-09-09
title: "STAC Should Explain Data Access Without Guesswork"
description: "A STAC search can succeed while the first data read fails. The missing handoff to GDAL brings together fair access, cloud costs, and short-lived S3 credentials."
image: "blog/images/2026-09-09-stac-access-hero.png"
tags: "earth-observation, stac, metadata, data-access, authentication, s3, sigv4, cloud-native-data"
origin_title: Medium
origin_url: https://medium.com/@stefan.achtsnit_41940/stac-should-explain-data-access-without-guesswork-10c6053cd551
---

# STAC Should Explain Data Access Without Guesswork

![STAC finds an asset; access metadata guides the credential handoff so GDAL workers can read COG data through S3.](blog/images/2026-09-09-stac-access-hero.svg)

You query a STAC API, filter by area and cloud cover, and find the scene you
want. The metadata looks right. You pass the asset URL to rasterio or
rioxarray and try to read a band.

`403 Forbidden`.

Now you are reading provider documentation instead of satellite data. An API
key might be missing. Perhaps the URL must be signed first, or the storage
driver expects credentials from a cloud account. The search took a few lines
of Python; now you have to work out how to configure the storage reader.

We put considerable care into formats, storage, and catalog metadata for
Earth observation (EO). Getting credentials into the reader deserves the
same attention as finding the right scene.

In our EOEPCA+ and EarthCODE work, we want STAC to describe the access flow
alongside the bands, dates, and locations.

## The gap between the catalog client and the reader

The [SpatioTemporal Asset Catalog (STAC) specification](https://stacspec.org/en/about/stac-spec/)
lets different providers describe their data in a common structure. A client
can search by place and time, inspect the results, and extract an asset's
`href`.

A notebook can use [pystac-client](https://pystac-client.readthedocs.io/en/stable/usage.html)
to find scenes, then pass the items to
[odc-stac](https://odc-stac.readthedocs.io/en/latest/) or
[stackstac](https://stackstac.readthedocs.io/en/latest/) for lazy reads into
xarray. For local processing, [stac-asset](https://github.com/stac-utils/stac-asset)
can download the linked files. Some helpers choose a client from the asset
URL, but a familiar hostname cannot reliably describe the required
authentication flow.

Rasterio and rioxarray read through GDAL; `fsspec` uses backends such as
`s3fs`. Their storage credentials are separate from the catalog client's
HTTP session.

For an S3 asset, GDAL's
[/vsis3/ handler](https://gdal.org/en/stable/user/virtual_file_systems.html#vsis3-aws-s3-files)
accepts settings such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and
`AWS_SESSION_TOKEN`, along with the endpoint and region. A signed-in catalog
session does not populate those settings. A notebook may then require a
setup cell that obtains a token, prepares S3 credentials, and connects the
reader's refresh mechanism.

A Cloud Optimized GeoTIFF (COG) makes this more demanding. The reader uses
[HTTP range requests](https://docs.ogc.org/is/21-026/21-026.html) to fetch
selected parts of the image. Opening one asset can mean many storage
requests. A Zarr workflow can likewise read many separate chunk objects.
The access setup has to remain valid throughout those reads.

For a short notebook, a helper function may be enough. Move the analysis to
a Dask or Ray cluster and the same setup has to work across many processes,
possibly for hours. A token that was valid when the job started may expire
before the last worker opens its next file. Updating credentials in the
notebook does not necessarily update a running worker's storage client.

We want shared tooling to handle that handoff from `href` to read, using
access instructions published with the metadata.

## Public reads, shared capacity, real bills

Anonymous public access avoids much of this setup. The
[Sentinel-2 COG archive on AWS](https://registry.opendata.aws/sentinel-2-l2a-cogs/),
for example, combines STAC discovery with reads that require no AWS account.
For a workshop, a new research idea, or a public map, that is a welcome place
to start. Many EO collections are still offered this way.

Public reads generate request and data-transfer bills alongside storage
costs. Moving data between cloud regions or out over the internet can incur
egress charges. [S3 pricing](https://aws.amazon.com/s3/pricing/) separates
these charges, and the hosting or sponsorship arrangement determines who
pays them.

Reading a small part of a COG saves bytes compared with downloading the whole
image. A large Dask job can still send millions of range requests across
cloud boundaries. Retries and repeated reads increase both the request count
and the traffic. The provider still has to budget for all of those reads,
even when each worker requests only the pixels it needs.

A researcher inspecting two scenes can share a service with a production
pipeline running hundreds of workers. Both workloads may be legitimate, but
where bandwidth, request capacity, or gateway resources are shared, the larger
job can leave less room for everyone else. This is the noisy-neighbor problem.

A provider can apply IP-based rate limits to anonymous traffic. But a
university or cloud platform may put many unrelated users behind one address.
That is a poor boundary for deciding whose job should slow down. With a
project or workload identity, the provider has a better basis for allocating
capacity, diagnosing a retry loop, or contacting its owner.

Public access does not necessarily mean fair access. The
[Copernicus Data Space Ecosystem](https://documentation.dataspace.copernicus.eu/Quotas.html)
uses account quotas to share free resources fairly, reducing download speed
when a user exceeds their allowance.
[ECMWF](https://www.ecmwf.int/en/about/media-centre/focus/2026/minutes-matter-how-ecmwf-delivers-time-critical-data-global-scale)
also uses queues, throttling, and fair-use limits to prevent congestion and
support equitable access to its data services.

## Requester Pays changes who gets the bill

[S3 Requester Pays](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RequesterPaysBuckets.html)
addresses the delivery costs directly. The bucket owner pays for storage;
the requester pays for requests and downloads. S3 authenticates the request
to identify the account to charge, and the client must explicitly accept the
charges.

For a provider hosting a large archive, this can make a substantial
difference. A heavy user takes on its delivery costs instead of passing them
to the host.

For that workshop or small research group, the extra step may be harder to
justify. Someone must arrange a billing account, configure the tools, and
accept the financial responsibility. A collection can be openly licensed
and still be difficult to use within a particular institution's account and
budget rules.

Requester Pays changes who funds requests and downloads. Sharing capacity
fairly still requires separate controls, and users still need a billing
account and configured tools.

Sometimes the provider is willing to fund public reads and simply wants to
know which project is making them. Authentication can support that. A
service can remain free to read while applying a quota per project or
workload. Restricted collections may require additional permissions, but
identifying a caller already has value for an open collection.

## Keep a stable link and decide access when it is used

A client can discover a stable asset URL first and request a temporary
signed URL when it is ready to read.
[Microsoft Planetary Computer](https://planetarycomputer.microsoft.com/docs/concepts/sas/)
uses a signing service for Azure Blob assets. Its `planetary_computer.sign`
helper obtains a Shared Access Signature (SAS) token and adds it to the asset
URL. The reader then uses that URL to fetch data directly from storage.

Planetary Computer's public signing service accepts anonymous requests. The
signature authorizes storage access, so a signed URL does not necessarily
identify the person using it. The service can still vary rate limits and
token lifetimes, including when a subscription key is supplied. It is an
example of open data served through an access step, rather than a requirement
for every reader to have an account.

In our own work, we often put a redirect in front of storage, for example in
[packageR](https://github.com/versioneer-tech/package-r). The STAC asset
contains a stable public URL. When a client requests it, a small service
creates a short-lived presigned URL and returns a temporary HTTP redirect.
The client follows it, and object storage serves the bytes.

This lets us keep the published link while applying access rules at the
redirect service. We can expose one collection or asset, introduce
project-based limits, or require authentication for a particular resource.
The bucket can stay private, and a large raster does not have to pass through
the application server. Temporary signed URLs stay out of the catalog.

The redirect service can become a bottleneck when many workers open assets
at once. Readers must also follow redirects correctly, preserve range
requests, and obtain a new signed URL when the old one expires. Testing a
browser download does not establish that the same flow works through a
geospatial driver.

An anonymous redirect also remains anonymous. To account for usage by project,
we authenticate the request before issuing the storage link. That distinction
matters when deciding what the access step is meant to achieve.

## Let STAC describe the access conversation

OAuth 2.0, HTTP bearer tokens, and AWS Signature Version 4 (SigV4) are already
widely used. What is missing across providers is a consistent description of
how to connect them for a particular asset.

An S3 credential helper still needs to know where to get a token, whether to
exchange it, and which permissions to request. Those instructions belong
with the asset metadata, so each notebook can use the same integration.

The [STAC Authentication extension](https://github.com/stac-extensions/authentication)
provides fields for that description. `auth:schemes` defines access schemes;
`auth:refs` connects assets and links to those schemes. Its token-exchange
work describes the token endpoint, the input token type, and available
scopes. Schemes can refer to the source of an input token, so a client can
follow the exchange steps from the document.

For HTTP bearer access, the result is a token the reader sends in an
`Authorization: Bearer` header. The extension remains at proposal maturity,
and describing a flow does not mean every client can already execute it.

In EOEPCA+ and EarthCODE, we need STAC metadata to tell clients how to obtain
S3 credentials. We have also learned from colleagues at
[Development Seed](https://developmentseed.org/blog/2026-08-19-foss4g/).
They work on similar access challenges in
[NASA Earthdata workflows](https://docs.maap-project.org/en/ogc/science/NISAR/NISAR_DEM.html)
and [Source Cooperative](https://docs.source.coop/data-proxy):
connecting a user's login to the tools that read the data.

Our starting point is a short-lived access token, for example issued by
Keycloak in JSON Web Token (JWT) format. The reader expects S3 credentials,
so we need a way to connect the two.

We have identified two flows. Both preserve the S3 request format, but they
put the conversion from identity to storage access in different places.

> **Update, 18 October 2026:** We have now submitted a pull request following
> the discussion in [STAC Authentication issue #47](https://github.com/stac-extensions/authentication/issues/47).
> The aim is to standardize how STAC describes the credential flows needed for
> SigV4 requests. That would let credential helpers configure standard S3 tools
> such as AWS CLI, Boto3, rclone, and GDAL from the catalog's access metadata.

### Exchange the token at STS

The familiar route is a Security Token Service (STS). Public clouds offer
this too: [AWS STS](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html),
for example, exchanges identity-provider tokens for temporary access
credentials. The client receives `AccessKeyId`, `SecretAccessKey`, and
`SessionToken`, together with an expiry time.

![STS flow: get a token, exchange it for temporary S3 credentials, sign a request, and read the data.](blog/images/2026-09-09-stac-sts-flow.svg)

The S3 client uses those temporary credentials to sign requests with SigV4.

The [Source Cooperative ADRs](https://github.com/source-cooperative/data.source.coop/tree/main/adrs)
explicitly describe this exchange pattern.

An STS design also creates a place to set a permission ceiling. A platform
token can have a longer lifetime and broader scope, while the storage session
is shorter and limited to the job. A user with write access could request
read-only credentials for a processing run. The gateway then enforces that
ceiling along with the current resource permissions.

The identity provider does not have to describe every storage operation in
the original token, and the job does not carry all of its owner's permissions
into every worker. The cost is an additional service and an exchange whenever
credentials are obtained or refreshed. The provider also has to define and
document which roles clients can assume.

### Put the JWT in the S3 session-token field

This flow skips STS and uses an S3-compatible gateway built to validate
JWT access tokens. Native AWS S3 does not accept an arbitrary JWT as its
session token.

For us, skipping STS is appealing: there is one fewer component to operate
and one fewer credential exchange to manage. We also control which scopes
clients can request and receive from our OpenID Connect (OIDC) provider,
Keycloak. That lets us issue tokens with the scopes the job needs directly
from the identity provider.

We learned the credential pattern from
[Supabase's S3 session-token support](https://supabase.com/docs/guides/storage/s3/authentication#session-token):
the project reference identifies the tenant in the access-key ID field,
while the project's `anonKey` fills the secret-access-key field. The user's
JWT goes in the session-token field. Storage validates the JWT and applies
that user's access policies.

We adapted the idea for our EOEPCA+ and EarthCODE work. SigV4 requires
`SecretAccessKey` to derive its HMAC signing key. We use a fixed signing
value per tenant so standard S3 clients can sign requests and the gateway
can verify them. Our credential profile is:

| S3 credential field | Value in our profile              | Purpose                                             |
| ------------------- | --------------------------------- | --------------------------------------------------- |
| `AccessKeyId`       | Fixed tenant identifier           | Select the tenant and reject unknown tenants early  |
| `SecretAccessKey`   | Agreed fixed value for the tenant | Supply the HMAC key input required by SigV4         |
| `SessionToken`      | Short-lived JWT access token      | Carry identity and access claims for gateway checks |

![Direct JWT flow: get an access token, set tenant values and the JWT session token, sign a request, and let the gateway validate access.](blog/images/2026-09-09-stac-direct-jwt-flow.svg)

The gateway can reject an unknown tenant or a mismatch between the access-key
ID and the requested tenant before validating the JWT. It then verifies the
SigV4 signature and the JWT's signature, issuer, audience, and expiry. The
verified claims and access policies must authorize the requested tenant,
operation, and asset.

In this profile, the fixed signing value is not secret, so SigV4 adds no
independent proof of identity or protection against request forgery. HTTPS
protects requests in transit; access depends on the validated JWT and the
gateway's authorization checks.

With either flow, we can keep using AWS CLI, Boto3, rclone, and GDAL against
the configured S3 endpoint. A credential helper can obtain a token, exchange it at STS or
build the direct JWT credentials, and return the usual key, secret, and
session token. AWS CLI and Boto3 can run the helper command specified by
`credential_process` in an AWS profile. When the helper also returns an
expiry time (`Expiration`), the tool can rerun it automatically before the
credentials expire. The helper integration differs by tool, but token
handling can stay out of the analysis code.

## When all the workers start together

A cluster launch can create a thundering herd at STS when every worker
exchanges its token at once. The direct JWT flow removes that exchange;
the gateway can validate self-contained JWTs locally using cached issuer
public keys.

It does not remove the identity provider. Workers still require valid access
tokens, and a badly coordinated refresh can send them all back to Keycloak at
once. We still have to reuse credentials within their scope, cache them until
refresh is due, and spread refresh requests over time. STS clients can use
those techniques too.

Every worker needs a refresh path that reaches its data reader. For GDAL,
test that path with a dataset kept open across token expiry. Range reads
should reuse credentials without another token exchange.

Both flows can verify credentials without a session database. Permission
checks, quotas, and usage tracking may still require state.

## Connect STAC to the credential provider

Metadata access also has to scale. Indexed, paginated searches let clients
select inputs without listing an archive. Catalog access and asset access
may require different permissions, so the access description has to cover
both.

The S3 metadata we are proposing would tell a credential helper where to get
a token, whether to exchange it at STS, and which credential profile to use.
The reader's credential provider would then call the helper to obtain and
refresh credentials.

A provider should publish the access flow once. Notebooks and workers should
obtain and renew credentials through the same shared integration.
