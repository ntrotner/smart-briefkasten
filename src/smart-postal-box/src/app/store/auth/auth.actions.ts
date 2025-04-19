import { createAction, props } from '@ngrx/store';

export const loginDevice = createAction(
  '[Auth] Login Device',
  props<{ deviceToken: string; baseUrl?: string }>()
);

export const loginDeviceSuccess = createAction(
  '[Auth] Login Device Success',
  props<{ deviceToken: string; deviceJwt: string; baseUrl: string; lastLoginTime: number }>()
);

export const loginDeviceFailure = createAction(
  '[Auth] Login Device Failure',
  props<{ error: string }>()
);

export const logoutDevice = createAction(
  '[Auth] Logout Device'
);

export const logoutDeviceSuccess = createAction(
  '[Auth] Logout Device Success'
);

export const setDeviceJwt = createAction(
  '[Auth] Set Device JWT',
  props<{ deviceJwt: string | null }>()
);

// Action to reset state for adding a new device
export const resetForNewDevice = createAction(
  '[Auth] Reset For New Device'
); 