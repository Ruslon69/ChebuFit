import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { createBarcodeLookupController, type BarcodeContext } from '../../features/food-catalog/application/BarcodeLookupController';
import { foodCatalogProvider } from './catalog';

export function useBarcodeLookup(context: BarcodeContext) {
  const [controller] = useState(() => createBarcodeLookupController(foodCatalogProvider, context));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const [focused, setFocused] = useState(false), [foreground, setForeground] = useState(AppState.currentState === 'active');
  useFocusEffect(useCallback(() => { setFocused(true); return () => { controller.setActive(false); setFocused(false); }; }, [controller]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', value => {
      if (value !== 'active') controller.setActive(false);
      setForeground(value === 'active');
    });
    return () => subscription.remove();
  }, [controller]);
  useEffect(() => { controller.setActive(focused && foreground); return () => controller.setActive(false); }, [controller, focused, foreground]);
  return { controller, state, focused, foreground };
}
