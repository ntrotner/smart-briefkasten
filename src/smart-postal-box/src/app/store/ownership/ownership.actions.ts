import { createAction, props } from '@ngrx/store';
import { OwnedDevice } from './ownership.state';

// Load devices
export const loadDevices = createAction(
  '[Ownership] Load Devices'
);

export const loadDevicesSuccess = createAction(
  '[Ownership] Load Devices Success',
  props<{ devices: OwnedDevice[] }>()
);

export const loadDevicesFailure = createAction(
  '[Ownership] Load Devices Failure',
  props<{ error: string }>()
);

// Add device
export const addDevice = createAction(
  '[Ownership] Add Device',
  props<{ deviceToken: string; baseUrl?: string; name?: string }>()
);

export const addDeviceSuccess = createAction(
  '[Ownership] Add Device Success',
  props<{ device: OwnedDevice }>()
);

export const addDeviceFailure = createAction(
  '[Ownership] Add Device Failure',
  props<{ error: string }>()
);

// Remove device
export const removeDevice = createAction(
  '[Ownership] Remove Device',
  props<{ deviceId: string }>()
);

export const removeDeviceSuccess = createAction(
  '[Ownership] Remove Device Success',
  props<{ deviceId: string }>()
);

export const removeDeviceFailure = createAction(
  '[Ownership] Remove Device Failure',
  props<{ error: string }>()
);

// Select device
export const selectDevice = createAction(
  '[Ownership] Select Device',
  props<{ deviceId: string }>()
);

// Update device
export const updateDeviceName = createAction(
  '[Ownership] Update Device Name',
  props<{ deviceId: string; name: string }>()
);