// =========================================================================
//         STASIUN CUACA ESP32 DENGAN WEB DASHBOARD - VERSI FINAL
// =========================================================================
// Fitur Final:
// - Mengirim data ke server publik (online) dan server lokal.
// - Respons buzzer instan & lagu tema saat hujan.
// - Logika non-blocking untuk performa yang responsif.
// =========================================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_Sensor.h>

// --- Definisi Nada untuk Lagu ---
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_AS4 466
#define NOTE_B4  494
#define NOTE_C5  523
#define NOTE_D5  587
#define NOTE_E5  659
#define NOTE_F5  698
#define NOTE_G5  784
#define NOTE_A5  880

// --- KONFIGURASI PENGGUNA ---
const char* ssid = "NHK88.NET"; // Ganti dengan nama WiFi Anda
const char* password = "11123111"; // Ganti dengan password WiFi Anda

// Definisikan dua alamat server
const char* serverPublik = "http://cuaca.optikl.ink/receive_data.php";
const char* serverLokal = "http://192.168.1.241/weather_dashboard_php/receive_data.php"; // Ganti dengan IP lokal Anda jika perlu

// Definisikan pin perangkat keras
#define RAIN_SENSOR_PIN 25
#define BUZZER_PIN 26
#define DHTPIN 4
#define DHTTYPE DHT11

// Alamat I2C
#define BMP280_ADDRESS 0x76
#define LCD_ADDRESS    0x27

// --- Interval Timing ---
const long SENSOR_READ_INTERVAL = 500; // Baca sensor setiap 500ms
const long POSTING_INTERVAL = 10000;   // Kirim data setiap 10 detik
const long LCD_UPDATE_INTERVAL = 5000;   // Update LCD setiap 5 detik

// --- OBJEK DAN VARIABEL GLOBAL ---
Adafruit_BMP280 bmp;
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(LCD_ADDRESS, 16, 2);

float temperature = 0.0, humidity = 0.0, pressure = 0.0, altitude = 0.0;
bool isRaining = false;
String condition = "INIT";

unsigned long previousSensorReadMillis = 0, previousPostingMillis = 0, previousLcdUpdateMillis = 0;
int lcdScreenState = 0;
bool wasRaining = false;
bool isPlayingTheme = false;
int currentNoteIndex = 0;
unsigned long noteStartTime = 0;

// --- Lagu Tema Super Mario Bros ---
int tempo = 120;
int marioMelody[] = {
  NOTE_E5, NOTE_E5, 0, NOTE_E5, 0, NOTE_C5, NOTE_E5, NOTE_G5, 0, NOTE_G4, 0,
  NOTE_C5, 0, NOTE_G4, 0, NOTE_E4, 0, NOTE_A4, 0, NOTE_B4, 0, NOTE_AS4, NOTE_A4, 0,
  NOTE_G4, NOTE_E5, NOTE_G5, NOTE_A5, 0, NOTE_F5, NOTE_G5, 0, NOTE_E5, 0, NOTE_C5, NOTE_D5, NOTE_B4
};
int marioDurations[] = {
  tempo, tempo, tempo, tempo, tempo, tempo, tempo, tempo, tempo * 2, tempo * 2, tempo,
  tempo * 2, tempo, tempo * 2, tempo, tempo * 2, tempo, tempo, tempo, tempo, tempo, tempo, tempo, tempo,
  (int)(tempo * 0.66), (int)(tempo * 0.66), (int)(tempo * 0.66), tempo, tempo, tempo, tempo, tempo, tempo, tempo, tempo, tempo, tempo * 2
};
int songLength = sizeof(marioMelody) / sizeof(int);

void setup() {
  Serial.begin(115200);
  Wire.begin();
  pinMode(RAIN_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  noTone(BUZZER_PIN);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Stasiun Cuaca");
  lcd.setCursor(0, 1);
  lcd.print("LOADING....");
  delay(2000);
  dht.begin();
  if (!bmp.begin(BMP280_ADDRESS)) {
    Serial.println(F("Tidak dapat menemukan sensor BMP280!"));
    lcd.clear();
    lcd.print("Error: BMP280");
    while (1);
  }
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL, Adafruit_BMP280::SAMPLING_X2,
                  Adafruit_BMP280::SAMPLING_X16, Adafruit_BMP280::FILTER_X16,
                  Adafruit_BMP280::STANDBY_MS_500);
  connectToWiFi();
  readAllSensors();
}

void loop() {
  unsigned long currentMillis = millis();
  handleThemePlayback();
  if (currentMillis - previousSensorReadMillis >= SENSOR_READ_INTERVAL) {
    previousSensorReadMillis = currentMillis;
    readAllSensors();
  }
  if (currentMillis - previousPostingMillis >= POSTING_INTERVAL) {
    previousPostingMillis = currentMillis;
    sendDataToServer();
  }
  if (currentMillis - previousLcdUpdateMillis >= LCD_UPDATE_INTERVAL) {
    previousLcdUpdateMillis = currentMillis;
    updateLCD();
  }
}

void connectToWiFi() {
  lcd.clear();
  lcd.print("Menyambung ke:");
  lcd.setCursor(0, 1);
  lcd.print(ssid);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi..");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected!");
    lcd.clear();
    lcd.print("WiFi Tersambung!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect.");
    lcd.clear();
    lcd.print("Koneksi Gagal!");
  }
  delay(3000);
}

void readAllSensors() {
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println(F("Gagal membaca dari sensor DHT!"));
  }
  pressure = bmp.readPressure() / 100.0F;
  altitude = bmp.readAltitude(1013.25);
  isRaining = (digitalRead(RAIN_SENSOR_PIN) == LOW);

  if (isRaining) {
    condition = "HUJAN";
    if (!wasRaining) {
      startMarioTheme();
    }
  } else {
    condition = (temperature > 29.0) ? "CERAH" : "BERAWAN";
  }
  wasRaining = isRaining;
}

void startMarioTheme() {
  Serial.println("Hujan terdeteksi! Memainkan tema Mario...");
  isPlayingTheme = true;
  currentNoteIndex = 0;
  noteStartTime = millis();
}

void handleThemePlayback() {
  if (!isPlayingTheme) return;
  if (!isRaining) {
    Serial.println("Hujan berhenti, lagu dihentikan.");
    noTone(BUZZER_PIN);
    isPlayingTheme = false;
    return;
  }
  unsigned long currentMillis = millis();
  if (currentMillis - noteStartTime > marioDurations[currentNoteIndex]) {
    noteStartTime = currentMillis;
    currentNoteIndex++;
    if (currentNoteIndex >= songLength) {
      Serial.println("Tema Mario selesai.");
      noTone(BUZZER_PIN);
      isPlayingTheme = false;
    } else {
      int noteToPlay = marioMelody[currentNoteIndex];
      if (noteToPlay > 0) {
        tone(BUZZER_PIN, noteToPlay);
      } else {
        noTone(BUZZER_PIN); // Jeda
      }
    }
  }
}

void updateLCD() {
  lcd.clear();
  switch (lcdScreenState) {
    case 0:
      lcd.setCursor(0, 0);
      lcd.print("S:" + String(temperature, 1) + "C  L:" + String(humidity, 0) + "%");
      lcd.setCursor(0, 1);
      lcd.print("T:" + String(pressure, 0) + "hPa K:" + String(altitude, 0) + "m");
      break;
    case 1:
      lcd.setCursor(0, 0);
      lcd.print("Kondisi Cuaca:");
      lcd.setCursor(0, 1);
      String conditionToPrint = condition;
      if (conditionToPrint.length() > 16) {
        conditionToPrint = conditionToPrint.substring(0, 16);
      }
      lcd.print(conditionToPrint);
      break;
  }
  lcdScreenState = (lcdScreenState + 1) % 2;
}

// --- FUNGSI BANTUAN UNTUK MENGIRIM DATA ---
void kirimKeAlamat(const char* url, const String& payload) {
    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    Serial.println("=> Mengirim data ke: " + String(url));
    Serial.println(payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
        Serial.print("<= Respons Server: ");
        Serial.println(httpResponseCode);
    } else {
        Serial.print("Error saat mengirim POST: ");
        Serial.println(httpResponseCode);
        Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    http.end();
}

void sendDataToServer() {
    if (WiFi.status() == WL_CONNECTED) {
        // 1. Siapkan data JSON (hanya perlu dibuat sekali)
        StaticJsonDocument<256> doc;
        doc["temperature"] = String(temperature, 2).toFloat();
        doc["humidity"]    = String(humidity, 2).toFloat();
        doc["pressure"]    = String(pressure, 2).toFloat();
        doc["altitude"]    = String(altitude, 2).toFloat();
        doc["isRaining"]   = isRaining;
        doc["condition"]   = condition;

        String jsonPayload;
        serializeJson(doc, jsonPayload);

        // 2. Kirim data ke kedua server
        kirimKeAlamat(serverPublik, jsonPayload); // Kirim ke domain publik
        delay(200); // Beri jeda singkat antar request
        kirimKeAlamat(serverLokal, jsonPayload);  // Kirim ke server lokal

    } else {
        Serial.println("WiFi Terputus. Tidak bisa mengirim data.");
    }
}
