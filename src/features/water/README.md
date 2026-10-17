# Water

`model/waterTracking.ts` owns the pure capped portion/goal-transition calculation.
Today retains local quantity state and emits a goal-reached fact only on an actual
below-goal → goal transition. Water amount persistence and a full water screen are
not implemented. Application composition handles reward events and local calendar
context; the water model does not import the reward engine.
