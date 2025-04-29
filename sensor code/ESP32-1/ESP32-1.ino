#include <WiFi.h>
#include <DHT.h>
#include "MHZ19.h"

// Wi-Fi Credentials
const char* ssid = "Root12";
const char* password = "12345679";

const char* ssid1 = "ROBOTIC_P";
const char* password1 = "7518888786";
#include <DHT.h>
#include "MHZ19.h"

// --- Sensor Pin Config ---
#define DHT_PIN 14
#define DHT_TYPE DHT11
#define RX_PIN 33      // MH-Z19 Tx pin
#define TX_PIN 32      // MH-Z19 Rx pin
#define FLOW_PIN 22    // YF-G1 signal pin
#define BAUDRATE 9600  // MH-Z19 baud rate

// --- Objects ---
DHT dht(DHT_PIN, DHT_TYPE);
MHZ19 myMHZ19;
HardwareSerial mySerial(1);

WiFiServer server(80); // HTTP server on port 80

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
  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }

  Serial.println("\nConnected to Wi-Fi");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
    Serial.begin(115200);
  dht.begin();
  mySerial.begin(BAUDRATE, SERIAL_8N1, RX_PIN, TX_PIN);
  myMHZ19.begin(mySerial);
  myMHZ19.autoCalibration();

  pinMode(FLOW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), pulseCounter, RISING);

  // Start the server (no Wi-Fi connection logic here)
  server.begin();
}

void loop() {
    // --- Flow Rate Calculation ---
  unsigned long currentTime = millis();
  if (currentTime - lastTime >= 1000) {
    noInterrupts();
    float frequency = pulseCount;
    pulseCount = 0;
    interrupts();

    flowRate = (frequency / calibrationFactor) * 60.0; // L/min
    lastTime = currentTime;
  }

  // --- Handle Client Request ---
  WiFiClient client = server.available();
  if (client) {
    while (client.connected()) {
      if (client.available()) {
        String request = client.readStringUntil('\r');
        client.flush();

        if (request.indexOf("GET /") >= 0) {
          float temperature = readDHTTemperature();
          float humidity = readDHTHumidity();
          int CO2 = readCO2();

          String jsonResponse = String("{\"Temperature\": ") + temperature +
                                ", \"Humidity\": " + humidity +
                                ", \"CO2\": " + CO2 +
                                ", \"FlowRate\": " + flowRate + "}";

          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: application/json");
          client.println("Connection: close");
          client.println();
          client.println(jsonResponse);
        }
        break;
      }
    }
    client.stop();
  }
}

float readDHTTemperature() {
  float t = dht.readTemperature();
  return isnan(t) ? -1 : t;
}

float readDHTHumidity() {
  float h = dht.readHumidity();
  return isnan(h) ? -1 : h;
}

int readCO2() {
  int CO2 = myMHZ19.getCO2();
  return CO2 <= 0 ? -1 : CO2;
}