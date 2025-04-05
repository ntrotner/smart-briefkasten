import { Notification as ApiNotification } from 'src/lib/open-api/model/notification';

export interface Notification extends ApiNotification {
    read: boolean;
    type: NotificationType;
    id: string; // We'll generate this from deviceId + createdAt
    message: string; // We'll derive this from topic and payload
}

export enum NotificationType {
    STATE_CHANGE = 'state_change',
    SYSTEM = 'system',
    ERROR = 'error'
} 