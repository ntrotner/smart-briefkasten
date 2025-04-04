package openapi_common

import (
	"context"
	"errors"
	"net/http"
	database_device "template_backend/database/paths/device"

	"github.com/rs/zerolog/log"
)

func IsDeviceAuthorized(ctx context.Context, r *http.Request) (*database_device.DeviceProfile, error) {
	token, found := ReadTokenFromHeader(r)
	if !found {
		log.Error().Msg("Bearer format invalid")
		return nil, errors.New("invalid Token")
	}

	_, content, err := database_device.VerifyJWT(&token)
	if err != nil {
		log.Error().Msg("Couldn't verify token to verify")
		return nil, errors.New("invalid Token")
	}

	device := database_device.FindDeviceById(ctx, &content.ID)
	if device == nil {
		log.Error().Msg("Couldn't find device to check device role")
		return nil, errors.New("no device")
	}

	return device, nil
}
