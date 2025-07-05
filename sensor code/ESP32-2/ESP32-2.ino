#include <WiFi.h>

// Wi-Fi Credentials
const char* ssid = "ROBOTIC_P";
const char* password = "7518888786";

// Pin Definitions
#define TRIG_PIN 5        // Ultrasonic TRIG
#define ECHO_PIN 18       // Ultrasonic ECHO
#define TDS_PIN 34        // TDS analog pin
#define PH_PIN 35         // pH analog pin

WiFiServer server(80);    // HTTP server

// pH Calibration Constant (adjust after testing)
float calibration_value = 16.96;

void setup() {
  Serial.begin(115200);

  // Sensor Pin Setup
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  analogReadResolution(12); // 0–4095 for ESP32 ADC

  // Wi-Fi Connection
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi connected.");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  server.begin();
}

void loop() {
  WiFiClient client = server.available();

  if (client) {
    while (client.connected()) {
      if (client.available()) {
        String request = client.readStringUntil('\r');
        client.flush();

        if (request.indexOf("GET /") >= 0) {
          float distance = readUltrasonicDistance();
          float tds = readTDS();
          float phValue = readPH();

          // Build minimal JSON response (no pH voltage)
          String jsonResponse = String("{\"Distance\": ") + distance +
                                ", \"TDS\": " + tds +
                                ", \"pH_Value\": " + String(phValue, 2) + "}";

          // Send HTTP response
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

// --- Sensor Functions ---

float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // timeout after 30ms
  return duration * 0.034 / 2.0;
}

float readTDS() {
  int tdsRaw = analogRead(TDS_PIN);
  float voltage = tdsRaw * (3.3 / 4095.0);
  float tds = (133.42 * pow(voltage, 3)
              - 255.86 * pow(voltage, 2)
              + 857.39 * voltage) * 0.5;
  return tds;
}

float readPH() {
  int buffer[10];
  for (int i = 0; i < 10; i++) {
    buffer[i] = analogRead(PH_PIN);
    delay(20);
  }

  // Sort to filter spikes
  for (int i = 0; i < 9; i++) {
    for (int j = i + 1; j < 10; j++) {
      if (buffer[i] > buffer[j]) {
        int temp = buffer[i];
        buffer[i] = buffer[j];
        buffer[j] = temp;
      }
    }
  }

  unsigned long avgval = 0;
  for (int i = 2; i < 8; i++) {
    avgval += buffer[i];
  }

  float voltage = avgval * 3.3 / 4095.0 / 6.0;
  float phValue = -5.70 * voltage + calibration_value;
  return phValue;
}
