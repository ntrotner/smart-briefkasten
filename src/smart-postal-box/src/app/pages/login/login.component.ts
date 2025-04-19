import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
} from '@ionic/angular/standalone';
import * as AuthActions from '../../store/auth/auth.actions';
import * as OwnershipActions from '../../store/ownership/ownership.actions';
import { QrCodeContract } from './contract';
import { selectIsLoggedIn } from '../../store/auth/auth.selectors';
import { selectAllDevices, selectHasDevices } from '../../store/ownership/ownership.selectors';
import { Subject, takeUntil } from 'rxjs';
import { OwnedDevice } from '../../store/ownership/ownership.state';

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
    IonIcon,
    DatePipe,
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  credentials: string = '';
  isScanning: boolean = false;
  hasDevices: boolean = false;
  devices: OwnedDevice[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router
  ) { }

  async ngOnInit() {
    this.checkPermissions();
    
    // Load saved devices when component initializes
    this.store.dispatch(OwnershipActions.loadDevices());
    
    this.store.select(selectIsLoggedIn)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        if (isLoggedIn) {
          this.router.navigate(['/home']);
        }
      });
      
    this.store.select(selectHasDevices)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasDevices => {
        this.hasDevices = hasDevices;
      });
      
    this.store.select(selectAllDevices)
      .pipe(takeUntil(this.destroy$))
      .subscribe(devices => {
        this.devices = devices;
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
        // Get baseUrl from QR code if available
        const baseUrl = jsonValue.baseUrl;
        
        // Add device to ownership store
        this.store.dispatch(OwnershipActions.addDevice({
          deviceToken: jsonValue.deviceToken,
          baseUrl,
          name: 'Smart Postal Box'  // Default name for the device
        }));
        
        // Login to the device
        this.store.dispatch(AuthActions.loginDevice({
          deviceToken: jsonValue.deviceToken,
          baseUrl
        }));
      }
    }
  }
  
  loginWithDevice(device: OwnedDevice) {
    // Select this device in the ownership store
    this.store.dispatch(OwnershipActions.selectDevice({ deviceId: device.id }));
    
    // Login using the saved device credentials
    this.store.dispatch(AuthActions.loginDevice({
      deviceToken: device.deviceToken,
      baseUrl: device.baseUrl
    }));
  }
}
