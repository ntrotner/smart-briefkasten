import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { selectAuthState } from './store/auth/auth.selectors';
import { take, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthenticationService } from 'src/lib/open-api';
import { loginDevice } from './store/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private authService: AuthenticationService, private store: Store) {
    BarcodeScanner.installGoogleBarcodeScannerModule();
  }

  ngOnInit() {
    // continously update the device token
    setTimeout(() => {
      this.store.select(selectAuthState).pipe(
        take(1),
        tap(({ deviceToken, baseUrl }) => 
          this.store.dispatch(loginDevice({ deviceToken: deviceToken!, baseUrl: baseUrl! }))
      )).subscribe();
    }, 3 * 60 * 1000);
  }
}
