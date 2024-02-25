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

import "template_backend/common"

type PasswordReset struct {
	Email string `json:"email" validate:"required,email"`
}

// AssertPasswordResetRequired checks if the required fields are not zero-ed
func AssertPasswordResetRequired(obj PasswordReset) error {
	elements := map[string]interface{}{
		"email": obj.Email,
	}
	for name, el := range elements {
		if isZero := IsZeroValue(el); isZero {
			return &RequiredError{Field: name}
		}
	}

	return nil
}

// AssertPasswordResetConstraints checks if the values respects the defined constraints
func AssertPasswordResetConstraints(obj PasswordReset) error {
	return common.Validate.Struct(obj)
}
