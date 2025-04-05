import { Component, HostListener, OnInit, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonIcon, IonItem, IonLabel, IonList, IonNote, IonSkeletonText, IonText } from '@ionic/angular/standalone';
import { DeviceDataService } from 'src/app/services/device-data/device-data.service';
import { OpenStateOptions } from 'src/lib/open-api/model/openStateOptions';
import { ClosedStateOptions } from 'src/lib/open-api/model/closedStateOptions';
import { PacktrapStateOptions } from 'src/lib/open-api/model/packtrapStateOptions';

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
})
export class HomeComponent implements OnInit {

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
   * Icon size
   */
  public iconSize$ = signal<'large' | 'medium' | 'small'>('large');

  constructor(
    private deviceDataService: DeviceDataService
  ) {

  }

  ngOnInit() { }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const window = event.target as Window;
    this.iconSize$.set(window.innerWidth < 340 ? 'medium' : 'large');
  }

}
