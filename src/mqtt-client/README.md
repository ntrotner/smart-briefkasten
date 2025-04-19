# Smart Postal Box MQTT Client

This Python client connects the Smart Postal Box to an MQTT broker for remote management and monitoring.

## Features

- Connect to any MQTT broker (supports MQTT v5)
- Secure connection with TLS and authentication (enabled by default)
- WebSocket transport for connecting through firewalls/proxies
- Device-specific state management with filtering
- Automatic reconnection handling
- Custom topic handlers
- Environment variable configuration

## Installation

1. Make sure you have Python 3.7+ installed
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Configuration

The client can be configured using environment variables:

| Environment Variable | Description                             | Default         |
|----------------------|-----------------------------------------|-----------------|
| MQTT_BROKER          | MQTT broker hostname or IP              | localhost       |
| MQTT_PORT            | MQTT broker port                        | 1883            |
| MQTT_CLIENT_ID       | Client ID for MQTT connection           | smart-postal-box |
| MQTT_USERNAME        | Username for broker authentication      | None            |
| MQTT_PASSWORD        | Password for broker authentication      | None            |
| MQTT_BASE_TOPIC      | Base topic for all messages             | postal-box      |
| DEVICE_ID            | Unique device identifier                | None            |
| BACKEND_URL          | URL for token request                   | None            |
| DEVICE_TOKEN         | Permanent Device token                  | None            |


## Usage

Run the client:

```bash
python main.py
```

### Topic Structure

- `devices/publish-options` - Device options updates
- `devices/publish-state` - Device state updates
- `devices/commands` - Commands for the device
- `devices/options` - Device options requests
- `devices/state` - Device state requests
- `devices/notifications` - Device notifications

## Development

To extend this client, you can add custom command handlers in the `_handle_command` method or register new topic handlers using the `register_handler` method. 

# Setup Raspberry Pi OS Lite
1. Run `rpi-imager`
2. OS Customizations
    1. username + password
    2. Setup WLAN
3. Copy systemd services to `/rootfs/etc/systemd/`
4. Adjust paths and user
5. Run
    1. `sudo apt install python3-paho-mqtt`
    2. `sudo apt install python3-rpi.gpio`