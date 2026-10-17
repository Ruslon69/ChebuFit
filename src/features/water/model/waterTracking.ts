/** Quantity transition only. Rewards never inspect these quantities. */
export function addWaterPortion(currentMl: number, targetMl: number, portionMl: number) {
  if (![currentMl, targetMl, portionMl].every(Number.isFinite) || targetMl <= 0 || portionMl <= 0) {
    return { consumedMl: currentMl, goalReached: false };
  }
  const consumedMl = Math.min(targetMl, Math.max(0, currentMl) + portionMl);
  return { consumedMl, goalReached: currentMl < targetMl && consumedMl >= targetMl };
}
