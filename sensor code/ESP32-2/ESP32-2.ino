#include <WiFi.h>

// Wi-Fi Credentials
const char* ssid = "Root12";
const char* password = "12345679";

const char* ssid1 = "ROBOTIC_P";
const char* password1 = "7518888786";
// Pin definitions
#define TRIG_PIN 5
#define ECHO_PIN 18
#define TDS_PIN 34

WiFiServer server(80); // Start server on port 80

void setup() {
  Serial.begin(115200);

  // Setup pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  analogReadResolution(12); // 12-bit ADC (0–4095)

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

  server.begin(); // Start HTTP server
}

void loop() {
  // Wait for client
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Client connected");

    // Wait until data is available
    while (!client.available()) {
      delay(1);
    }

    // Read client request (not used)
    String req = client.readStringUntil('\r');
    client.flush();

    // --- Ultrasonic Distance Measurement ---
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance_cm = duration * 0.034 / 2.0;

    // --- TDS Sensor Reading ---
    int analogValue = analogRead(TDS_PIN);
    float voltage = analogValue * (3.3 / 4095.0);
    float tdsValue = (133.42 * voltage * voltage * voltage
                      - 255.86 * voltage * voltage
                      + 857.39 * voltage) * 0.5;

    // --- Print to Serial Monitor ---
    Serial.print("Distance: ");
    Serial.print(distance_cm);
    Serial.println(" cm");

    Serial.print("TDS: ");
    Serial.print(tdsValue);
    Serial.println(" ppm");

    // --- Send JSON response ---
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.println();

    String json = "{";
    json += "\"Distance_cm\": " + String(distance_cm, 2) + ",";
    json += "\"TDS_ppm\": " + String(tdsValue, 2);
    json += "}";

    client.println(json);
    delay(1000);
  }
}
