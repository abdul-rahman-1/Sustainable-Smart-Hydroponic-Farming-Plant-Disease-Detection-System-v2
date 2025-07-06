#include <WiFi.h>
#include <DHT.h>
#include "MHZ19.h"
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_TSL2561_U.h>

// --- Wi-Fi Credentials ---
const char* ssid = "ROBOTIC_P";
const char* password = "7518888786";

// --- Sensor Pin Config ---
#define DHT_PIN 14
#define DHT_TYPE DHT11
#define RX_PIN 33      // MH-Z19 Tx pin
#define TX_PIN 32      // MH-Z19 Rx pin
#define FLOW_PIN 22    // YF-G1 signal pin
#define SDA_PIN 17     // TSL2561 SDA   on main boad revers the light sensor connections 
#define SCL_PIN 16     // TSL2561 SCL
#define BAUDRATE 9600  // MH-Z19 baud rate

// --- Objects ---
DHT dht(DHT_PIN, DHT_TYPE);
MHZ19 myMHZ19;
HardwareSerial mySerial(1);
WiFiServer server(80);
Adafruit_TSL2561_Unified tsl = Adafruit_TSL2561_Unified(TSL2561_ADDR_FLOAT, 12345);

// --- Water Flow ---
volatile int pulseCount = 0;
unsigned long lastTime = 0;
float flowRate = 0.0;
const float calibrationFactor = 450.0;

// --- Interrupt Handler ---
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);

  // I2C for TSL2561 on custom pins
  Wire.begin(SDA_PIN, SCL_PIN);

  // Wi-Fi Connect
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }

  Serial.println("\nConnected to Wi-Fi");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  // Sensor Setup
  dht.begin();
  mySerial.begin(BAUDRATE, SERIAL_8N1, RX_PIN, TX_PIN);
  myMHZ19.begin(mySerial);
  myMHZ19.autoCalibration();

  pinMode(FLOW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), pulseCounter, RISING);

  // TSL2561 Setup
  if (!tsl.begin()) {
    Serial.println("TSL2561 not detected");
  } else {
    tsl.enableAutoRange(true);
    tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_402MS);
  }

  server.begin();
}

void loop() {
  // Flow Rate Update
  unsigned long currentTime = millis();
  if (currentTime - lastTime >= 1000) {
    noInterrupts();
    float frequency = pulseCount;
    pulseCount = 0;
    interrupts();
    flowRate = (frequency / calibrationFactor) * 60.0; // L/min
    lastTime = currentTime;
  }

  // Handle Client
  WiFiClient client = server.available();
  if (client) {
    while (client.connected()) {
      if (client.available()) {
        String req = client.readStringUntil('\r');
        client.flush();

        if (req.indexOf("GET /") >= 0) {
          float temperature = readDHTTemperature();
          float humidity = readDHTHumidity();
          int co2ppm = readCO2();
          float lux = readLight();

          String json = String("{\"Temperature\": ") + temperature +
                        ", \"Humidity\": " + humidity +
                        ", \"CO2\": " + co2ppm +
                        ", \"FlowRate\": " + flowRate +
                        ", \"Lux\": " + lux + "}";

          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: application/json");
          client.println("Connection: close");
          client.println();
          client.println(json);
        }
        break;
      }
    }
    client.stop();
  }
}

// --- Sensor Functions ---
float readDHTTemperature() {
  float t = dht.readTemperature();
  return isnan(t) ? -1 : t;
}

float readDHTHumidity() {
  float h = dht.readHumidity();
  return isnan(h) ? -1 : h;
}

int readCO2() {
  int ppm = myMHZ19.getCO2();
  return (ppm <= 0) ? -1 : ppm;
}

float readLight() {
  sensors_event_t event;
  tsl.getEvent(&event);
  return event.light ? event.light : -1;
}
