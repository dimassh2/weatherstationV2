<?php
// receive_data.php
header('Content-Type: application/json'); // Pastikan respons dalam bentuk JSON

// Izinkan CORS (untuk development, bisa lebih spesifik di production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php';

// Ambil data JSON dari body request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Pastikan data yang diterima tidak kosong
if (empty($data)) {
    echo json_encode(['status' => 'error', 'message' => 'No data received or invalid JSON.']);
    $conn->close();
    exit();
}

// Ambil data dari array $data
$temperature = isset($data['temperature']) ? floatval($data['temperature']) : 0.0;
$humidity = isset($data['humidity']) ? floatval($data['humidity']) : 0.0;
$pressure = isset($data['pressure']) ? floatval($data['pressure']) : 0.0;
$altitude = isset($data['altitude']) ? floatval($data['altitude']) : 0.0;
$is_raining = isset($data['isRaining']) ? ($data['isRaining'] ? 1 : 0) : 0; // 1 for true, 0 for false
$condition = isset($data['condition']) ? $conn->real_escape_string($data['condition']) : 'UNKNOWN';
$timestamp = date('Y-m-d H:i:s'); // Gunakan waktu penerimaan di server

// Siapkan statement SQL untuk INSERT data
$stmt = $conn->prepare("INSERT INTO sensor_data (timestamp, temperature, humidity, pressure, altitude, is_raining, `condition`) VALUES (?, ?, ?, ?, ?, ?, ?)");

// Cek jika statement gagal disiapkan
if ($stmt === false) {
    echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error]);
    $conn->close();
    exit();
}

// Bind parameter dan eksekusi
// 'sddddis' -> s=string (timestamp), d=double/float (temp,hum,pres,alt), i=integer (is_raining), s=string (condition)
$stmt->bind_param("sddddis", $timestamp, $temperature, $humidity, $pressure, $altitude, $is_raining, $condition);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Data saved successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error saving data: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>