# Workouts

Owns exercises, workout definitions, and logged sessions. Future sessions must be
independent of screens and platforms so iPhone and Apple Watch can exchange the
same logical session. Stable identifiers and explicit sync/version semantics
must be designed with the session model before synchronization is implemented.

Exercise media should describe an ordered set of static key-position images as
the primary representation, with an optional animation asset alongside it.
Keep asset references and metadata separate from the UI renderer. Add actual
exercise artwork under this feature when needed; app icons remain in root assets.
