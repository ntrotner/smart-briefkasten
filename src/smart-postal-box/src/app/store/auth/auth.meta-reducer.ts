import { ActionReducer, INIT, UPDATE } from '@ngrx/store';
import { AuthState } from './auth.state';
import { DeviceStoreState } from '../device/device.state';
import { NotificationsState } from '../notifications/notifications.state';

export interface AppState {
  auth: AuthState;
  device: DeviceStoreState;
  notifications: NotificationsState;
}

export const hydrationMetaReducer = (
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> => {
  return (state, action) => {
    if (action.type === INIT || action.type === UPDATE) {
      const storageValue = localStorage.getItem('appState');
      if (storageValue) {
        try {
          return JSON.parse(storageValue);
        } catch {
          localStorage.removeItem('appState');
        }
      }
    }
    const nextState = reducer(state, action);
    localStorage.setItem('appState', JSON.stringify(nextState));
    return nextState;
  };
}; 