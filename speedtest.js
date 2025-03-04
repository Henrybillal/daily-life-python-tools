class SpeedTest {
    constructor() {
        this.downloadSpeed = document.getElementById('downloadSpeed');
        this.uploadSpeed = document.getElementById('uploadSpeed');
        this.status = document.getElementById('status');
        this.progress = document.getElementById('progress');
        this.details = document.getElementById('details');
        this.startButton = document.getElementById('startTest');

        this.imageAddr = "https://source.unsplash.com/random/3000x2000";
        this.downloadSize = 5000000; // Approximate size in bytes

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startTest());
    }

    async startTest() {
        this.startButton.disabled = true;
        this.progress.style.width = '0%';
        
        // Test download speed
        this.status.textContent = 'Testing download speed...';
        this.progress.style.width = '25%';
        const downloadSpeed = await this.testDownloadSpeed();
        this.downloadSpeed.textContent = downloadSpeed.toFixed(2);

        // Test upload speed
        this.status.textContent = 'Testing upload speed...';
        this.progress.style.width = '75%';
        const uploadSpeed = await this.testUploadSpeed();
        this.uploadSpeed.textContent = uploadSpeed.toFixed(2);

        // Complete
        this.progress.style.width = '100%';
        this.status.textContent = 'Speed test completed!';
        this.startButton.disabled = false;
    }

    async testDownloadSpeed() {
        const startTime = new Date().getTime();
        
        try {
            const response = await fetch(this.imageAddr);
            const data = await response.blob();
            const endTime = new Date().getTime();
            
            const duration = (endTime - startTime) / 1000;
            const bitsLoaded = data.size * 8;
            const speedBps = (bitsLoaded / duration).toFixed(2);
            const speedMbps = (speedBps / 1024 / 1024).toFixed(2);
            
            return parseFloat(speedMbps);
        } catch (error) {
            console.error('Download test failed:', error);
            return 0;
        }
    }

    async testUploadSpeed() {
        const startTime = new Date().getTime();
        const data = this.generateTestData(this.downloadSize);
        
        try {
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                body: data
            });
            const endTime = new Date().getTime();
            
            const duration = (endTime - startTime) / 1000;
            const bitsLoaded = data.size * 8;
            const speedBps = (bitsLoaded / duration).toFixed(2);
            const speedMbps = (speedBps / 1024 / 1024).toFixed(2);
            
            return parseFloat(speedMbps);
        } catch (error) {
            console.error('Upload test failed:', error);
            return 0;
        }
    }

    generateTestData(sizeInBytes) {
        const data = new Blob([new ArrayBuffer(sizeInBytes)]);
        return data;
    }
}

new SpeedTest();