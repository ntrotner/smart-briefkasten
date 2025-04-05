package mqtt_auth

import (
	"strings"

	"github.com/rs/zerolog/log"
	"github.com/wind-c/comqtt/v2/mqtt"
)

type DeviceTopicReadRestrictorOptions struct {
	AllowedTopicPrefix []string
	Server             *mqtt.Server
}

// DeviceTopicReadRestrictorHook restricts external clients to only read from a specific topic
type DeviceTopicReadRestrictorHook struct {
	mqtt.HookBase
	config *DeviceTopicReadRestrictorOptions
}

// ID returns the ID of the hook.
func (h *DeviceTopicReadRestrictorHook) ID() string {
	return "auth-device-topic-read-restrictor"
}

// OnACLCheck is called when a client attempts to publish to a topic
func (h *DeviceTopicReadRestrictorHook) OnACLCheck(cl *mqtt.Client, topic string, write bool) bool {
	// Allow all subscriptions (non-write operations)
	if write {
		return true
	}

	// For read operations, check if the topic is allowed
	for _, prefix := range h.config.AllowedTopicPrefix {
		if strings.HasPrefix(topic, prefix) {
			log.Debug().
				Str("client", cl.ID).
				Str("topic", topic).
				Msg("Allowed read from device topic")
			return true
		}
	}

	// If the topic doesn't match the allowed prefix, deny the read
	log.Warn().
		Str("client", cl.ID).
		Str("topic", topic).
		Str("allowed_prefix", strings.Join(h.config.AllowedTopicPrefix, ", ")).
		Msg("Denied read from unauthorized topic")
	return false
}
