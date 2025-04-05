import { createReducer, on } from '@ngrx/store';
import { initialDeviceState } from './device.state';
import * as DeviceActions from './device.actions';

export const deviceReducer = createReducer(
  initialDeviceState,
  on(DeviceActions.loadDeviceData, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(DeviceActions.loadDeviceDataSuccess, (state, { options, state: deviceState }) => ({
    ...state,
    options,
    state: deviceState,
    loading: false,
    error: null
  })),
  on(DeviceActions.loadDeviceDataFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(DeviceActions.updateDeviceState, (state, { state: deviceState }) => ({
    ...state,
    state: deviceState
  })),
  on(DeviceActions.updateDeviceOptions, (state, { options }) => ({
    ...state,
    options
  }))
); 