<?php
// db_config.php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');   // <-- GANTI DENGAN USERNAME DATABASE ANDA
define('DB_PASSWORD', '');       // <-- GANTI DENGAN PASSWORD DATABASE ANDA
define('DB_NAME', 'weather_station'); // Nama database yang Anda buat

// Buat koneksi
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Cek koneksi
if ($conn->connect_error) {
    // Untuk pengembangan, tampilkan error. Untuk produksi, log error saja.
    die("Connection failed: " . $conn->connect_error);
}
?>