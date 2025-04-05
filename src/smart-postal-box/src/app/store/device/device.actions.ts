import { createAction, props } from '@ngrx/store';
import { DeviceOptions } from '../../../lib/open-api/model/deviceOptions';
import { DeviceState } from '../../../lib/open-api/model/deviceState';

export const loadDeviceData = createAction(
    '[Device] Load Device Data'
);

export const loadDeviceDataSuccess = createAction(
    '[Device] Load Device Data Success',
    props<{ options: DeviceOptions; state: DeviceState }>()
);

export const loadDeviceDataFailure = createAction(
    '[Device] Load Device Data Failure',
    props<{ error: string }>()
);

export const updateDeviceState = createAction(
    '[Device] Update Device State',
    props<{ state: DeviceState }>()
);

export const updateDeviceOptions = createAction(
    '[Device] Update Device Options',
    props<{ options: DeviceOptions }>()
); 