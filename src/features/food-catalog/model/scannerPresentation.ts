export type CameraPermissionState = 'checking' | 'request' | 'granted' | 'denied' | 'settings';
export function cameraPermissionState(permission: null | { granted: boolean; canAskAgain: boolean; status: string }): CameraPermissionState {
  if (!permission) return 'checking';
  if (permission.granted) return 'granted';
  if (!permission.canAskAgain) return 'settings';
  return permission.status === 'undetermined' ? 'request' : 'denied';
}
export function shouldMountScanner(input: { focused: boolean; foreground: boolean; permission: CameraPermissionState; unavailable: boolean; manual: boolean; lookupStatus: string }) {
  return input.focused && input.foreground && input.permission === 'granted' && !input.unavailable && !input.manual && input.lookupStatus === 'idle';
}
