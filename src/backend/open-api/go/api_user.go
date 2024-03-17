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

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
)

// UserAPIController binds http requests to an api service and writes the service results to the http response
type UserAPIController struct {
	service      UserAPIServicer
	errorHandler ErrorHandler
}

// UserAPIOption for how the controller is set up.
type UserAPIOption func(*UserAPIController)

// WithUserAPIErrorHandler inject ErrorHandler into controller
func WithUserAPIErrorHandler(h ErrorHandler) UserAPIOption {
	return func(c *UserAPIController) {
		c.errorHandler = h
	}
}

// NewUserAPIController creates a default api controller
func NewUserAPIController(s UserAPIServicer, opts ...UserAPIOption) Router {
	controller := &UserAPIController{
		service:      s,
		errorHandler: DefaultErrorHandler,
	}

	for _, opt := range opts {
		opt(controller)
	}

	return controller
}

// Routes returns all the api routes for the UserAPIController
func (c *UserAPIController) Routes() Routes {
	return Routes{
		"ChangePasswordPost": Route{
			strings.ToUpper("Post"),
			"/change-password",
			c.ChangePasswordPost,
		},
		"PasswordResetPost": Route{
			strings.ToUpper("Post"),
			"/password-reset",
			c.PasswordResetPost,
		},
		"ProfileGet": Route{
			strings.ToUpper("Get"),
			"/profile",
			c.ProfileGet,
		},
	}
}

// ChangePasswordPost - Change user password
func (c *UserAPIController) ChangePasswordPost(w http.ResponseWriter, r *http.Request) {
	changePasswordParam := ChangePassword{}
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(&changePasswordParam); err != nil && !errors.Is(err, io.EOF) {
		c.errorHandler(w, r, &ParsingError{Err: err}, nil)
		return
	}
	if err := AssertChangePasswordRequired(changePasswordParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	if err := AssertChangePasswordConstraints(changePasswordParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	result, err := c.service.ChangePasswordPost(r.Context(), changePasswordParam)
	// If an error occurred, encode the error with the status code
	if err != nil {
		c.errorHandler(w, r, err, &result)
		return
	}
	// If no error, encode the body and the result code
	EncodeJSONResponse(result.Body, &result.Code, w)
}

// PasswordResetPost - Initiate password reset
func (c *UserAPIController) PasswordResetPost(w http.ResponseWriter, r *http.Request) {
	passwordResetParam := PasswordReset{}
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(&passwordResetParam); err != nil && !errors.Is(err, io.EOF) {
		c.errorHandler(w, r, &ParsingError{Err: err}, nil)
		return
	}
	if err := AssertPasswordResetRequired(passwordResetParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	if err := AssertPasswordResetConstraints(passwordResetParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	result, err := c.service.PasswordResetPost(r.Context(), passwordResetParam)
	// If an error occurred, encode the error with the status code
	if err != nil {
		c.errorHandler(w, r, err, &result)
		return
	}
	// If no error, encode the body and the result code
	EncodeJSONResponse(result.Body, &result.Code, w)
}

// ProfileGet - Get user profile
func (c *UserAPIController) ProfileGet(w http.ResponseWriter, r *http.Request) {
	result, err := c.service.ProfileGet(r.Context(), r)
	// If an error occurred, encode the error with the status code
	if err != nil {
		c.errorHandler(w, r, err, &result)
		return
	}
	// If no error, encode the body and the result code
	EncodeJSONResponse(result.Body, &result.Code, w)
}
