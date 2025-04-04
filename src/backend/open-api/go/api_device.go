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

// DeviceAPIController binds http requests to an api service and writes the service results to the http response
type DeviceAPIController struct {
	service      DeviceAPIServicer
	errorHandler ErrorHandler
}

// DeviceAPIOption for how the controller is set up.
type DeviceAPIOption func(*DeviceAPIController)

// WithDeviceAPIErrorHandler inject ErrorHandler into controller
func WithDeviceAPIErrorHandler(h ErrorHandler) DeviceAPIOption {
	return func(c *DeviceAPIController) {
		c.errorHandler = h
	}
}

// NewDeviceAPIController creates a default api controller
func NewDeviceAPIController(s DeviceAPIServicer, opts ...DeviceAPIOption) Router {
	controller := &DeviceAPIController{
		service:      s,
		errorHandler: DefaultErrorHandler,
	}

	for _, opt := range opts {
		opt(controller)
	}

	return controller
}

// Routes returns all the api routes for the DeviceAPIController
func (c *DeviceAPIController) Routes() Routes {
	return Routes{
		"DeviceChangeOptionsPost": Route{
			strings.ToUpper("Post"),
			"/device/change-options",
			c.DeviceChangeOptionsPost,
		},
		"DeviceChangeStatePost": Route{
			strings.ToUpper("Post"),
			"/device/change-state",
			c.DeviceChangeStatePost,
		},
	}
}

// DeviceChangeOptionsPost - Modify options of device
func (c *DeviceAPIController) DeviceChangeOptionsPost(w http.ResponseWriter, r *http.Request) {
	deviceChangeOptionsParam := DeviceChangeOptions{}
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(&deviceChangeOptionsParam); err != nil && !errors.Is(err, io.EOF) {
		c.errorHandler(w, r, &ParsingError{Err: err}, nil)
		return
	}
	if err := AssertDeviceChangeOptionsRequired(deviceChangeOptionsParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	if err := AssertDeviceChangeOptionsConstraints(deviceChangeOptionsParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	result, err := c.service.DeviceChangeOptionsPost(r.Context(), deviceChangeOptionsParam, w, r)
	// If an error occurred, encode the error with the status code
	if err != nil {
		c.errorHandler(w, r, err, &result)
		return
	}
	// If no error, encode the body and the result code
	EncodeJSONResponse(result.Body, &result.Code, w)
}

// DeviceChangeStatePost - Modify state of device
func (c *DeviceAPIController) DeviceChangeStatePost(w http.ResponseWriter, r *http.Request) {
	deviceChangeStateParam := DeviceChangeState{}
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(&deviceChangeStateParam); err != nil && !errors.Is(err, io.EOF) {
		c.errorHandler(w, r, &ParsingError{Err: err}, nil)
		return
	}
	if err := AssertDeviceChangeStateRequired(deviceChangeStateParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	if err := AssertDeviceChangeStateConstraints(deviceChangeStateParam); err != nil {
		c.errorHandler(w, r, err, nil)
		return
	}
	result, err := c.service.DeviceChangeStatePost(r.Context(), deviceChangeStateParam, w, r)
	// If an error occurred, encode the error with the status code
	if err != nil {
		c.errorHandler(w, r, err, &result)
		return
	}
	// If no error, encode the body and the result code
	EncodeJSONResponse(result.Body, &result.Code, w)
}
