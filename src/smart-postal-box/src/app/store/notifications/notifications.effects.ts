import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { NotificationService } from '../../../lib/open-api/api/notification.service';
import * as NotificationsActions from './notifications.actions';
import { Notification, NotificationType } from './notification.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsEffects {
  loadNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActions.loadNotifications),
      mergeMap(() =>
        this.notificationService.deviceConsumeNotificationsGet().pipe(
          map(apiNotifications => {
            // Transform API notifications to our app notifications format
            const notifications: Notification[] = apiNotifications?.map(apiNotification => {
              // Create ID from deviceId and timestamp or generate a UUID if missing
              const id = apiNotification.deviceId && apiNotification.createdAt
                ? `${apiNotification.deviceId}-${apiNotification.createdAt}`
                : uuidv4();
                
              // Get the notification type from the topic
              let type = NotificationType.SYSTEM;
              if (apiNotification.topic?.includes('state_change')) {
                type = NotificationType.STATE_CHANGE;
              } else if (apiNotification.topic?.includes('error')) {
                type = NotificationType.ERROR;
              }
              
              // Generate a readable message from the payload or use the topic if no payload
              const message = apiNotification.payload || apiNotification.topic || 'System notification';
              
              return {
                ...apiNotification,
                id,
                message,
                type,
                read: false // Default to unread
              };
            }) || [];
            
            return NotificationsActions.loadNotificationsSuccess({ notifications });
          }),
          catchError(error => of(NotificationsActions.loadNotificationsFailure({ error: error.message || 'Failed to load notifications' })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private notificationService: NotificationService
  ) {}
} 