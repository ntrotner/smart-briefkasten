/* tslint:disable */
/* eslint-disable */
/**
 * Swagger - OpenAPI 3.0
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: nikita@ttnr.me
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { Message } from './Message';
import {
    MessageFromJSON,
    MessageFromJSONTyped,
    MessageToJSON,
} from './Message';

/**
 * 
 * @export
 * @interface Success
 */
export interface Success {
    /**
     * 
     * @type {Array<Message>}
     * @memberof Success
     */
    messages: Array<Message>;
    /**
     * 
     * @type {Array<Message>}
     * @memberof Success
     */
    warningMessages: Array<Message>;
}

/**
 * Check if a given object implements the Success interface.
 */
export function instanceOfSuccess(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "messages" in value;
    isInstance = isInstance && "warningMessages" in value;

    return isInstance;
}

export function SuccessFromJSON(json: any): Success {
    return SuccessFromJSONTyped(json, false);
}

export function SuccessFromJSONTyped(json: any, ignoreDiscriminator: boolean): Success {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'messages': ((json['messages'] as Array<any>).map(MessageFromJSON)),
        'warningMessages': ((json['warningMessages'] as Array<any>).map(MessageFromJSON)),
    };
}

export function SuccessToJSON(value?: Success | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'messages': ((value.messages as Array<any>).map(MessageToJSON)),
        'warningMessages': ((value.warningMessages as Array<any>).map(MessageToJSON)),
    };
}

