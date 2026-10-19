// References only: no image has been approved, generated or bundled yet.
export const exerciseArtworkReservations = {
  'barbell-bench-press': 'assets/exercises/app/barbell-bench-press.png',
  'barbell-back-squat': 'assets/exercises/app/barbell-back-squat.png',
  plank: 'assets/exercises/app/plank.png',
} as const;

// After approval, bind a key here with a literal static require(), as with mascot
// assets. Metro cannot require missing files or resolve dynamic path strings.
// One handle serves both detail and thumbnail; an override is optional, not required.
export const exerciseImageAssets: Readonly<Record<string, number | undefined>> = Object.freeze({});
