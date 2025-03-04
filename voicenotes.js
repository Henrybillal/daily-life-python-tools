class VoiceRecorder {
    constructor() {
        this.recordButton = document.getElementById('recordButton');
        this.status = document.getElementById('status');
        this.transcript = document.getElementById('transcript');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.isRecording = false;
        this.recognition = null;
        
        this.initializeSpeechRecognition();
        this.setupEventListeners();
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    this.transcript.textContent += ' ' + finalTranscript;
                }
            };

            this.recognition.onerror = (event) => {
                this.status.textContent = 'Error: ' + event.error;
                this.stopRecording();
            };
        } else {
            this.status.textContent = 'Speech recognition not supported in this browser';
            this.recordButton.disabled = true;
        }
    }

    setupEventListeners() {
        this.recordButton.addEventListener('click', () => this.toggleRecording());
        this.copyBtn.addEventListener('click', () => this.copyText());
        this.downloadBtn.addEventListener('click', () => this.downloadText());
        this.clearBtn.addEventListener('click', () => this.clearTranscript());
    }

    toggleRecording() {
        if (!this.isRecording) {
            this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    startRecording() {
        this.recognition.start();
        this.isRecording = true;
        this.recordButton.classList.add('recording');
        this.status.textContent = 'Recording...';
    }

    stopRecording() {
        this.recognition.stop();
        this.isRecording = false;
        this.recordButton.classList.remove('recording');
        this.status.textContent = 'Click to start recording';
    }

    copyText() {
        navigator.clipboard.writeText(this.transcript.textContent)
            .then(() => {
                this.status.textContent = 'Text copied to clipboard!';
                setTimeout(() => {
                    this.status.textContent = 'Click to start recording';
                }, 2000);
            })
            .catch(err => {
                this.status.textContent = 'Failed to copy text';
            });
    }

    downloadText() {
        const blob = new Blob([this.transcript.textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'voice-notes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearTranscript() {
        this.transcript.textContent = '';
    }
}

new VoiceRecorder();