import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, mergeMap, withLatestFrom, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import * as OwnershipActions from './ownership.actions';
import { selectAllDevices, selectOwnershipState } from './ownership.selectors';
import { OwnedDevice } from './ownership.state';

const STORAGE_KEY = 'smart_postal_box_devices';

@Injectable()
export class OwnershipEffects {
  // Add device effect
  addDevice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OwnershipActions.addDevice),
      withLatestFrom(this.store.select(selectAllDevices)),
      map(([{ deviceToken, baseUrl, name }, devices]) => {
        // Check if device token already exists
        const existingDevice = devices.find(device => device.deviceToken === deviceToken);
        console.log('existingDevice', existingDevice);
        if (existingDevice) {
          // Update existing device
          return OwnershipActions.addDeviceSuccess({
            device: {
              ...existingDevice,
              baseUrl: baseUrl || existingDevice.baseUrl,
              name: name || existingDevice.name,
              lastConnected: new Date()
            }
          });
        } else {
          // Create new device with unique ID
          return OwnershipActions.addDeviceSuccess({
            device: {
              id: uuidv4(),
              deviceToken,
              baseUrl,
              name: name || 'Smart Postal Box',
              lastConnected: new Date()
            }
          });
        }
      }),
      catchError((error: Error) => of(OwnershipActions.addDeviceFailure({ 
        error: error.message || 'Failed to add device' 
      })))
    )
  );

  // Load devices from localStorage
  loadDevices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OwnershipActions.loadDevices),
      mergeMap(() => {
        try {
          // Get devices from localStorage
          const storedDevicesJson = localStorage.getItem(STORAGE_KEY);
          const devices: OwnedDevice[] = storedDevicesJson ? JSON.parse(storedDevicesJson) : [];
          
          // Convert string dates back to Date objects
          const processedDevices = devices.map(device => ({
            ...device,
            lastConnected: new Date(device.lastConnected)
          }));
          
          return of(OwnershipActions.loadDevicesSuccess({ devices: processedDevices }));
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load devices';
          return of(OwnershipActions.loadDevicesFailure({ error: errorMessage }));
        }
      })
    )
  );

  // Persist devices to localStorage whenever state changes
  persistDevices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        OwnershipActions.addDeviceSuccess,
        OwnershipActions.removeDeviceSuccess,
        OwnershipActions.updateDeviceName,
        OwnershipActions.selectDevice
      ),
      withLatestFrom(this.store.select(selectOwnershipState)),
      tap(([, state]) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.devices));
        } catch (error) {
          console.error('Failed to persist devices to localStorage:', error);
        }
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store
  ) {}
} 