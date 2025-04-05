import { DeviceOptions } from '../../../lib/open-api/model/deviceOptions';
import { DeviceState } from '../../../lib/open-api/model/deviceState';

export interface DeviceStoreState {
  options: DeviceOptions | null;
  state: DeviceState | null;
  loading: boolean;
  error: string | null;
}

export const initialDeviceState: DeviceStoreState = {
  options: null,
  state: null,
  loading: false,
  error: null
}; 