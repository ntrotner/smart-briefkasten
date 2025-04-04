package database_notification

import (
	"time"
)

// Notification represents a notification from a device
type Notification struct {
	ID        string    `json:"_id,omitempty"`
	Rev       string    `json:"_rev,omitempty"`
	DeviceID  string    `json:"deviceId,omitempty"`
	Topic     string    `json:"topic,omitempty"`
	Payload   string    `json:"payload,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
	UpdatedAt time.Time `json:"updatedAt,omitempty"`
}
