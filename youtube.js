class YouTubeDownloader {
    constructor() {
        this.videoUrl = document.getElementById('videoUrl');
        this.fetchBtn = document.getElementById('fetchBtn');
        this.preview = document.getElementById('preview');
        this.thumbnail = document.getElementById('thumbnail');
        this.title = document.getElementById('title');
        this.duration = document.getElementById('duration');
        this.author = document.getElementById('author');
        this.formatSelect = document.getElementById('formatSelect');
        this.downloadBtn = document.getElementById('downloadBtn');

        // Update API endpoint and configuration
        this.apiEndpoint = 'https://youtube-video-download-info.p.rapidapi.com';
        this.apiKey = '99d61886ebmsha39ffec3bea4f8bp1d6ce9jsn03f507a05d84';
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.fetchBtn.addEventListener('click', () => this.fetchVideoInfo());
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
        this.videoUrl.addEventListener('paste', () => setTimeout(() => this.fetchVideoInfo(), 100));
    }

    async fetchVideoInfo() {
        const url = this.videoUrl.value.trim();
        if (!this.isValidYouTubeUrl(url)) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        try {
            this.fetchBtn.disabled = true;
            this.fetchBtn.textContent = 'Fetching...';
            
            const videoId = this.extractVideoId(url);
            
            // First, get video info
            const infoResponse = await fetch(`${this.apiEndpoint}/dl?id=${videoId}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'youtube-mp3-download1.p.rapidapi.com'
                }
            });

            if (!infoResponse.ok) {
                throw new Error(`HTTP error! status: ${infoResponse.status}`);
            }

            const videoInfo = await infoResponse.json();
            
            if (videoInfo.status === "ok") {
                this.displayVideoInfo({
                    title: videoInfo.title,
                    author: videoInfo.uploader,
                    duration: videoInfo.duration,
                    thumb: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                    formats: [
                        { url: videoInfo.link, quality: "720p", type: "video" },
                        { url: videoInfo.mp3.url, quality: "128kbps", type: "audio" }
                    ]
                });
            } else {
                throw new Error('Could not fetch video information');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not fetch video information. Please try a different video or check your internet connection.');
        } finally {
            this.fetchBtn.disabled = false;
            this.fetchBtn.textContent = 'Fetch Video Info';
        }
    }

    displayVideoInfo(data) {
        this.thumbnail.src = data.thumb;
        this.title.textContent = data.title;
        this.author.textContent = `Channel: ${data.author}`;
        this.duration.textContent = `Duration: ${this.formatDuration(data.duration)}`;
        
        // Clear and populate format options
        this.formatSelect.innerHTML = '<option value="">Select format...</option>';
        
        data.formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format.url;
            option.textContent = `${format.quality} - ${format.type}`;
            this.formatSelect.appendChild(option);
        });

        this.preview.style.display = 'block';
    }

    async downloadVideo() {
        const downloadUrl = this.formatSelect.value;
        if (!downloadUrl) {
            alert('Please select a format first');
            return;
        }

        try {
            this.downloadBtn.disabled = true;
            this.downloadBtn.textContent = 'Preparing download...';

            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${this.title.textContent}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert('Download failed. Please try again.');
        } finally {
            this.downloadBtn.disabled = false;
            this.downloadBtn.textContent = 'Download';
        }
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        let result = '';
        if (hours > 0) result += `${hours}:`;
        result += `${minutes.toString().padStart(2, '0')}:`;
        result += secs.toString().padStart(2, '0');
        return result;
    }

    isValidYouTubeUrl(url) {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        return pattern.test(url);
    }

    extractVideoId(url) {
        const pattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(pattern);
        return match ? match[1] : null;
    }

    displayVideoInfo(video) {
        this.thumbnail.src = video.snippet.thumbnails.high.url;
        this.title.textContent = video.snippet.title;
        this.author.textContent = `Channel: ${video.snippet.channelTitle}`;
        this.duration.textContent = `Duration: ${this.formatDuration(video.contentDetails.duration)}`;
        
        // Populate format options (placeholder)
        this.formatSelect.innerHTML = `
            <option value="mp4-720">720p MP4</option>
            <option value="mp4-1080">1080p MP4</option>
            <option value="mp3">MP3 Audio</option>
        `;

        this.preview.style.display = 'block';
    }

    formatDuration(duration) {
        // Convert ISO 8601 duration to readable format
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');
        
        let result = '';
        if (hours) result += `${hours}:`;
        result += `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        return result;
    }

    async downloadVideo() {
        alert('Note: Actual video download requires server-side implementation with proper YouTube API integration.');
    }
}

new YouTubeDownloader();