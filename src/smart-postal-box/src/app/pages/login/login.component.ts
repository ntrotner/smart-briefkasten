import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonIcon } from '@ionic/angular/standalone';
import * as AuthActions from '../../store/auth/auth.actions';
import { QrCodeContract } from './contract';
import { selectIsLoggedIn } from '../../store/auth/auth.selectors';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  credentials: string = '';
  isScanning: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkPermissions();
    this.store.select(selectIsLoggedIn)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/home']);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async checkPermissions() {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted') {
      return;
    }
    const { camera: newCamera } = await BarcodeScanner.requestPermissions();
    if (newCamera !== 'granted') {
      console.error('Permission denied');
    }
  }

  async startScan() {
    try {
      this.isScanning = true;
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length > 0) {
        const qrCode = barcodes.find(barcode => barcode.format === 'QR_CODE');
        if (qrCode) {
          this.credentials = qrCode.rawValue;
          this.login();
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      this.isScanning = false;
    }
  }

  async stopScan() {
    await BarcodeScanner.stopScan();
    this.isScanning = false;
  }

  login() {
    if (this.credentials) {
      const decodedValue = atob(this.credentials);
      const jsonValue = (JSON.parse(decodedValue) || {}) as QrCodeContract;

      if (jsonValue.deviceToken) {
        this.store.dispatch(AuthActions.loginDevice({ deviceToken: jsonValue.deviceToken }));
      }
    }
  }
}
