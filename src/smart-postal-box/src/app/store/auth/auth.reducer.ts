import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginDevice, (state, { baseUrl }) => ({
    ...state,
    isLoggedIn: false,
    baseUrl: baseUrl || state.baseUrl
  })),
  on(AuthActions.loginDeviceSuccess, (state, { deviceToken, deviceJwt, baseUrl, lastLoginTime }) => ({
    ...state,
    isLoggedIn: true,
    deviceToken,
    deviceJwt,
    baseUrl,
    lastLoginTime: Date.now()
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
  on(AuthActions.logoutDeviceSuccess, (state) => ({
    ...initialAuthState,
    baseUrl: state.baseUrl
  })),
  on(AuthActions.setDeviceJwt, (state, { deviceJwt }) => ({
    ...state,
    deviceJwt
  }))
); 