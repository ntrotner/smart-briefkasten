import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OwnershipState } from './ownership.state';

export const selectOwnershipState = createFeatureSelector<OwnershipState>('ownership');

export const selectAllDevices = createSelector(
  selectOwnershipState,
  (state: OwnershipState) => state.devices
);

export const selectDevicesLoading = createSelector(
  selectOwnershipState,
  (state: OwnershipState) => state.loading
);

export const selectDevicesError = createSelector(
  selectOwnershipState,
  (state: OwnershipState) => state.error
);

export const selectSelectedDeviceId = createSelector(
  selectOwnershipState,
  (state: OwnershipState) => state.selectedDeviceId
);

export const selectSelectedDevice = createSelector(
  selectOwnershipState,
  (state: OwnershipState) => state.devices.find(device => device.id === state.selectedDeviceId) || null
);

export const selectHasDevices = createSelector(
  selectAllDevices,
  (devices) => devices.length > 0
);
