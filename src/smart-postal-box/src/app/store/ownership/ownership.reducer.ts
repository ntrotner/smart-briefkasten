import { createReducer, on } from '@ngrx/store';
import { initialOwnershipState } from './ownership.state';
import * as OwnershipActions from './ownership.actions';

export const ownershipReducer = createReducer(
  initialOwnershipState,
  
  // Load devices
  on(OwnershipActions.loadDevices, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(OwnershipActions.loadDevicesSuccess, (state, { devices }) => ({
    ...state,
    devices,
    loading: false,
    error: null
  })),
  
  on(OwnershipActions.loadDevicesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Add device
  on(OwnershipActions.addDevice, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(OwnershipActions.addDeviceSuccess, (state, { device }) => {
    // Check if device already exists (by token)
    const existingDeviceIndex = state.devices.findIndex(d => d.deviceToken === device.deviceToken);
    
    // If device exists, update it; otherwise add it
    let updatedDevices;
    if (existingDeviceIndex >= 0) {
      updatedDevices = state.devices.map((d, index) => 
        index === existingDeviceIndex ? { ...d, ...device, lastConnected: new Date() } : d
      );
    } else {
      updatedDevices = [...state.devices, device];
    }
    
    // Set as selected device if it's the first one or explicitly selected
    const selectedDeviceId = state.selectedDeviceId || device.id;
    
    return {
      ...state,
      devices: updatedDevices,
      selectedDeviceId,
      loading: false,
      error: null
    };
  }),
  
  on(OwnershipActions.addDeviceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Remove device
  on(OwnershipActions.removeDevice, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(OwnershipActions.removeDeviceSuccess, (state, { deviceId }) => {
    const updatedDevices = state.devices.filter(device => device.id !== deviceId);
    let selectedDeviceId = state.selectedDeviceId;
    
    // If we removed the selected device, select another one if available
    if (state.selectedDeviceId === deviceId) {
      selectedDeviceId = updatedDevices.length > 0 ? updatedDevices[0].id : null;
    }
    
    return {
      ...state,
      devices: updatedDevices,
      selectedDeviceId,
      loading: false,
      error: null
    };
  }),
  
  on(OwnershipActions.removeDeviceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Select device
  on(OwnershipActions.selectDevice, (state, { deviceId }) => ({
    ...state,
    selectedDeviceId: deviceId
  })),
  
  // Update device name
  on(OwnershipActions.updateDeviceName, (state, { deviceId, name }) => ({
    ...state,
    devices: state.devices.map(device => 
      device.id === deviceId ? { ...device, name } : device
    )
  })),
);
