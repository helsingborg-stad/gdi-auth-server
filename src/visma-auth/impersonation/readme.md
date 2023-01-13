# Impersonation

## Rationale

In order to facilitate a sound process while also having a reasonable pace, impersonation is an option in this project.

Impersonated users comes from a curated list, and
- should be chosen based on presence in federated data (i.e. cases)
- should never be a real person (present, future or historical)
- should never occur in any situation subject to policy or legislation

## Solution overview

The server detects wether impersonation is an option and if so,
- decorates/intercepts the default Visma login method with a redirect to a page allowing user to chose impersonation
- the page allows proceeding as usual to Visma, or, a fake login using an impersonation
- Systems depending on this API should continue to function unmodified

The impersonation routes/pages are not registered in the runtime unless there is a configured list of impersonations.
