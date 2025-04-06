#!/bin/bash
# Smart Postal Box MQTT Client Startup Script

# Default configuration
MQTT_BROKER=${MQTT_BROKER:-""}
MQTT_PORT=${MQTT_PORT:-443}
MQTT_CLIENT_ID=${MQTT_CLIENT_ID:-""}
MQTT_USERNAME=${MQTT_USERNAME:-""}
MQTT_PASSWORD=${MQTT_PASSWORD:-""}
DEVICE_ID=${DEVICE_ID:-""}
BACKEND_URL=${BACKEND_URL:-""}
DEVICE_TOKEN=${DEVICE_TOKEN:-""}

# Help function
show_help() {
    echo "Smart Postal Box MQTT Client"
    echo ""
    echo "Usage: ./start.sh [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help                 Show this help message"
    echo "  -b, --broker HOSTNAME      MQTT broker hostname (default: $MQTT_BROKER)"
    echo "  -p, --port PORT            MQTT broker port (default: $MQTT_PORT)"
    echo "  -i, --id CLIENT_ID         MQTT client ID (default: $MQTT_CLIENT_ID)"
    echo "  -u, --username USERNAME    MQTT username"
    echo "  -w, --password PASSWORD    MQTT password"
    echo "  -d, --device-id DEVICE_ID  Unique device identifier (default: $DEVICE_ID)"
    echo "  -b, --backend-url BACKEND_URL  Backend URL (default: $BACKEND_URL)"
    echo "  -t, --device-token DEVICE_TOKEN  Device token (default: $DEVICE_TOKEN)"
    echo "Example:"
    echo "  ./start.sh --broker mqtt.example.com --port 1883 --username admin --password secret"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            show_help
            exit 0
            ;;
        -b|--broker)
            MQTT_BROKER="$2"
            shift 2
            ;;
        -p|--port)
            MQTT_PORT="$2"
            shift 2
            ;;
        -i|--id)
            MQTT_CLIENT_ID="$2"
            shift 2
            ;;
        -u|--username)
            MQTT_USERNAME="$2"
            shift 2
            ;;
        -w|--password)
            MQTT_PASSWORD="$2"
            shift 2
            ;;
        -d|--device-id)
            DEVICE_ID="$2"
            shift 2
            ;;
        -b|--backend-url)
            BACKEND_URL="$2"
            shift 2
            ;;
        -t|--device-token)
            DEVICE_TOKEN="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Display configuration
echo "Starting MQTT client with the following configuration:"
echo "Broker:     $MQTT_BROKER:$MQTT_PORT"
echo "Client ID:  $MQTT_CLIENT_ID"
if [[ -n "$MQTT_USERNAME" ]]; then
    echo "Username:   $MQTT_USERNAME"
fi

# Export environment variables
export MQTT_BROKER
export MQTT_PORT
export MQTT_CLIENT_ID
export MQTT_USERNAME
export MQTT_PASSWORD
export DEVICE_ID
export BACKEND_URL
export DEVICE_TOKEN

# Run the Python script
echo "Starting MQTT client..."
python3 main.py 