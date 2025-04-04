package mqtt_reader

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

		device := database_device.FindDeviceByToken(context.Background(), deviceNotification.Token)
		database_notification.SaveNotification(context.Background(), device.ID, "devices/notifications", deviceNotification.Data)
	}
}
