<?php
// get_latest_data.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db_config.php';

$sql = "SELECT timestamp, temperature, humidity, pressure, altitude, is_raining, `condition` FROM sensor_data ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $row['isRaining'] = (bool)$row['is_raining'];
    unset($row['is_raining']);
    echo json_encode($row);
} else {
    echo json_encode([
        'isRaining' => false,
        'temperature' => 0,
        'humidity' => 0,
        'pressure' => 0,
        'altitude' => 0,
        'condition' => 'NO DATA',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

$conn->close();
?>