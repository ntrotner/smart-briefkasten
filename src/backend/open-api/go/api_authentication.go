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

// AuthenticationAPIController binds http requests to an api service and writes the service results to the http response
type AuthenticationAPIController struct {
	service      AuthenticationAPIServicer
	errorHandler ErrorHandler
}

// AuthenticationAPIOption for how the controller is set up.
type AuthenticationAPIOption func(*AuthenticationAPIController)

// WithAuthenticationAPIErrorHandler inject ErrorHandler into controller
func WithAuthenticationAPIErrorHandler(h ErrorHandler) AuthenticationAPIOption {
	return func(c *AuthenticationAPIController) {
		c.errorHandler = h
	}
}

// NewAuthenticationAPIController creates a default api controller
func NewAuthenticationAPIController(s AuthenticationAPIServicer, opts ...AuthenticationAPIOption) Router {
	controller := &AuthenticationAPIController{
		service:      s,
		errorHandler: DefaultErrorHandler,
	}

	for _, opt := range opts {
		opt(controller)
	}

	return controller
}

// Routes returns all the api routes for the AuthenticationAPIController
func (c *AuthenticationAPIController) Routes() Routes {
	return Routes{
		"LoginPost": Route{
			strings.ToUpper("Post"),
			"/login",
			c.LoginPost,
		},
	}
}

// LoginPost - User login
func (c *AuthenticationAPIController) LoginPost(w http.ResponseWriter, r *http.Request) {
	deviceLoginParam := DeviceLogin{}
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(&deviceLoginParam); err != nil && !errors.Is(err, io.EOF) {
		c.errorHandler(w, r, &ParsingError{Err: err}, nil)
		return
	}
	if err := AssertDeviceLoginRequired(deviceLoginParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	if err := AssertDeviceLoginConstraints(deviceLoginParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	result, err := c.service.LoginPost(r.Context(), deviceLoginParam, w, r)
	// If an error occurred, encode the error with the status code
	if err != nil {
		c.errorHandler(w, r, err, &result)
		return
	}
	// If no error, encode the body and the result code
	EncodeJSONResponse(result.Body, &result.Code, w)
}
