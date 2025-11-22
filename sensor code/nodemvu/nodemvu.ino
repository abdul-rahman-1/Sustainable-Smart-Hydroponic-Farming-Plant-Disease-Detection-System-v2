const int pump = D1;  // Relay 1

void setup() {
  pinMode(pump, OUTPUT);

  // Start with both pumps OFF (relay OFF = HIGH if using active-low relays)
  digitalWrite(pump, HIGH);
}

void loop() {
  // Turn Pump 1 ON
  digitalWrite(pump, LOW);
  delay(30000); // Pump 1 ON for 3 seconds
  digitalWrite(pump, HIGH);

  delay(5000); // Wait 5 seconds
}
