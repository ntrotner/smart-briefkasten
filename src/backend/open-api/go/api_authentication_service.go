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
	"context"
	"net/http"
	database_user "template_backend/database/paths/user"
	openapi_common "template_backend/open-api/common"

	"github.com/rs/zerolog/log"
)

// AuthenticationAPIService is a service that implements the logic for the AuthenticationAPIServicer
// This service should implement the business logic for every endpoint for the AuthenticationAPI API.
// Include any external packages or services that will be required by this service.
type AuthenticationAPIService struct {
}

// NewAuthenticationAPIService creates a default api service
func NewAuthenticationAPIService() AuthenticationAPIServicer {
	return &AuthenticationAPIService{}
}

// LoginPost - User login
func (s *AuthenticationAPIService) LoginPost(ctx context.Context, userLogin UserLogin, w http.ResponseWriter) (ImplResponse, error) {
	user := database_user.AuthenticateUser(ctx, userLogin.Email, userLogin.Password)
	if user == nil {
		return Response(401, Error{ErrorMessages: []Message{{Code: "100", Message: "Unauthorized. Please check your credentials."}}}), nil
	}

	tokenString, _, err := database_user.CreateJWT(user)
	if err != nil {
		log.Error().Msg(err.Error())
		return Response(401, Error{ErrorMessages: []Message{{Code: "100", Message: "Unauthorized. Please check your credentials."}}}), nil
	}

	openapi_common.WriteTokenToHeader(&tokenString, w)
	return Response(200, Success{}), nil
}

// LogoutPost - User logout
func (s *AuthenticationAPIService) LogoutPost(ctx context.Context, r *http.Request) (ImplResponse, error) {
	r.Header.Del("Authorization")
	return Response(200, Success{}), nil
}

// RefreshTokenPost - Refresh authentication token
func (s *AuthenticationAPIService) RefreshTokenPost(ctx context.Context, w http.ResponseWriter, r *http.Request) (ImplResponse, error) {
	token, found := openapi_common.ReadTokenFromHeader(r)
	if !found {
		log.Error().Msg("Bearer format invalid")
		return Response(401, Error{ErrorMessages: []Message{{Code: "100", Message: "Unauthorized. Please check your credentials."}}}), nil
	}

	_, content, err := database_user.VerifyJWT(&token)
	if err != nil {
		log.Error().Msg("Couldn't verify token to refresh")
		return Response(401, Error{ErrorMessages: []Message{{Code: "100", Message: "Unauthorized. Please check your credentials."}}}), nil
	}

	user := database_user.FindUserById(ctx, &content.ID)
	if user == nil {
		log.Error().Msg("Couldn't find user to refresh token")
		return Response(401, Error{ErrorMessages: []Message{{Code: "100", Message: "Unauthorized. Please check your credentials."}}}), nil
	}

	tokenString, _, err := database_user.CreateJWT(user)
	if err != nil {
		log.Error().Msg(err.Error())
		return Response(401, Error{ErrorMessages: []Message{{Code: "100", Message: "Unauthorized. Please check your credentials."}}}), nil
	}

	openapi_common.WriteTokenToHeader(&tokenString, w)
	return Response(200, Success{}), nil
}

// RegisterPost - Register a new user
func (s *AuthenticationAPIService) RegisterPost(ctx context.Context, userRegistration UserRegistration, w http.ResponseWriter) (ImplResponse, error) {
	existsEmail := database_user.ExistsEmail(ctx, userRegistration.Email)
	if existsEmail {
		return Response(400, Error{ErrorMessages: []Message{{Code: "101", Message: "Bad request. Please check your input data."}}}), nil
	}

	user, err := database_user.CreateUser(ctx, userRegistration.Email, userRegistration.Password)
	if err != nil {
		return Response(400, Error{ErrorMessages: []Message{{Code: "101", Message: "Bad request. Please check your input data."}}}), nil
	}

	signedJWT, _, err := database_user.CreateJWT(user)
	if err != nil {
		log.Error().Msg(err.Error())
		return Response(400, Error{ErrorMessages: []Message{{Code: "101", Message: "Bad request. Please check your input data."}}}), nil
	}
	openapi_common.WriteTokenToHeader(&signedJWT, w)
	return Response(200, Success{}), nil
}
