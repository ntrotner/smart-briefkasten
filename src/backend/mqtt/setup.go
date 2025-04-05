package mqtt

import (
	"log"

	mqtt_auth "template_backend/mqtt/auth"

	"github.com/wind-c/comqtt/v2/mqtt"
	"github.com/wind-c/comqtt/v2/mqtt/hooks/auth"
	"github.com/wind-c/comqtt/v2/mqtt/listeners"
)

var server = mqtt.New(&mqtt.Options{
	InlineClient: true,
})

func PublishCommand(command string) error {
	return server.Publish("devices/commands", []byte(command), false, 0)
}

func PublishState(state string) error {
	return server.Publish("devices/publish-state", []byte(state), false, 0)
}

func PublishOptions(options string) error {
	return server.Publish("devices/publish-options", []byte(options), false, 0)
}

func SetupMqtt() {
	// Allow all connections.
	_ = server.AddHook(new(auth.AllowHook), nil)
	_ = server.AddHook(new(mqtt_auth.DeviceTopicPublishRestrictorHook), &mqtt_auth.DeviceTopicPublishRestrictorOptions{
		AllowedTopicPrefix: []string{"devices/notifications", "devices/options", "devices/state"},
		Server:             server,
	})
	_ = server.AddHook(new(mqtt_auth.DeviceTopicReadRestrictorHook), &mqtt_auth.DeviceTopicReadRestrictorOptions{
		AllowedTopicPrefix: []string{"devices/commands", "devices/publish-options", "devices/publish-state"},
		Server:             server,
	})
	_ = server.AddHook(new(DeviceReaderHook), nil)

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
