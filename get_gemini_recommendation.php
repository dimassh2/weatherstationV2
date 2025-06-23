<?php
// get_gemini_recommendation.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Izinkan CORS
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// GANTI DENGAN GEMINI API KEY ANDA YANG SEBENARNYA!
// JANGAN PERNAH MENARUH API KEY INI DI SISI CLIENT (JAVASCRIPT)!
$gemini_api_key = 'AIzaSyC-D2m0WtzcP_uqlZXidkMB6gBXNr0wW44'; 

if (empty($gemini_api_key) || $gemini_api_key == 'AIzaSyC-D2m0WtzcP_uqlZXidkMB6gBXNr0wW44Y') {
    echo json_encode(['error' => 'Gemini API Key is not configured.']);
    exit();
}

$json_data = file_get_contents('php://input');
$request_data = json_decode($json_data, true);

$prompt = isset($request_data['prompt']) ? $request_data['prompt'] : '';

if (empty($prompt)) {
    echo json_encode(['error' => 'No prompt provided.']);
    exit();
}

// BARIS YANG BENAR (GUNAKAN MODEL BARU)
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" . $gemini_api_key;

$payload = json_encode([
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
            ]
        ]
    ]
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // HANYA UNTUK DEVELOPMENT! Di produksi harus true

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($response === false) {
    echo json_encode(['error' => 'cURL Error: ' . $curl_error]);
    exit();
}

$gemini_response = json_decode($response, true);

if ($http_code != 200) {
    echo json_encode(['error' => 'Gemini API returned HTTP ' . $http_code . ': ' . print_r($gemini_response, true)]);
    exit();
}

if (isset($gemini_response['candidates'][0]['content']['parts'][0]['text'])) {
    echo json_encode(['recommendation' => $gemini_response['candidates'][0]['content']['parts'][0]['text']]);
} else {
    echo json_encode(['error' => 'No recommendation found in Gemini response.', 'raw_response' => $gemini_response]);
}
?>