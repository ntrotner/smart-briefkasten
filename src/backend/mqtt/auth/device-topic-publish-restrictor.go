package mqtt_auth

import (
	"strings"

	"github.com/rs/zerolog/log"
	"github.com/wind-c/comqtt/v2/mqtt"
)

type DeviceTopicPublishRestrictorOptions struct {
	AllowedTopicPrefix []string
	Server             *mqtt.Server
}

// DeviceTopicPublishRestrictorHook restricts external clients to only publish on a specific topic
type DeviceTopicPublishRestrictorHook struct {
	mqtt.HookBase
	config *DeviceTopicPublishRestrictorOptions
}

// ID returns the ID of the hook.
func (h *DeviceTopicPublishRestrictorHook) ID() string {
	return "auth-device-topic-publish-restrictor"
}

// OnACLCheck is called when a client attempts to publish to a topic
func (h *DeviceTopicPublishRestrictorHook) OnACLCheck(cl *mqtt.Client, topic string, write bool) bool {
	// Allow all subscriptions (non-write operations)
	if !write {
		return true
	}

	// For publish operations, check if the topic is allowed
	for _, prefix := range h.config.AllowedTopicPrefix {
		if strings.HasPrefix(topic, prefix) {
			log.Debug().
				Str("client", cl.ID).
				Str("topic", topic).
				Msg("Allowed publish to device topic")
			return true
		}
	}

	// If the topic doesn't match the allowed prefix, deny the publish
	log.Warn().
		Str("client", cl.ID).
		Str("topic", topic).
		Str("allowed_prefix", strings.Join(h.config.AllowedTopicPrefix, ", ")).
		Msg("Denied publish to unauthorized topic")
	return false
}
