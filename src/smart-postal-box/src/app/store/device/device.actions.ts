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

// Request state change actions
export const requestDeviceStateChange = createAction(
    '[Device] Request Device State Change',
    props<{ state: DeviceState }>()
);

export const requestDeviceStateChangeSuccess = createAction(
    '[Device] Request Device State Change Success',
    props<{ state: DeviceState }>()
);

export const requestDeviceStateChangeFailure = createAction(
    '[Device] Request Device State Change Failure',
    props<{ error: string }>()
); 