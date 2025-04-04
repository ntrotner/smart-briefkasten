package database_device

type DeviceState string

const (
	OpenState     DeviceState = "open"
	ClosedState   DeviceState = "closed"
	PacktrapState DeviceState = "packtrap"
)

type DeviceProfile struct {
	ID        string        `json:"_id,omitempty"`
	Rev       string        `json:"_rev,omitempty"`
	Token     string        `json:"token,omitempty"`
	State     DeviceState   `json:"state,omitempty"`
	Options   DeviceOptions `json:"options,omitempty"`
	CreatedAt int64         `json:"created_at,omitempty"`
	UpdatedAt int64         `json:"updated_at,omitempty"`
}

type DeviceChangeState struct {
	State             DeviceState `json:"state,omitempty"`
	EmitPacktrapEvent bool        `json:"emitPacktrapEvent,omitempty"`
	EmitOpenEvent     bool        `json:"emitOpenEvent,omitempty"`
}

type DeviceOptions struct {
	Name  string       `json:"name,omitempty"`
	Wifi  WifiOptions  `json:"wifi,omitempty"`
	Kafka KafkaOptions `json:"kafka,omitempty"`
}

type WifiOptions struct {
	SSID     string `json:"ssid,omitempty"`
	Password string `json:"password,omitempty"`
}

type KafkaOptions struct {
	URL string `json:"url,omitempty"`
}

type PublicDeviceProfile struct {
	ID      string        `json:"_id,omitempty"`
	State   DeviceState   `json:"state,omitempty"`
	Options DeviceOptions `json:"options,omitempty"`
}
