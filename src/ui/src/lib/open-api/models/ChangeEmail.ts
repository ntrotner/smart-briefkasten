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
/**
 * 
 * @export
 * @interface ChangeEmail
 */
export interface ChangeEmail {
    /**
     * 
     * @type {string}
     * @memberof ChangeEmail
     */
    currentEmail: string;
    /**
     * 
     * @type {string}
     * @memberof ChangeEmail
     */
    newEmail: string;
}

/**
 * Check if a given object implements the ChangeEmail interface.
 */
export function instanceOfChangeEmail(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "currentEmail" in value;
    isInstance = isInstance && "newEmail" in value;

    return isInstance;
}

export function ChangeEmailFromJSON(json: any): ChangeEmail {
    return ChangeEmailFromJSONTyped(json, false);
}

export function ChangeEmailFromJSONTyped(json: any, ignoreDiscriminator: boolean): ChangeEmail {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'currentEmail': json['currentEmail'],
        'newEmail': json['newEmail'],
    };
}

export function ChangeEmailToJSON(value?: ChangeEmail | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'currentEmail': value.currentEmail,
        'newEmail': value.newEmail,
    };
}

