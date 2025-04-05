import { createAction, props } from '@ngrx/store';
import { Notification } from './notification.model';

export const loadNotifications = createAction(
  '[Notifications] Load Notifications'
);

export const loadNotificationsSuccess = createAction(
  '[Notifications] Load Notifications Success',
  props<{ notifications: Notification[] }>()
);

export const loadNotificationsFailure = createAction(
  '[Notifications] Load Notifications Failure',
  props<{ error: string }>()
);

export const markNotificationAsRead = createAction(
  '[Notifications] Mark As Read',
  props<{ id: string }>()
);

export const clearAllNotifications = createAction(
  '[Notifications] Clear All'
); 