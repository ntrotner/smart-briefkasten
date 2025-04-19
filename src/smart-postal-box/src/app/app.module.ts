import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { withInterceptors } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { authReducer } from './store/auth';
import { AuthEffects } from './store/auth';
import { deviceReducer } from './store/device/device.reducer';
import { DeviceEffects } from './store/device/device.effects';
import { notificationsReducer } from './store/notifications/notifications.reducer';
import { NotificationsEffects } from './store/notifications/notifications.effects';
import { hydrationMetaReducer } from './store/auth/auth.meta-reducer';
import { Configuration } from 'src/lib/open-api/configuration';
import { provideHttpClient } from '@angular/common/http';
import { ApiModule } from 'src/lib/open-api/api.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { BaseUrlInterceptor } from './interceptors/base-url.interceptor';
import { ownershipReducer } from './store/ownership/ownership.reducer';
import { OwnershipEffects } from './store/ownership/ownership.effects';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    StoreModule.forRoot(
      {
        auth: authReducer,
        device: deviceReducer,
        notifications: notificationsReducer,
        ownership: ownershipReducer
      },
      { metaReducers: [hydrationMetaReducer] }
    ),
    EffectsModule.forRoot([AuthEffects, DeviceEffects, NotificationsEffects, OwnershipEffects]),
    ApiModule.forRoot(() => new Configuration())
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptors([BaseUrlInterceptor, AuthInterceptor]))
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
