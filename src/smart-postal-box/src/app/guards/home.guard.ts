import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../store/auth/auth.selectors';
import { map, take } from 'rxjs/operators';

export const homeGuard = () => {
    const router = inject(Router);
    const store = inject(Store);

    return store.select(selectIsLoggedIn).pipe(
        take(1),
        map(isLoggedIn => {
            if (isLoggedIn) {
                return true
            }
            return router.createUrlTree(['/login']);
        })
    );
};
