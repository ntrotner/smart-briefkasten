import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, tap } from 'rxjs/operators';
import { DeviceService } from '../../../lib/open-api/api/device.service';
import { Store } from '@ngrx/store';
import * as DeviceActions from './device.actions';

@Injectable()
export class DeviceEffects {
  loadDeviceData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DeviceActions.loadDeviceData),
      mergeMap(() =>
        combineLatest([
            this.deviceService.deviceGetOptionsGet(),
            this.deviceService.deviceGetStateGet()
        ]).pipe(
          map(([options, state]) => {
            // Get the device name (or default)
            const deviceName = options.name || 'Smart Postal Box';
            
            // Return the success action with the data
            return DeviceActions.loadDeviceDataSuccess({
              options: {...options, name: deviceName},
              state,
            });
          }),
          catchError(error => of(DeviceActions.loadDeviceDataFailure({ error: error.message })))
        )
      )
    )
  );

  // Effect to handle device state changes
  changeDeviceState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DeviceActions.requestDeviceStateChange),
      switchMap(({ state }) =>
        this.deviceService.deviceChangeStatePost(state).pipe(
          map(() => DeviceActions.requestDeviceStateChangeSuccess({ state })),
          catchError(error => of(DeviceActions.requestDeviceStateChangeFailure({ 
            error: error.message || 'Failed to change device state' 
          })))
        )
      )
    )
  );

  // Optional: Refresh device data after successful state change
  refreshAfterStateChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DeviceActions.requestDeviceStateChangeSuccess),
      map(() => DeviceActions.loadDeviceData())
    )
  );

  constructor(
    private actions$: Actions,
    private deviceService: DeviceService,
    private store: Store
  ) {}
} 