import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, filter, tap } from 'rxjs/operators';
import { AuthenticationService } from '../../../lib/open-api/api/authentication.service';
import * as AuthActions from './auth.actions';
import * as DeviceActions from '../../store/device/device.actions';
import { Store } from '@ngrx/store';
import { selectAuthState } from './auth.selectors';

@Injectable()
export class AuthEffects {
  loginDevice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginDevice),
      mergeMap(({ deviceToken }) =>
        this.authService.loginPost({ token: deviceToken }).pipe(
          map(response => {
            const deviceJwt = typeof this.authService.configuration.accessToken === 'function'
              ? this.authService.configuration.accessToken()
              : this.authService.configuration.accessToken;

            // For now, we'll use the device token as the JWT since the API response doesn't include it
            // TODO: Update this when the API response includes the JWT
            return AuthActions.loginDeviceSuccess({
              deviceToken,
              deviceJwt: deviceJwt || '',
              lastLoginTime: Date.now()
            });
          }),
          catchError(error => of(AuthActions.loginDeviceFailure({ error: error.message })))
        )
      )
    )
  );

  logoutDevice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutDevice),
      mergeMap(() =>
        of(null).pipe(
          map(() => AuthActions.logoutDeviceSuccess())
        )
      )
    )
  );



  loadDeviceData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.setDeviceJwt),
      mergeMap(() =>
        this.store.select(selectAuthState).pipe(
          filter(authState => authState.deviceJwt !== null),
          tap(authState => {
            this.authService.configuration.accessToken = authState.deviceJwt!;
          }),
          map((authState) => DeviceActions.loadDeviceData())
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthenticationService,
    private store: Store
  ) { }
} 