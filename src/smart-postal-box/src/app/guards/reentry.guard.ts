import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { combineLatest, filter, map, of, switchMap, take } from "rxjs";
import { selectAuthState, selectIsLoggedIn } from "../store/auth/auth.selectors";
import { Store } from "@ngrx/store";
import { loginDevice, setDeviceJwt } from "../store/auth";

export const reentryGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const store = inject(Store);
    
    return combineLatest([
        store.select(selectIsLoggedIn), 
        store.select(selectAuthState)
    ]).pipe(
        take(1),
        switchMap(([isLoggedIn, authState]) => {
            if (isLoggedIn && authState.lastLoginTime) {
                console.log('authState', authState);
                const lastLoginTime = new Date(authState.lastLoginTime);
                const currentTime = new Date();
                const timeDifference = currentTime.getTime() - lastLoginTime.getTime();
                const minutesDifference = timeDifference / (1000 * 60);
                if (minutesDifference < 10) {
                    store.dispatch(setDeviceJwt({ deviceJwt: authState.deviceJwt! }));
                    return of(true);
                } else {
                    store.dispatch(loginDevice({ deviceToken: authState.deviceToken! }));
                    return store.select(selectAuthState).pipe(
                        filter(({deviceJwt}) => deviceJwt !== null),
                        map(() => true)
                    );
                }
            }
            return of(router.createUrlTree(['/login']));
        })
    );
};

