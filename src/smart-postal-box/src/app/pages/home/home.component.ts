import { Component, HostListener, OnInit, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonIcon, IonItem, IonLabel, IonList, IonNote, IonSkeletonText, IonText, ToastController } from '@ionic/angular/standalone';
import { DeviceDataService } from 'src/app/services/device-data/device-data.service';
import { OpenStateOptions } from 'src/lib/open-api/model/openStateOptions';
import { ClosedStateOptions } from 'src/lib/open-api/model/closedStateOptions';
import { PacktrapStateOptions } from 'src/lib/open-api/model/packtrapStateOptions';
import { Store } from '@ngrx/store';
import * as DeviceActions from '../../store/device/device.actions';
import * as NotificationsActions from '../../store/notifications/notifications.actions';
import { selectStateChangePending, selectDeviceLoading, selectDeviceError } from '../../store/device/device.selectors';
import { selectAllNotifications, selectNotificationsLoading, selectNotificationsError } from '../../store/notifications/notifications.selectors';
import { DeviceState } from 'src/lib/open-api/model/deviceState';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    AsyncPipe,
    IonText,
    IonSkeletonText,
    IonBadge,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
  ],
  providers: [ToastController]
})
export class HomeComponent implements OnInit {
  private destroy$ = new Subject<void>();

  public DeviceState = {
    open: OpenStateOptions.StateEnum.Open as any,
    closed: ClosedStateOptions.StateEnum.Closed as any,
    packtrap: PacktrapStateOptions.StateEnum.Packtrap as any,
  };
  /**
   * Device options
   */
  public deviceOptions$ = this.deviceDataService.deviceOptions$;

  /**
   * Device state
   */
  public deviceState$ = this.deviceDataService.deviceState$;

  /**
   * State change pending status
   */
  public stateChangePending$ = this.store.select(selectStateChangePending);

  /**
   * Device data loading status
   */
  public selectDeviceLoading$ = this.store.select(selectDeviceLoading);

  /**
   * Device errors
   */
  public deviceError$ = this.store.select(selectDeviceError);

  /**
   * Notifications
   */
  public notifications$ = this.store.select(selectAllNotifications);

  /**
   * Notifications loading status
   */
  public notificationsLoading$ = this.store.select(selectNotificationsLoading);

  /**
   * Notifications error
   */
  public notificationsError$ = this.store.select(selectNotificationsError);

  /**
   * Icon size
   */
  public iconSize$ = signal<'large' | 'medium' | 'small'>('large');

  constructor(
    private deviceDataService: DeviceDataService,
    private store: Store,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Load notifications on init
    this.refreshNotifications();

    // Subscribe to device errors
    this.deviceError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.presentErrorToast(`Device error: ${error}`);
        }
      });

    // Subscribe to notification errors
    this.notificationsError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.presentErrorToast(`Notification error: ${error}`);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Present error toast
   */
  async presentErrorToast(message: string) {
    // Clean up error message
    let errorMsg = message;
    console.log(errorMsg);
    
    // Provide more context based on keywords in the error
    if (message.includes('Failed to change device state')) {
      errorMsg = 'Failed to change the device state. Please try again later.';
    } else if (message.includes('Notification')) {
      errorMsg = 'Failed to load notifications. Please try again later.';
    } else if (message.includes('Device error')) {
      if (message.includes('options') || message.includes('data')) {
        errorMsg = 'Failed to load device data. Please try again later.';
      }
    }
    
    const toast = await this.toastController.create({
      message: errorMsg,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp?: number): string {
    if (!timestamp) return '--:--';
    
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    this.store.dispatch(NotificationsActions.markNotificationAsRead({ id }));
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.store.dispatch(NotificationsActions.clearAllNotifications());
  }

  /**
   * Refresh notifications
   */
  refreshNotifications(): void {
    this.store.dispatch(NotificationsActions.loadNotifications());
  }

  /**
   * Refresh device data
   */
  refreshDeviceData() {
    this.store.dispatch(DeviceActions.loadDeviceData());
  }

  /**
   * Toggle between open and closed states
   */
  toggleLockState() {
    this.deviceState$.subscribe(currentState => {
      let newState: DeviceState;
      
      if (currentState === this.DeviceState.open) {
        // Create closed state
        newState = {
          state: ClosedStateOptions.StateEnum.Closed
        } as ClosedStateOptions;
      } else {
        // Create open state with event emission
        newState = {
          state: OpenStateOptions.StateEnum.Open,
          emitOpenEvent: true
        } as OpenStateOptions;
      }
      
      this.store.dispatch(DeviceActions.requestDeviceStateChange({ state: newState }));
    }).unsubscribe();
  }

  /**
   * Set device to packtrap state
   */
  setPacktrapState() {
    const trapState: PacktrapStateOptions = {
      state: PacktrapStateOptions.StateEnum.Packtrap,
      emitPacktrapEvent: true
    };
    
    this.store.dispatch(DeviceActions.requestDeviceStateChange({ state: trapState }));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const window = event.target as Window;
    this.iconSize$.set(window.innerWidth < 340 ? 'medium' : 'large');
  }
}
