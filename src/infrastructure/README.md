# Infrastructure

Add concrete integrations here when a feature needs one: backend/auth clients,
food database providers, local persistence, and a future watch transport bridge.
Adapters implement interfaces owned by the consuming feature and map external
payloads to domain types. The application root supplies these implementations.

No service client, repository base class, dependency-injection container, or
transport is needed for the current placeholder.
