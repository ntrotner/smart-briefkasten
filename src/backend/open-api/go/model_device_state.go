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

type DeviceState struct {
	State string `json:"state"`

	// Emit open event
	EmitOpenEvent bool `json:"emitOpenEvent"`

	// Emit packtrap event
	EmitPacktrapEvent bool `json:"emitPacktrapEvent"`
}

// AssertDeviceStateRequired checks if the required fields are not zero-ed
func AssertDeviceStateRequired(obj DeviceState) error {
	elements := map[string]interface{}{
		"state":             obj.State,
		"emitOpenEvent":     obj.EmitOpenEvent,
		"emitPacktrapEvent": obj.EmitPacktrapEvent,
	}
	for name, el := range elements {
		if isZero := IsZeroValue(el); isZero {
			return &RequiredError{Field: name}
		}
	}

	return nil
}

// AssertDeviceStateConstraints checks if the values respects the defined constraints
func AssertDeviceStateConstraints(obj DeviceState) error {
	return nil
}
