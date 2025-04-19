#!/usr/bin/env python3
"""
Smart Postal Box MQTT Client
----------------------------
Handles communication between the smart postal box and MQTT broker
"""

import os
import ssl
import time
import json
import logging
import signal
from typing import Dict, Any, Callable, Optional
import paho.mqtt.client as mqtt
import requests

# Optional imports for Raspberry Pi GPIO
try:
    import RPi.GPIO as GPIO
    RPI_AVAILABLE = True
except ImportError:
    RPI_AVAILABLE = False
    
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("mqtt-client")

# Default MQTT Configuration
DEFAULT_CONFIG = {
    'broker': 'localhost',
    'port': 1883,
    'client_id': 'smart-postal-box',
    'keep_alive': 60,
    'qos': 0,
    'device_id': '',
    'backend_url': "",
    'device_token': "",
    'reconnect_delay_min': 10,     # Minimum delay between reconnection attempts (seconds)
    'reconnect_delay_max': 120,   # Maximum delay between reconnection attempts (seconds)
    # Hardware configuration for Raspberry Pi
    'hardware_enabled': True,    # Whether to enable hardware control
    'stepper_pins': [14, 15, 17, 23],  # Default GPIO pins for stepper motor
    'hall_sensor_pin': 26,        # Default GPIO pin for Hall effect sensor
    'lock_open_steps': 175,       # Number of steps to open the lock
    'lock_close_steps': 175,      # Number of steps to close the lock
    'step_delay': 0.0025,          # Delay between stepper motor steps (seconds)
}

class HardwareController:
    """Controls Raspberry Pi hardware for the smart postal box"""
    
    def __init__(self, config, mqtt_client=None):
        self.config = config
        self.mqtt_client = mqtt_client
        self.enabled = config.get('hardware_enabled', False) and RPI_AVAILABLE
        self.box_open = False
        self.lock_open = False
        self.use_polling = False  # Flag for polling fallback
        self.last_poll_time = 0   # For timer-based polling
        
        if self.enabled:
            try:
                self._setup_gpio()
                logger.info("Hardware controller initialized")
                self._calibrate_lock()
                
                # Note about polling if needed
                if hasattr(self, 'use_polling') and self.use_polling:
                    logger.info("Using timer-based polling for hall sensor")
                    
            except Exception as e:
                logger.error(f"Failed to initialize hardware controller: {e}")
                self.enabled = False
        else:
            if not RPI_AVAILABLE:
                logger.info("RPi.GPIO not available, hardware control disabled")
            else:
                logger.info("Hardware control disabled in configuration")
    
    def _calibrate_lock(self):
        """Calibrate the lock"""
        if not self.enabled:
            logger.info("Hardware control disabled, simulating lock open")
            self.lock_open = False
            return True
            
        try:
            logger.info("Opening lock")
            self._control_stepper(self.config['lock_open_steps'] * 3, clockwise=False)
            self.lock_open = False
            return True
        except Exception as e:
            logger.error(f"Failed to open lock: {e}")
            return False

    def _setup_gpio(self):
        """Set up GPIO pins for stepper motor and hall effect sensor"""
        try:
            # Set up GPIO using BCM numbering
            GPIO.setmode(GPIO.BCM)
            GPIO.setwarnings(False)
            
            # Set up stepper motor pins as outputs
            for pin in self.config['stepper_pins']:
                GPIO.setup(pin, GPIO.OUT)
                GPIO.output(pin, GPIO.LOW)
            
            # Set up Hall effect sensor pin as input with pull-up resistor
            GPIO.setup(self.config['hall_sensor_pin'], GPIO.IN, pull_up_down=GPIO.PUD_UP)
            
            # Remove any existing event detection to avoid conflicts
            try:
                GPIO.remove_event_detect(self.config['hall_sensor_pin'])
            except:
                # If there's no event detection, this will fail but that's okay
                pass
                
            # Add event detection for the Hall effect sensor with error handling
            try:
                GPIO.add_event_detect(
                    self.config['hall_sensor_pin'], 
                    GPIO.BOTH, 
                    callback=self._hall_sensor_callback,
                    bouncetime=300
                )
                logger.info(f"Successfully set up hall effect sensor on pin {self.config['hall_sensor_pin']}")
            except Exception as e:
                logger.warning(f"Failed to add edge detection to hall sensor: {e}")
                logger.info("Falling back to polling method for hall sensor")
                # If event detection fails, we'll use a polling approach instead
                # We'll set a flag to indicate we need to poll
                self.use_polling = True
            
            # Initial state check
            self._check_box_state()
            
        except Exception as e:
            raise Exception(f"Failed to set up GPIO: {e}")
            
    def _hall_sensor_callback(self, channel):
        """Callback for Hall effect sensor state change"""
        self._check_box_state()
    
    def _check_box_state(self):
        """Check the current state of the box using the Hall effect sensor"""
        if not self.enabled:
            return
            
        try:
            # Read the Hall effect sensor
            # Typically, when a magnet is near, the sensor will be LOW
            # When the box is open (magnet away), the sensor will be HIGH
            new_state = GPIO.input(self.config['hall_sensor_pin']) == GPIO.HIGH
            
            if new_state != self.box_open:
                self.box_open = new_state
                logger.info(f"Box {'open' if self.box_open else 'closed'} detected")
                
                if self.mqtt_client:
                    # Publish state change
                    self.mqtt_client.publish("devices/notifications", {
                        "id": self.config['device_id'],
                        "type": "box_state",
                        "state": "open" if self.box_open else "closed",
                        "timestamp": int(time.time())
                    })
        except Exception as e:
            logger.error(f"Error checking box state: {e}")
    
    def open_lock(self):
        """Open the lock using the stepper motor"""
        if not self.enabled:
            logger.info("Hardware control disabled, simulating lock open")
            self.lock_open = True
            return True
            
        try:
            logger.info("Opening lock")
            self._control_stepper(self.config['lock_open_steps'], clockwise=True)
            self.lock_open = True
            return True
        except Exception as e:
            logger.error(f"Failed to open lock: {e}")
            return False
    
    def close_lock(self):
        """Close the lock using the stepper motor"""
        if not self.enabled:
            logger.info("Hardware control disabled, simulating lock close")
            self.lock_open = False
            return True
            
        try:
            logger.info("Closing lock")
            self._control_stepper(self.config['lock_close_steps'], clockwise=False)
            self.lock_open = False
            return True
        except Exception as e:
            logger.error(f"Failed to close lock: {e}")
            return False
    
    def disable_packtrap(self):
        """Disable packtrap mode"""
        if not self.enabled:
            logger.info("Hardware control disabled, disabling packtrap")
            return True
        
        self.packtrap_active = False

    def open_packtrap(self):
        """Open the lock and close as soon as a close signal is received"""
        if not self.enabled:
            logger.info("Hardware control disabled, simulating packtrap open")
            return True
        
        self.open_lock()
        
        # Only add event detection if we're not using polling
        if not hasattr(self, 'use_polling') or not self.use_polling:
            # Remove existing event detection if any
            try:
                GPIO.remove_event_detect(self.config['hall_sensor_pin'])
            except:
                pass
                
            # Add new event detection
            GPIO.add_event_detect(
                self.config['hall_sensor_pin'], 
                GPIO.RISING, 
                callback=self._close_packtrap_callback,
                bouncetime=300
            )
        else:
            # For polling mode, we'll set a flag that will be checked in check_updates
            self.packtrap_active = True
            logger.info("Packtrap activated in polling mode")
            
        return True
            
    def _close_packtrap_callback(self, channel):
        """Callback to close the lock when the box is closed in packtrap mode"""
        logger.info("Packtrap triggered, box closed - closing lock")
        # Wait a brief moment to ensure the box is fully closed
        time.sleep(0.5)
        self.close_lock()
        
        # If we're using event detection, clean it up
        if not hasattr(self, 'use_polling') or not self.use_polling:
            try:
                GPIO.remove_event_detect(self.config['hall_sensor_pin'])
            except:
                pass
            
            # Re-add the normal hall sensor event detection
            try:
                GPIO.add_event_detect(
                    self.config['hall_sensor_pin'], 
                    GPIO.BOTH, 
                    callback=self._hall_sensor_callback,
                    bouncetime=300
                )
            except Exception as e:
                logger.warning(f"Failed to restore hall sensor event detection: {e}")
    
    def _control_stepper(self, steps, clockwise=True):
        """Control the stepper motor"""
        # Stepper motor sequence for a 4-step sequence (full step)
        sequence = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]
        
        if not clockwise:
            sequence.reverse()
        
        for _ in range(steps):
            for step in sequence:
                for i, pin in enumerate(self.config['stepper_pins']):
                    GPIO.output(pin, step[i])
                time.sleep(self.config['step_delay'])
                
    def check_updates(self):
        """Periodic check method to be called from main loop"""
        if not self.enabled:
            return
            
        # If using polling for hall sensor, check periodically
        if hasattr(self, 'use_polling') and self.use_polling:
            current_time = time.time()
            # Poll every 0.2 seconds (5 times per second)
            if current_time - self.last_poll_time >= 0.2:
                # Check the current state
                previous_state = self.box_open
                self._check_box_state()
                
                # Handle packtrap mode if active
                if hasattr(self, 'packtrap_active') and self.packtrap_active:
                    # If box was open and now it's closed, trigger the packtrap
                    if previous_state and not self.box_open:
                        logger.info("Packtrap triggered via polling - box closed, closing lock")
                        # Wait a brief moment to ensure the box is fully closed
                        time.sleep(0.5)
                        self.close_lock()
                        self.packtrap_active = False
                
                self.last_poll_time = current_time
    
    def cleanup(self):
        """Clean up GPIO resources"""
        if self.enabled:
            try:
                GPIO.cleanup()
                logger.info("GPIO resources cleaned up")
            except Exception as e:
                logger.error(f"Failed to clean up GPIO resources: {e}")

class DeviceState:
    """Class to manage device state"""
    
    def __init__(self, mqtt_client=None, device_id=None):
        self.state = {}
        self.last_updated = 0
        self.state_version = 0
        self.mqtt_client = mqtt_client
        self.device_id = device_id

        # Register topic handlers
        self.mqtt_client.register_handler("devices/publish-options", self.handle_publish_options)
        self.mqtt_client.register_handler("devices/publish-state", self.handle_publish_state)
        self.mqtt_client.register_handler("devices/commands", self.handle_commands)
        self.mqtt_client.register_handler("devices/options", self.handle_options)
        logger.info(f"Initializing device state for device ID: {self.device_id}")
        
    def update(self, new_state):
        """Update the device state"""
        self.state = new_state
        self.last_updated = time.time()
        self.state_version += 1
        logger.info(f"Device state updated ({self.state})")
        
    def get(self):
        """Get the current device state"""
        return self.state
        
    def is_stale(self, max_age_seconds=60):
        """Check if the state is stale and needs refreshing"""
        return time.time() - self.last_updated > max_age_seconds
        
    def request_latest_state(self):
        """Request an update if state is stale"""
        if self.mqtt_client and self.is_stale():
            logger.debug("State is stale, requesting update")
            self.mqtt_client.request_latest_state()
        return self.get()
        
    def set_mqtt_client(self, mqtt_client):
        """Set the MQTT client reference"""
        self.mqtt_client = mqtt_client
        
    def change_state(self, state: str):           
        logger.info(f"Changing state to {state}")
        # Pass to hardware controller if available
        if hasattr(self.mqtt_client, 'hardware_controller'):
            hardware = self.mqtt_client.hardware_controller
            
            if (state == "pack" or state == "closed") and hardware and hardware.packtrap_active:
                hardware.disable_packtrap()

            if state == "open" and hardware:
                hardware.open_lock()
                hardware.disable_packtrap()
            
            elif state == "closed" and hardware:
                hardware.close_lock()
                hardware.disable_packtrap()
            
            elif state == "packtrap" and hardware:
                if hardware.lock_open:
                    hardware.open_packtrap()


    def handle_options(self, topic, payload):
        """Handle options messages"""
        if self._is_update_for_this_device(payload):
            logger.info(f"Options for device {self.device_id}: {payload}")
        else:
            pass

    def handle_commands(self, topic, payload):
        """Handle command messages"""
        if self._is_update_for_this_device(payload):
            logger.info(f"Commands for device {self.device_id}: {payload}")
        else:
            pass

    def handle_publish_options(self, topic, payload):
        """Handle publish options messages"""
        if self._is_update_for_this_device(payload):
            logger.info(f"Publish Options for device {self.device_id}: {payload}")
        else:
            pass

    def handle_publish_state(self, topic, payload):
        """Handle state updates from the broker"""
        try:
            if not self._is_update_for_this_device(payload):
                return
                
            logger.info(f"Received state update for device {self.device_id}")
            
            if isinstance(payload, dict):
                self.update(payload)
                self.change_state(payload['state'])
            elif isinstance(payload, str):
                # Try to parse JSON string
                try:
                    state_data = json.loads(payload)
                    self.update(state_data)
                    logger.info(f"State data: {state_data}")
                    self.change_state(state_data)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse state data: {payload}")
            else:
                logger.warning(f"Unexpected state payload type: {type(payload)}")
        except Exception as e:
            logger.error(f"Error handling state update: {e}")

    def publish_notification(self, data: str):
        self.mqtt_client.publish("devices/notifications", {
            "data": data
        })

    def _is_update_for_this_device(self, payload):
        """Check if the update is meant for this device"""
        try:
            if isinstance(payload, dict):
                # Check if payload contains device_id field
                if 'id' in payload:
                    return payload['id'] == self.device_id
                    
                # Check if payload contains a nested data structure with device_id
                if 'data' in payload and isinstance(payload['data'], dict):
                    if 'id' in payload['data']:
                        return payload['data']['id'] == self.device_id
            
            # If we can't determine the device ID from the payload, 
            # default to processing the message (old behavior)
            return False
        except Exception as e:
            logger.error(f"Error checking device ID in payload: {e}")
            return False

class PostalBoxMQTTClient:
    """MQTT Client for Smart Postal Box communications"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the MQTT client with the given configuration"""
        self.running = False
        self.connected = False
        self.config = DEFAULT_CONFIG.copy()
        self.reconnect_delay = self.config['reconnect_delay_min']
        self.last_state_request = 0
        self.last_connection_attempt = 0
        self.connection_attempts = 0
        self.device_id = config.get('device_id', '')
        
        # Update with provided config
        if config:
            self.config.update(config)
            
        # Initialize MQTT client with MQTT v3.1.1 (more widely supported)
        self.client = mqtt.Client(
            client_id=self.config['client_id'],
            protocol=mqtt.MQTTv311,
            transport="websockets"
        )
        self.client.ws_set_options(path="/")
        self.client.tls_set(cert_reqs=ssl.CERT_NONE)


        # Enable automatic reconnect with exponential backoff
        self.client.reconnect_delay_set(
            min_delay=self.config['reconnect_delay_min'],
            max_delay=self.config['reconnect_delay_max']
        )
        
        # Set up callbacks
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        self.client.on_publish = self._on_publish
        self.client.on_subscribe = self._on_subscribe
    
            
        # Set up message handlers for specific topics
        self.topic_handlers = {}
        
        # Subscribe to default topics
        self.default_subscriptions = [
            "devices/publish-options",
            "devices/publish-state",
            "devices/commands",
            "devices/options",
        ]
        
        # Initialize hardware controller if enabled
        self.hardware_controller = HardwareController(self.config, self)
        
    def get_auth_token(self):
        # Disable SSL verification for requests
        response = requests.post(
            f"{self.config['backend_url']}/login", 
            json={"token": self.config['device_token']},
            verify=False
        )
        return response.headers["Authorization"].split(" ")[1]
    
    def connect(self) -> bool:
        """Connect to the MQTT broker"""
        self.last_connection_attempt = time.time()
        self.connection_attempts += 1
        
        try:
            logger.info(f"Connecting to MQTT broker at {self.config['broker']}:{self.config['port']} (attempt #{self.connection_attempts})")
            self.client.connect(
                self.config['broker'],
                port=self.config['port'],
                keepalive=self.config['keep_alive'],
            )
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            return False
            
    def start(self):
        """Start the MQTT client loop"""
        if not self.connected:
            self.connect()
            
        self.running = True
        self.client.loop_start()
        logger.info("MQTT client started")
        
    def stop(self):
        """Stop the MQTT client loop and disconnect"""
        self.running = False
        self.client.loop_stop()
        self.client.disconnect()
        
        # Clean up hardware resources
        if hasattr(self, 'hardware_controller'):
            self.hardware_controller.cleanup()
            
        logger.info("MQTT client stopped")
        
    def subscribe(self, topic: str, qos: int = None):
        """Subscribe to a specific topic"""
        if qos is None:
            qos = self.config['qos']
            
        full_topic = f"{topic}"
        self.client.subscribe(full_topic, qos)
        logger.info(f"Subscribed to {full_topic} with QoS {qos}")
        
    def publish(self, topic: str, payload: Any, qos: int = None, retain: bool = False):
        """Publish a message to a specific topic"""
        if qos is None:
            qos = self.config['qos']
            
        token = self.get_auth_token()
        # Convert payload to JSON string if it's a dict
        if isinstance(payload, dict):
            payload = json.dumps({**payload, "token": token})
            
        full_topic = f"{topic}"
        info = self.client.publish(
            full_topic,
            payload=payload,
            qos=qos,
            retain=retain
        )
        
        # Check if the message has been queued
        if info.is_published():
            logger.debug(f"Message published to {full_topic}")
        else:
            logger.debug(f"Message queued for {full_topic}")
            
        return info
        
    def register_handler(self, topic: str, handler: Callable[[str, Any], None]):
        """Register a handler for a specific topic"""
        self.topic_handlers[topic] = handler
        logger.debug(f"Registered handler for topic {topic}")
        
    def request_latest_state(self):
        """Request the latest state from the broker"""
        current_time = time.time()
        # Prevent too frequent state requests (at most once every 5 seconds)
        if current_time - self.last_state_request < 5:
            logger.debug("Skipping state request due to rate limiting")
            return
            
        try:
            token = self.get_auth_token()
            logger.info("Requesting latest state from broker")
            self.publish("devices/state", {"token": token})
            self.last_state_request = current_time
        except Exception as e:
            logger.error(f"Failed to request latest state: {e}")
            
    def _on_connect(self, client, userdata, flags, rc):
        """Callback for when client connects to the broker"""
        if rc == 0:
            self.connected = True
            logger.info("Connected to MQTT broker")
            # Reset reconnect delay on successful connection
            self.reconnect_delay = self.config['reconnect_delay_min']
            
            # Subscribe to default topics
            for topic in self.default_subscriptions:
                self.client.subscribe(topic, self.config['qos'])
                logger.info(f"Subscribed to {topic}")
                
            # Request latest state after connection or reconnection
            self.request_latest_state()
        else:
            self.connected = False
            logger.error(f"Failed to connect to MQTT broker with code {rc}")
            
    def _on_disconnect(self, client, userdata, rc):
        """Callback for when client disconnects from the broker"""
        previous_state = self.connected
        self.connected = False
        
        if rc != 0:
            # Only log if we were previously connected to avoid spam during reconnect attempts
            if previous_state:
                logger.warning(f"Unexpected disconnection from MQTT broker with code {rc}")
                logger.info(f"Will attempt to reconnect in {self.reconnect_delay} seconds")
        else:
            logger.info("Disconnected from MQTT broker")
            
    def _on_message(self, client, userdata, msg):
        """Callback for when a message is received from the broker"""
        try:
            topic = msg.topic
            payload = msg.payload.decode('utf-8')
            logger.debug(f"Received message on {topic}: {payload}")
            
            # Try to parse JSON payload
            try:
                payload = json.loads(payload)
            except json.JSONDecodeError:
                # Not JSON, keep as string
                pass
            
            # Check for exact topic match
            if topic in self.topic_handlers:
                self.topic_handlers[topic](topic, payload)
                return
                
            # Check for wildcard matches
            for registered_topic, handler in self.topic_handlers.items():
                if self._topic_matches(registered_topic, topic):
                    handler(topic, payload)
                    return
                    
            # Handle command topics
            if topic.startswith(f"command/"):
                command = topic.split('/')[-1]
                self._handle_command(command, payload)
                
            # Handle status requests
            elif topic == f"status/request":
                self._publish_status()
                
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            
    def _on_publish(self, client, userdata, mid):
        """Callback for when a message is published"""
        logger.debug(f"Message {mid} published")
        
    def _on_subscribe(self, client, userdata, mid, granted_qos):
        """Callback for when a subscription is made"""
        logger.debug(f"Subscription {mid} confirmed")
        
    def _handle_command(self, command: str, payload: Any):
        """Handle a command received from the broker"""
        logger.info(f"Received command: {command} with payload: {payload}")
        # Implement command handling specific to postal box
        
    def _publish_status(self):
        """Publish the current status of the postal box"""
        status = {
            "timestamp": int(time.time()),
            "state": "unknown",  # Will be replaced with actual state
            "device_id": self.config['client_id']
        }
        self.publish("status/update", status)
        
    def _topic_matches(self, pattern: str, topic: str) -> bool:
        """Check if a topic matches a pattern with wildcards"""
        pattern_parts = pattern.split('/')
        topic_parts = topic.split('/')
        
        if len(pattern_parts) == 0:
            return len(topic_parts) == 0
            
        if (pattern_parts[0] == '+' or pattern_parts[0] == topic_parts[0]):
            if len(pattern_parts) == 1:
                return len(topic_parts) == 1
            return self._topic_matches('/'.join(pattern_parts[1:]), '/'.join(topic_parts[1:]))
            
        if pattern_parts[0] == '#':
            return True
            
        return False

    def check_connection_status(self):
        """Check connection status and attempt manual reconnect if necessary"""
        if not self.connected and time.time() - self.last_connection_attempt > 60:
            logger.warning("No connection for over 60 seconds, attempting manual reconnect")
            try:
                self.client.disconnect()  # Ensure clean state
                time.sleep(1)  # Short delay
                self.connect()
            except Exception as e:
                logger.error(f"Manual reconnection failed: {e}")

config = {
    'broker': os.environ.get('MQTT_BROKER', DEFAULT_CONFIG['broker']),
    'port': int(os.environ.get('MQTT_PORT', DEFAULT_CONFIG['port'])),
    'client_id': os.environ.get('MQTT_CLIENT_ID', DEFAULT_CONFIG['client_id']),
    'device_id': os.environ.get('DEVICE_ID', DEFAULT_CONFIG['client_id']),
    'backend_url': os.environ.get('BACKEND_URL', DEFAULT_CONFIG['backend_url']),
    'device_token': os.environ.get('DEVICE_TOKEN', DEFAULT_CONFIG['device_token']),
    'hardware_enabled': os.environ.get('HARDWARE_ENABLED', '').lower() in ('true', '1', 'yes'),
    'stepper_pins': [
        int(os.environ.get('STEPPER_PIN_1', DEFAULT_CONFIG['stepper_pins'][0])),
        int(os.environ.get('STEPPER_PIN_2', DEFAULT_CONFIG['stepper_pins'][1])),
        int(os.environ.get('STEPPER_PIN_3', DEFAULT_CONFIG['stepper_pins'][2])),
        int(os.environ.get('STEPPER_PIN_4', DEFAULT_CONFIG['stepper_pins'][3])),
    ],
    'hall_sensor_pin': int(os.environ.get('HALL_SENSOR_PIN', DEFAULT_CONFIG['hall_sensor_pin'])),
    'lock_open_steps': int(os.environ.get('LOCK_OPEN_STEPS', DEFAULT_CONFIG['lock_open_steps'])),
    'lock_close_steps': int(os.environ.get('LOCK_CLOSE_STEPS', DEFAULT_CONFIG['lock_close_steps'])),
    'step_delay': float(os.environ.get('STEP_DELAY', DEFAULT_CONFIG['step_delay'])),
}

def main():
    """Main function"""
    mqtt_client = PostalBoxMQTTClient(config)
    device_state = DeviceState(mqtt_client, config['device_id'])
    
    def signal_handler(sig, frame):
        logger.info("Shutting down...")
        if mqtt_client:
            mqtt_client.stop()
        exit(0)
        
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Connect and start the client
    if mqtt_client.connect():
        mqtt_client.start()
        
        # Keep the main thread alive
        disconnected_time = 0
        
        while mqtt_client.running:
            # Check connection state
            if not mqtt_client.connected:
                if disconnected_time == 0:
                    disconnected_time = time.time()
                
                # Log periodic updates about disconnection status
                elapsed = time.time() - disconnected_time
                if elapsed > 30:
                    logger.warning(f"Still disconnected after {int(elapsed)} seconds")
                    mqtt_client.check_connection_status()
            else:
                # Reset disconnected time when connected
                disconnected_time = 0
                
                # Periodically check if state needs refreshing
                if device_state.is_stale(30):  # Check every 30 seconds
                    logger.debug("Refreshing device state")
                    device_state.request_latest_state()  # Use refactored method
                
            # If hardware controller is available, call its check_updates method
            if hasattr(mqtt_client, 'hardware_controller') and mqtt_client.hardware_controller:
                mqtt_client.hardware_controller.check_updates()
                
            time.sleep(0.1)  # Shorter sleep for more responsive polling
    else:
        logger.error("Failed to connect to MQTT broker. Exiting.")
        exit(1)

if __name__ == "__main__":
    main()
