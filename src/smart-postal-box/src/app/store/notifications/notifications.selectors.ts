import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState } from './notifications.state';

export const selectNotificationsFeature = createFeatureSelector<NotificationsState>('notifications');

export const selectAllNotifications = createSelector(
  selectNotificationsFeature,
  (state: NotificationsState) => state.notifications
);

export const selectNotificationsLoading = createSelector(
  selectNotificationsFeature,
  (state: NotificationsState) => state.loading
);

export const selectNotificationsError = createSelector(
  selectNotificationsFeature,
  (state: NotificationsState) => state.error
);

export const selectUnreadNotificationsCount = createSelector(
  selectAllNotifications,
  (notifications) => notifications.filter(notification => !notification.read).length
); 