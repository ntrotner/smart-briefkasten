import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { DeviceService } from '../../../lib/open-api/api/device.service';
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
          map(([options, state]) => DeviceActions.loadDeviceDataSuccess({
            options: {...options, name: 'Smart Postal Box'},
            state,
          })),
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
    private deviceService: DeviceService
  ) {}
} 