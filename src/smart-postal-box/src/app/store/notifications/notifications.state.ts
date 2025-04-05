import { Notification } from './notification.model';

export interface NotificationsState {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
}

export const initialNotificationsState: NotificationsState = {
    notifications: [],
    loading: false,
    error: null
}; 