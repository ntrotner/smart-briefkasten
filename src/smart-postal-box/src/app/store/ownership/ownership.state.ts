export interface OwnedDevice {
  id: string;
  name: string;
  deviceToken: string;
  baseUrl?: string;
  lastConnected: Date;
}

export interface OwnershipState {
  devices: OwnedDevice[];
  selectedDeviceId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialOwnershipState: OwnershipState = {
  devices: [],
  selectedDeviceId: null,
  loading: false,
  error: null
};
