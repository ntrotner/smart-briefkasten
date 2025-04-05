import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthState } from '../store/auth/auth.selectors';
import { switchMap, take } from 'rxjs/operators';

export const BaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    const store = inject(Store);

    // Get the base URL from the auth state
    return store.select(selectAuthState).pipe(
        take(1),
        switchMap(authState => {
            // Get the base URL, with fallback
            const baseUrl = new URL(authState.baseUrl || 'http://0.0.0.0:8080');
            const relativeUrl = new URL(req.url).pathname.replace(/^(\/\/)/, "");
            const url = new URL(relativeUrl, baseUrl);
            
            console.log(baseUrl);
            console.log(relativeUrl);
            console.log(url);
            console.log(url.toString());
            
            // Clone the request with the new URL
            const modifiedReq = req.clone({
                url: url.toString()
            });
            
            return next(modifiedReq);
        })
    );
}; 