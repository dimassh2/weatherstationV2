document.addEventListener('DOMContentLoaded', () => {

    const historyData = [];
    const MAX_HISTORY_POINTS = 200; 
    const MAX_REALTIME_POINTS = 15;

    let hasUserInitiatedPlay = false;

    const dom = {
        timestamp: document.getElementById('timestamp'),
        weatherCard: document.getElementById('weather-condition-card'),
        iconContainer: document.getElementById('icon-container'),
        weatherText: document.getElementById('weather-condition-text'),
        
        tempValue: document.getElementById('temp-value'),
        humidityValue: document.getElementById('humidity-value'),
        pressureValue: document.getElementById('pressure-value'),
        altitudeValue: document.getElementById('altitude-value'),

        centerCardPlaceholder: document.getElementById('center-card-placeholder'),
        rainVideo: document.getElementById('rain-video'),
        playButtonOverlay: document.getElementById('play-button-overlay'),
        
        videoControls: document.getElementById('video-controls'),
        progressBar: document.getElementById('progress-bar'),
        currentTimeDisplay: document.getElementById('current-time'),
        totalTimeDisplay: document.getElementById('total-time'),
        playPauseBtn: document.getElementById('play-pause-btn'),
        playIcon: document.getElementById('play-icon'),
        pauseIcon: document.getElementById('pause-icon'),
        stopBtn: document.getElementById('stop-btn'),

        historyButton: document.getElementById('history-button'),
        historyModal: document.getElementById('history-modal'),
        closeHistoryModalButton: document.getElementById('close-history-modal-button'),
        historyTableBody: document.getElementById('history-table-body'),
        historyDatePicker: document.getElementById('history-date-picker'),
        filterHistoryButton: document.getElementById('filter-history-button'),
        
        geminiAdviceButton: document.getElementById('gemini-advice-button'),
        geminiModal: document.getElementById('gemini-modal'),
        geminiModalContent: document.getElementById('gemini-modal-content'),
        closeGeminiModalButton: document.getElementById('close-gemini-modal-button'),
    };

    const icons = {
        sunny: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" color="#f6e05e"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM12 5c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V6c0-.55-.45-1-1-1zm0 12c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1zm6.36-11.36c-.39-.39-1.02-.39-1.41 0l-1.41 1.41c-.39.39-.39 1.02 0 1.41.2.2.45.29.71.29s.51-.1.71-.29l1.41-1.41c.39-.39.39-1.02 0-1.41zM6.05 17.95c-.39-.39-1.02-.39-1.41 0l-1.41 1.41c-.39.39-.39 1.02 0 1.41.2.2.45.29.71.29s.51-.1.71-.29l1.41-1.41c.39-.39.39-1.02 0-1.41zM20 12c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1zM5 12c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1zm11.36-6.36c.39-.39.39-1.02 0-1.41l-1.41-1.41c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.2.2.45.29.71.29s.51-.1.71-.29zm-10.3 10.3c.39-.39.39-1.02 0-1.41l-1.41-1.41c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.2.2.45.29.71.29s.51-.1.71-.29z"/></svg>`,
        rainy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" color="#4299e1"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4c.71 0 1.39.19 2 .54V10c0-2.21 1.79-4 4-4s4 1.79 4 4v.54c.61-.35 1.29-.54 2-.54 1.66 0 3 1.34 3 3s-1.34 3-3 3zM8 15v3h2v-3H8zm4 0v3h2v-3h-2zm4 0v3h2v-3h-2z"/></svg>`,
        cloudy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" color="#a0aec0"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`,
        loading: `<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`
    };
    dom.iconContainer.innerHTML = icons.loading;
    
    // Konfigurasi Chart tetap sama
    const chartFont = { family: "'Merriweather', serif", size: 10 };
    const chartOptions = { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: 'var(--text-color)', font: chartFont }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, y: { ticks: { color: 'var(--text-color)', font: chartFont }, grid: { color: 'rgba(255, 255, 255, 0.1)' } } }, plugins: { legend: { display: true, labels: { color: 'var(--text-color)', font: { ...chartFont, size: 12 } } } } };
    const dualAxisOptions = { ...chartOptions, scales: { ...chartOptions.scales, y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { color: 'var(--accent-red)', font: chartFont } } } };
    const realtimeChart1 = new Chart(document.getElementById('chart-temp-humidity'), { type: 'line', options: chartOptions, data: { datasets: [ { label: 'Suhu', data: [], borderColor: '#e53e3e', backgroundColor: '#e53e3e33', tension: 0.3, fill: true }, { label: 'Lembap', data: [], borderColor: '#4299e1', backgroundColor: '#4299e133', tension: 0.3, fill: true } ]}});
    const realtimeChart2 = new Chart(document.getElementById('chart-pressure-altitude'), { type: 'line', options: dualAxisOptions, data: { datasets: [ { label: 'Tekanan', data: [], yAxisID: 'y', borderColor: '#a0aec0', backgroundColor: '#a0aec033', tension: 0.3, fill: true }, { label: 'MDPL', data: [], yAxisID: 'y1', borderColor: '#e53e3e', backgroundColor: '#e53e3e33', tension: 0.3, fill: true } ]}});
    const historyChart1 = new Chart(document.getElementById('history-chart-1'), { type: 'line', options: chartOptions, data: { datasets: [ { label: 'Suhu', data: [], borderColor: '#e53e3e', backgroundColor: '#e53e3e33' }, { label: 'Lembap', data: [], borderColor: '#4299e1', backgroundColor: '#4299e133' } ]}});
    const historyChart2 = new Chart(document.getElementById('history-chart-2'), { type: 'line', options: dualAxisOptions, data: { datasets: [ { label: 'Tekanan', data: [], yAxisID: 'y', borderColor: '#a0aec0', backgroundColor: '#a0aec033' }, { label: 'MDPL', data: [], yAxisID: 'y1', borderColor: '#e53e3e', backgroundColor: '#e53e3e33' } ]}});
    
    async function mainLoop() {
        try {
            const data = await fetchSensorData();
            historyData.push(data);
            if (historyData.length > MAX_HISTORY_POINTS) historyData.shift();
            const latestData = historyData[historyData.length - 1];
            updateUI(latestData);
            updateRealtimeCharts();
        } catch (error) { 
            console.error("Gagal mengambil data sensor:", error); 
            dom.timestamp.textContent = "Koneksi Gagal!";
        }
    }
    
    function updateUI(data) {
        dom.timestamp.textContent = `Update: ${new Date(data.timestamp).toLocaleString('id-ID')}`;
        dom.tempValue.textContent = data.temperature;
        dom.humidityValue.textContent = data.humidity;
        dom.pressureValue.textContent = data.pressure;
        dom.altitudeValue.textContent = data.altitude;
        dom.weatherText.textContent = data.condition; 

        if (data.condition === 'HUJAN') {
            dom.iconContainer.innerHTML = icons.rainy; 
            showVideoInCard();
        } else {
            dom.iconContainer.innerHTML = data.condition === 'CERAH' ? icons.sunny : icons.cloudy;
            hideVideoInCard();
        }
    }

    // --- FUNGSI KONTROL VIDEO ---
    function updatePlayPauseIcon() {
        if (dom.rainVideo.paused) {
            dom.playIcon.classList.remove('hidden');
            dom.pauseIcon.classList.add('hidden');
        } else {
            dom.playIcon.classList.add('hidden');
            dom.pauseIcon.classList.remove('hidden');
        }
    }

    function togglePlayPause() {
        if (dom.rainVideo.paused) {
            dom.rainVideo.play();
        } else {
            dom.rainVideo.pause();
        }
    }

    function stopVideo() {
        dom.rainVideo.pause();
        dom.rainVideo.currentTime = 0;
        dom.playButtonOverlay.classList.remove('hidden');
        updatePlayPauseIcon();
    }
    
    async function showVideoInCard() {
        dom.centerCardPlaceholder.classList.add('hidden');
        dom.rainVideo.classList.remove('hidden');
        dom.videoControls.classList.remove('hidden');
        
        if (hasUserInitiatedPlay) {
            try {
                await dom.rainVideo.play();
            } catch (err) {
                console.warn("Autoplay was blocked. Showing play button.", err);
                dom.playButtonOverlay.classList.remove('hidden');
            }
        } else {
            dom.playButtonOverlay.classList.remove('hidden');
        }
    }

    function hideVideoInCard() {
        dom.centerCardPlaceholder.classList.remove('hidden');
        stopVideo();
        dom.rainVideo.classList.add('hidden');
        dom.playButtonOverlay.classList.add('hidden');
        dom.videoControls.classList.add('hidden');
    }

    async function fetchGeminiRecommendation() {
        dom.geminiModalContent.innerHTML = `<p>Meminta saran dari AI...</p>`;
        const latestData = historyData[historyData.length - 1];
        if (!latestData) {
            dom.geminiModalContent.innerHTML = `<p>Data cuaca belum tersedia.</p>`;
            return;
        }
        try {
            const prompt = `Analisa data cuaca berikut: Suhu ${latestData.temperature}°C, Lembap ${latestData.humidity}%, Kondisi ${latestData.condition}. Berdasarkan data ini, berikan rekomendasi aktivitas, pakaian, dan makanan/minuman yang cocok dalam bahasa Indonesia. Tulis jawaban sebagai paragraf biasa yang mengalir alami. JANGAN gunakan tanda bintang, nomor, atau format list apapun. Buatlah seperti percakapan biasa.`;
            const response = await fetch('./get_gemini_recommendation.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prompt }) });
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const result = await response.json();
            if (result.error) {
                dom.geminiModalContent.innerHTML = `<p style="color: var(--accent-red);">Error: ${result.error}</p>`;
            } else {
                const cleanText = result.recommendation.replace(/[*#]/g, '').replace(/\n\s*\n/g, '</p><p>');
                dom.geminiModalContent.innerHTML = `<p>${cleanText}</p>`;
            }
        } catch (error) {
            console.error("Gagal mendapatkan rekomendasi:", error);
            dom.geminiModalContent.innerHTML = `<p style="color: var(--accent-red);">Gagal memuat rekomendasi. Cek koneksi & API Key.</p>`;
        }
    }

    // --- EVENT LISTENERS ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    dom.playButtonOverlay.addEventListener('click', () => {
        dom.rainVideo.play();
        hasUserInitiatedPlay = true;
    });

    dom.playPauseBtn.addEventListener('click', togglePlayPause);
    
    dom.stopBtn.addEventListener('click', stopVideo);

    dom.rainVideo.addEventListener('play', () => {
        dom.playButtonOverlay.classList.add('hidden');
        updatePlayPauseIcon();
    });
    
    dom.rainVideo.addEventListener('pause', () => {
        updatePlayPauseIcon();
    });

    dom.rainVideo.addEventListener('loadedmetadata', () => {
        dom.progressBar.max = dom.rainVideo.duration;
        dom.totalTimeDisplay.textContent = formatTime(dom.rainVideo.duration);
    });

    dom.rainVideo.addEventListener('timeupdate', () => {
        dom.progressBar.value = dom.rainVideo.currentTime;
        dom.currentTimeDisplay.textContent = formatTime(dom.rainVideo.currentTime);
    });

    dom.rainVideo.addEventListener('ended', () => {
        dom.playButtonOverlay.classList.remove('hidden');
        updatePlayPauseIcon();
    });
    
    dom.progressBar.addEventListener('input', () => {
        dom.rainVideo.currentTime = dom.progressBar.value;
    });

    dom.historyButton.addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        dom.historyDatePicker.value = today;
        updateHistoryView(today);
        dom.historyModal.classList.remove('hidden');
    });
    dom.closeHistoryModalButton.addEventListener('click', () => dom.historyModal.classList.add('hidden'));
    dom.geminiAdviceButton.addEventListener('click', () => {
        dom.geminiModal.classList.remove('hidden');
        fetchGeminiRecommendation();
    });
    dom.closeGeminiModalButton.addEventListener('click', () => dom.geminiModal.classList.add('hidden'));
    dom.filterHistoryButton.addEventListener('click', () => {
        const selectedDate = dom.historyDatePicker.value;
        if(selectedDate) updateHistoryView(selectedDate);
    });

    // --- Fungsi Lain (tidak berubah) ---
    function updateRealtimeCharts(){const sortedHistory=[...historyData].sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));const realtimeSlice=sortedHistory.slice(-MAX_REALTIME_POINTS);const labels=realtimeSlice.map(d=>new Date(d.timestamp).toLocaleTimeString('id-ID',{minute:'2-digit',second:'2-digit'}));function updateChart(chart,chartLabels,datasets){chart.data.labels=chartLabels;datasets.forEach((dataset,i)=>chart.data.datasets[i].data=dataset);chart.update('none')}updateChart(realtimeChart1,labels,[realtimeSlice.map(d=>d.temperature),realtimeSlice.map(d=>d.humidity)]);updateChart(realtimeChart2,labels,[realtimeSlice.map(d=>d.pressure),realtimeSlice.map(d=>d.altitude)])}
    async function updateHistoryView(filterDateString){
        let apiUrl = 'get_history_data.php';
        if (filterDateString) { apiUrl += `?date=${filterDateString}`; }
        let dataToShow = [];
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const rawData = await response.json();
            dataToShow = rawData.map(d => ({ ...d, timestamp: new Date(d.timestamp) }));
        } catch (error) {
            console.error("Gagal mengambil data riwayat:", error);
            dom.historyTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Gagal memuat riwayat.</td></tr>';
            return;
        }
        dataToShow.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        dom.historyTableBody.innerHTML = '';
        if (dataToShow.length === 0) {
            dom.historyTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tidak ada data.</td></tr>';
        } else {
            dataToShow.forEach(data => {
                const row = document.createElement('tr');
                const timeFormat = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
                let conditionClass = '';
                if (data.condition === 'CERAH') conditionClass = 'sunny';
                else if (data.condition === 'HUJAN') conditionClass = 'rainy';
                else if (data.condition === 'BERAWAN') conditionClass = 'cloudy';
                row.innerHTML = `
                    <td>${data.timestamp.toLocaleDateString('id-ID', timeFormat)}</td>
                    <td class="condition-cell ${conditionClass}">${data.condition}</td>
                    <td>${data.temperature}</td>
                    <td>${data.humidity}</td>
                `;
                dom.historyTableBody.appendChild(row);
            });
        }
        const sortedForChart = [...dataToShow].sort((a,b) => a.timestamp - b.timestamp);
        const labels = sortedForChart.map(d => d.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        historyChart1.data.labels = labels;
        historyChart1.data.datasets[0].data = sortedForChart.map(d => d.temperature);
        historyChart1.data.datasets[1].data = sortedForChart.map(d => d.humidity);
        historyChart2.data.labels = labels;
        historyChart2.data.datasets[0].data = sortedForChart.map(d => d.pressure);
        historyChart2.data.datasets[1].data = sortedForChart.map(d => d.altitude);
        historyChart1.update();
        historyChart2.update();
    }

    mainLoop();
    setInterval(mainLoop, 5000);
});
