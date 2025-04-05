package database_device

import (
	"context"
	"errors"
	"time"

	"github.com/go-kivik/kivik"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

func CreateDevice(ctx context.Context) (*DeviceProfile, error) {
	device := DeviceProfile{
		ID:        uuid.New().String(),
		Token:     uuid.New().String(),
		State:     ClosedState,
		CreatedAt: time.Now().Unix(),
		UpdatedAt: time.Now().Unix(),
	}

	// Insert the document into the database
	rev, err := DatabaseDevice.Put(ctx, device.ID, device)
	if err != nil {
		log.Error().
			Msg(err.Error())

		return nil, err
	}

	log.Info().
		Str("rev", rev).
		Msg("Created Device")

	dbDevice := FindDeviceByToken(ctx, device.Token)
	if dbDevice == nil {
		log.Error().
			Msg("Couldn't find newly created device")

		return nil, errors.New("couldn't find newly created device")
	}

	return dbDevice, nil
}

func UpdateDeviceState(ctx context.Context, token string, state DeviceChangeState) error {
	device := FindDeviceByToken(ctx, token)
	if device == nil {
		return errors.New("couldn't find device")
	}

	device.State = state.State
	device.UpdatedAt = time.Now().Unix()

	_, err := DatabaseDevice.Put(ctx, device.ID, device, kivik.Options{"_rev": device.Rev})
	if err != nil {
		log.Error().
			Str("state", string(state.State)).
			Msg(err.Error())
		return errors.New("couldn't update device state")
	}

	return nil
}

func UpdateDeviceOptions(ctx context.Context, token string, options DeviceOptions) error {
	device := FindDeviceByToken(ctx, token)
	if device == nil {
		return errors.New("couldn't find device")
	}

	if options.Wifi.SSID != "" {
		device.Options.Wifi.SSID = options.Wifi.SSID
	}
	if options.Wifi.Password != "" {
		device.Options.Wifi.Password = options.Wifi.Password
	}
	if options.Kafka.URL != "" {
		device.Options.Kafka.URL = options.Kafka.URL
	}
	device.UpdatedAt = time.Now().Unix()

	_, err := DatabaseDevice.Put(ctx, device.ID, device, kivik.Options{"_rev": device.Rev})
	if err != nil {
		log.Error().
			Msg(err.Error())
		return errors.New("couldn't update device options")
	}

	return nil
}
