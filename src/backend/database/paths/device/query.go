package database_device

import (
	"context"
	"errors"

	"github.com/rs/zerolog/log"
)

func createFindDeviceQuery(token *string, id *string, fields []interface{}) map[string]interface{} {
	query := map[string]interface{}{
		"selector": map[string]interface{}{},
		"limit":    1,
	}

	if fields != nil {
		query["fields"] = fields
	}

	if token != nil {
		query["selector"].(map[string]interface{})["token"] = map[string]interface{}{"$eq": *token}
	}
	if id != nil {
		query["selector"].(map[string]interface{})["_id"] = map[string]interface{}{"$eq": *id}
	}

	return query
}

func ExistsToken(ctx context.Context, token string) bool {
	query := createFindDeviceQuery(&token, nil, []interface{}{"token"})
	rows, err := DatabaseDevice.Find(ctx, query)
	if err != nil {
		log.Error().Msg(err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var device DeviceProfile
		if err := rows.ScanDoc(&device); err != nil {
			log.Error().Msg(err.Error())
		} else if device.Token == token {
			return true
		}
	}
	return false
}

func FindDeviceById(ctx context.Context, id *string) *DeviceProfile {
	options := createFindDeviceQuery(nil, id, nil)
	rows, err := DatabaseDevice.Find(ctx, options)
	if err != nil {
		log.Error().Msg(err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var device DeviceProfile
		if err := rows.ScanDoc(&device); err != nil {
			log.Error().Msg(err.Error())
			return nil
		} else {
			return &device
		}
	}
	return nil
}

func FindDeviceByToken(ctx context.Context, token string) *DeviceProfile {
	options := createFindDeviceQuery(&token, nil, nil)
	rows, err := DatabaseDevice.Find(ctx, options)
	if err != nil {
		log.Error().Msg(err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var device DeviceProfile
		if err := rows.ScanDoc(&device); err != nil {
			log.Error().Msg(err.Error())
			return nil
		} else {
			return &device
		}
	}
	return nil
}

func AuthenticateDevice(ctx context.Context, token string) *DeviceProfile {
	device := FindDeviceByToken(ctx, token)
	if device == nil {
		return nil
	}

	return device
}

func GetDeviceOptions(ctx context.Context, token string) (*DeviceOptions, error) {
	device := FindDeviceByToken(ctx, token)
	if device == nil {
		return nil, errors.New("device not found")
	}

	return &device.Options, nil
}

func GetDeviceState(ctx context.Context, token string) (*DeviceState, error) {
	device := FindDeviceByToken(ctx, token)
	if device == nil {
		return nil, errors.New("device not found")
	}

	return &device.State, nil
}
