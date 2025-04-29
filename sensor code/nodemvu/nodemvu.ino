const int pump1 = D1;  // Relay 1
const int pump2 = D2;  // Relay 2

void setup() {
  pinMode(pump1, OUTPUT);
  pinMode(pump2, OUTPUT);

  // Start with both pumps OFF (relay OFF = HIGH if using active-low relays)
  digitalWrite(pump1, HIGH);
  digitalWrite(pump2, HIGH);
}

void loop() {
  // Turn Pump 1 ON
  digitalWrite(pump1, LOW);
  delay(3000); // Pump 1 ON for 3 seconds
  digitalWrite(pump1, HIGH);

  // Turn Pump 2 ON
  digitalWrite(pump2, LOW);
  delay(3000); // Pump 2 ON for 3 seconds
  digitalWrite(pump2, HIGH);

  delay(5000); // Wait 5 seconds
}
