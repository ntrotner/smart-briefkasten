/*
 * Swagger - OpenAPI 3.0
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * API version: 1.0.0
 * Contact: nikita@ttnr.me
 * Generated by: OpenAPI Generator (https://openapi-generator.tech)
 */

package openapi

type DeviceChangeState struct {
	State string `json:"state"`

	// Emit open event
	EmitOpenEvent bool `json:"emitOpenEvent"`

	// Emit packtrap event
	EmitPacktrapEvent bool `json:"emitPacktrapEvent"`
}

// AssertDeviceChangeStateRequired checks if the required fields are not zero-ed
func AssertDeviceChangeStateRequired(obj DeviceChangeState) error {
	return nil
}

// AssertDeviceChangeStateConstraints checks if the values respects the defined constraints
func AssertDeviceChangeStateConstraints(obj DeviceChangeState) error {
	return nil
}
