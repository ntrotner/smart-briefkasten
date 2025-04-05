package mqtt

import (
	"bytes"
	"context"
	"encoding/json"
	database_device "template_backend/database/paths/device"
	database_notification "template_backend/database/paths/notification"

	"github.com/rs/zerolog/log"
	"github.com/wind-c/comqtt/v2/mqtt"
	"github.com/wind-c/comqtt/v2/mqtt/packets"
)

type DeviceNotification struct {
	Data  string `json:"data"`
	Token string `json:"token"`
}

type DeviceIdentifier struct {
	Token string `json:"token"`
}

type DeviceReaderHook struct {
	mqtt.HookBase
}

func (h *DeviceReaderHook) Provides(b byte) bool {
	return bytes.Contains([]byte{
		mqtt.OnPublished,
	}, []byte{b})
}

func (h *DeviceReaderHook) OnPublished(cl *mqtt.Client, pk packets.Packet) {
	if pk.TopicName == "devices/notifications" {
		deviceNotification := DeviceNotification{}
		err := json.Unmarshal(pk.Payload, &deviceNotification)
		if err != nil {
			log.Error().Msgf("error unmarshalling device notification: %s", err)
			return
		}

		_, content, err := database_device.VerifyJWT(&deviceNotification.Token)
		if err != nil {
			log.Error().Msg("Couldn't verify token to verify")
			return
		}

		device := database_device.FindDeviceById(context.Background(), &content.ID)
		if device == nil {
			log.Error().Msgf("error verifying device token: %s", err)
			return
		}

		database_notification.SaveNotification(context.Background(), device.ID, "devices/notifications", deviceNotification.Data)
	}

	if pk.TopicName == "devices/options" {
		deviceIdentifier := DeviceIdentifier{}
		err := json.Unmarshal(pk.Payload, &deviceIdentifier)
		log.Info().Msgf("device identifier: %s", deviceIdentifier)
		if err != nil {
			log.Error().Msgf("error unmarshalling device options: %s", err)
			return
		}

		_, content, err := database_device.VerifyJWT(&deviceIdentifier.Token)
		if err != nil {
			log.Error().Msg("Couldn't verify token to verify")
			return
		}

		device := database_device.FindDeviceById(context.Background(), &content.ID)
		if device == nil {
			log.Error().Msgf("error finding device: %s", err)
			return
		}

		options, err := database_device.GetDeviceOptions(context.Background(), device.Token)
		if err != nil {
			log.Error().Msgf("error getting device options: %s", err)
			return
		}

		customOptions := struct {
			Options database_device.DeviceOptions `json:"options"`
			ID      string                        `json:"id"`
		}{
			Options: *options,
			ID:      device.ID,
		}

		json, err := json.Marshal(customOptions)
		if err != nil {
			log.Error().Msgf("error marshalling device options: %s", err)
			return
		}

		err = PublishOptions(string(json))
		if err != nil {
			log.Error().Msgf("error publishing device options: %s", err)
			return
		}
	}

	if pk.TopicName == "devices/state" {
		deviceIdentifier := DeviceIdentifier{}
		err := json.Unmarshal(pk.Payload, &deviceIdentifier)
		if err != nil {
			log.Error().Msgf("error unmarshalling device state: %s", err)
			return
		}

		_, content, err := database_device.VerifyJWT(&deviceIdentifier.Token)
		if err != nil {
			log.Error().Msg("Couldn't verify token to verify")
			return
		}

		device := database_device.FindDeviceById(context.Background(), &content.ID)
		if device == nil {
			log.Error().Msgf("error finding device: %s", err)
			return
		}

		state, err := database_device.GetDeviceState(context.Background(), device.Token)
		if err != nil {
			log.Error().Msgf("error getting device state: %s", err)
			return
		}
		customState := struct {
			State database_device.DeviceState `json:"state"`
			ID    string                      `json:"id"`
		}{
			State: *state,
			ID:    device.ID,
		}

		json, err := json.Marshal(customState)
		if err != nil {
			log.Error().Msgf("error marshalling device state: %s", err)
			return
		}

		err = PublishState(string(json))
		if err != nil {
			log.Error().Msgf("error publishing device state: %s", err)
			return
		}
	}
}
