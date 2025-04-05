import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthActions from '../store/auth/auth.actions';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const store = inject(Store);
    const router = inject(Router);
    return next(req).pipe(
        tap(response => {
            if (response instanceof HttpResponse) {
                // Handle successful responses here if needed
                // For example, you could check for new tokens in response headers
                const newToken = response.headers.get('Authorization');
                if (newToken && newToken.startsWith('Bearer ')) {
                    const token = newToken.substring(7); // Remove 'Bearer ' prefix
                    store.dispatch(AuthActions.setDeviceJwt({ deviceJwt: token }));
                }
            }
        }),
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Handle unauthorized access
                store.dispatch(AuthActions.logoutDevice());
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
}; 