import { Injectable, signal } from '@angular/core';
import { DeviceOptions, DeviceState } from 'src/lib/open-api';

@Injectable({
  providedIn: 'root'
})
export class DeviceDataService {
  /**
   * Device options
   */
  private deviceOptions = signal<DeviceOptions>({});
  /**
   * Public Device options
   */
  public deviceOptions$ = this.deviceOptions.asReadonly();

  /**
   * Device data
   */
  private deviceState = signal<DeviceState>({
    state: 'closed',
  });

  /**
   * Public Device state
   */
  public deviceState$ = this.deviceState.asReadonly();

  constructor() {
    setTimeout(() => {
      this.deviceOptions.set({
        name: 'Smart Postal Box'
      });
    }, 2000);
   }
}
