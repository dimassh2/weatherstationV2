/**
 * File ini mengambil data dari skrip PHP di server web Anda.
 * Pastikan URL sesuai dengan lokasi file PHP Anda di server web.
 */
async function fetchSensorData() {
    try {
        // --- URL DIPERBAIKI menjadi path relatif ---
        const response = await fetch('./get_latest_data.php'); 
        
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