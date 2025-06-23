console.log("Server script started!"); // Tambahkan ini di baris pertama server.js

const express = require('express');
const cors = require('cors'); // Untuk mengatasi masalah CORS
const bodyParser = require('body-parser'); // Untuk mengurai body JSON

const app = express();
const port = 80; // Anda bisa menggunakan port lain, misalnya 3000. Sesuaikan di ESP32 juga!

// Data sensor terbaru
let latestSensorData = {
    isRaining: false,
    temperature: 0,
    humidity: 0,
    pressure: 0,
    altitude: 0,
    timestamp: new Date().toISOString()
};

// Middleware
app.use(cors()); // Izinkan semua permintaan lintas-asal (untuk pengembangan)
app.use(bodyParser.json()); // Izinkan aplikasi Anda untuk mengurai JSON

// Serve file statis (HTML, CSS, JS)
app.use(express.static(__dirname)); // Ini akan melayani file dari direktori saat ini

// Endpoint untuk menerima data dari ESP32 (POST request)
app.post('/sensor-data', (req, res) => {
    console.log('Received data from ESP32:', req.body);
    const { isRaining, temperature, humidity, pressure, altitude, condition } = req.body;

    // Validasi dan simpan data
    if (temperature && humidity && pressure && altitude) {
        latestSensorData = {
            isRaining: isRaining,
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
            pressure: parseFloat(pressure),
            altitude: parseFloat(altitude),
            condition: condition, // Ambil kondisi dari ESP32
            timestamp: new Date().toISOString() // Gunakan waktu penerimaan di server
        };
        res.status(200).send('Data received successfully');
    } else {
        res.status(400).send('Invalid data format');
    }
});

// Endpoint untuk aplikasi web Anda untuk mengambil data (GET request)
app.get('/api/latest-sensor-data', (req, res) => {
    res.json(latestSensorData);
});

// Mulai server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Open your browser to http://localhost:${port}/index.html`);
});