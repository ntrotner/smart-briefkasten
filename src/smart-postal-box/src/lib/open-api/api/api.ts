export * from './authentication.service';
import { AuthenticationService } from './authentication.service';
export * from './device.service';
import { DeviceService } from './device.service';
export * from './notification.service';
import { NotificationService } from './notification.service';
export * from './status.service';
import { StatusService } from './status.service';
export const APIS = [AuthenticationService, DeviceService, NotificationService, StatusService];
