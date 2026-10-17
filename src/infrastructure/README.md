# Infrastructure

`rewards/KeyValueOrangeWalletRepository.ts` implements the rewards-owned repository
using one versioned JSON value per demo/real wallet key. Application composition
supplies AsyncStorage through a narrow port; tests supply a memory-backed port.
Validation/schema handling belongs to the rewards application boundary.

Add backend/auth, food-provider, other local persistence, or watch transport adapters
when their consuming feature needs them. Keep external payloads and SDKs out of
pure domain/application rules. No generic repository base class or DI container.
