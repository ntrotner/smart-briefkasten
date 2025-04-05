import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DeviceStoreState } from './device.state';

export const selectDeviceFeature = createFeatureSelector<DeviceStoreState>('device');

export const selectDeviceOptions = createSelector(
  selectDeviceFeature,
  (state: DeviceStoreState) => state.options
);

export const selectDeviceStateData = createSelector(
  selectDeviceFeature,
  (state: DeviceStoreState) => state.state
);

export const selectDeviceLoading = createSelector(
  selectDeviceFeature,
  (state: DeviceStoreState) => state.loading
);

export const selectDeviceError = createSelector(
  selectDeviceFeature,
  (state: DeviceStoreState) => state.error
);

export const selectStateChangePending = createSelector(
  selectDeviceFeature,
  (state: DeviceStoreState) => state.stateChangePending
); 