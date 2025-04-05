import { createReducer, on } from '@ngrx/store';
import { initialNotificationsState } from './notifications.state';
import * as NotificationsActions from './notifications.actions';

export const notificationsReducer = createReducer(
  initialNotificationsState,
  on(NotificationsActions.loadNotifications, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(NotificationsActions.loadNotificationsSuccess, (state, { notifications }) => ({
    ...state,
    notifications: [
        ...notifications,
        ...state.notifications
    ],
    loading: false,
    error: null
  })),
  on(NotificationsActions.loadNotificationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(NotificationsActions.markNotificationAsRead, (state, { id }) => ({
    ...state,
    notifications: state.notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    )
  })),
  on(NotificationsActions.clearAllNotifications, (state) => ({
    ...state,
    notifications: []
  }))
); 