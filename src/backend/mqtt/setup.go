package mqtt

import (
	"log"

	mqtt_auth "template_backend/mqtt/auth"
	mqtt_reader "template_backend/mqtt/reader"

	"github.com/wind-c/comqtt/v2/mqtt"
	"github.com/wind-c/comqtt/v2/mqtt/hooks/auth"
	"github.com/wind-c/comqtt/v2/mqtt/listeners"
)

var server = mqtt.New(nil)

func PublishCommand(command string) error {
	return server.Publish("devices/commands", []byte(command), false, 0)
}

func SetupMqtt() {
	// Allow all connections.
	_ = server.AddHook(new(auth.AllowHook), nil)
	_ = server.AddHook(new(mqtt_auth.DeviceTopicPublishRestrictorHook), &mqtt_auth.DeviceTopicPublishRestrictorOptions{
		AllowedTopicPrefix: "devices/notifications",
	})
	_ = server.AddHook(new(mqtt_auth.DeviceTopicReadRestrictorHook), &mqtt_auth.DeviceTopicReadRestrictorOptions{
		AllowedTopicPrefix: "devices/commands",
	})
	_ = server.AddHook(new(mqtt_reader.DeviceReaderHook), nil)

	// Create a TCP listener on a standard port.
	websocket := listeners.NewWebsocket("t1", ":1883", nil)
	err := server.AddListener(websocket)
	if err != nil {
		log.Fatal(err)
	}

	err = server.Serve()
	if err != nil {
		log.Fatal(err)
	}
}
