import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectDeviceOptions, selectDeviceStateData } from '../../store/device/device.selectors';
import * as DeviceActions from '../../store/device/device.actions';

@Injectable({
  providedIn: 'root'
})
export class DeviceDataService {
  public deviceOptions$ = this.store.select(selectDeviceOptions);
  public deviceState$ = this.store.select(selectDeviceStateData);

  constructor(private store: Store) {}

  loadDeviceData() {
    this.store.dispatch(DeviceActions.loadDeviceData());
  }

  updateDeviceState(state: any) {
    this.store.dispatch(DeviceActions.updateDeviceState({ state }));
  }

  updateDeviceOptions(options: any) {
    this.store.dispatch(DeviceActions.updateDeviceOptions({ options }));
  }
}
