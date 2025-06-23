<?php
// get_history_data.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db_config.php';

$filterDate = isset($_GET['date']) ? $_GET['date'] : '';

$sql = "SELECT timestamp, temperature, humidity, pressure, altitude, is_raining, `condition` FROM sensor_data";

if (!empty($filterDate)) {
    $filterDate = $conn->real_escape_string($filterDate);
    $sql .= " WHERE DATE(timestamp) = '" . $filterDate . "'";
}

$sql .= " ORDER BY timestamp ASC";

$result = $conn->query($sql);

$historyData = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['isRaining'] = (bool)$row['is_raining'];
        unset($row['is_raining']);
        $historyData[] = $row;
    }
}

echo json_encode($historyData);

$conn->close();
?>