/**
 * File ini mengambil data dari skrip PHP di server web Anda.
 * Pastikan URL sesuai dengan lokasi file PHP Anda di server web.
 */
async function fetchSensorData() {
    try {
        // SESUAIKAN URL INI DENGAN LOKASI FILE PHP ANDA DI SERVER WEB (misal http://localhost/weather_dashboard_php/get_latest_data.php)
        // Jika server web Anda berjalan di port non-standar (misal Apache di 8080), gunakan:
        // const response = await fetch('http://localhost:8080/weather_dashboard_php/get_latest_data.php');
        const response = await fetch('http://localhost/weather_dashboard_php/get_latest_data.php'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Konversi timestamp ISO string kembali ke objek Date
        data.timestamp = new Date(data.timestamp); 
        return data;
    } catch (error) {
        console.error("Gagal mengambil data dari server PHP:", error);
        throw error; 
    }
}