import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginDevice, (state) => ({
    ...state,
    isLoggedIn: false
  })),
  on(AuthActions.loginDeviceSuccess, (state, { deviceToken, deviceJwt, lastLoginTime }) => ({
    ...state,
    isLoggedIn: true,
    deviceToken,
    deviceJwt,
    lastLoginTime
  })),
  on(AuthActions.loginDeviceFailure, (state) => ({
    ...state,
    isLoggedIn: false,
    deviceJwt: null,
    lastLoginTime: 0
  })),
  on(AuthActions.logoutDevice, (state) => ({
    ...state,
    isLoggedIn: false
  })),
  on(AuthActions.logoutDeviceSuccess, () => ({
    ...initialAuthState
  })),
  on(AuthActions.setDeviceJwt, (state, { deviceJwt }) => ({
    ...state,
    deviceJwt
  }))
); 