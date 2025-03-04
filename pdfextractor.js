// Update the PDF.js worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const dropZone = document.getElementById('dropZone');
const pdfInput = document.getElementById('pdfInput');
const selectFile = document.getElementById('selectFile');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Request clipboard permission
async function requestClipboardPermission() {
    try {
        await navigator.permissions.query({ name: 'clipboard-write' });
    } catch (error) {
        console.log('Clipboard API not fully supported');
    }
}

// Initialize permissions
requestClipboardPermission();

// Update the processPDF function
async function processPDF(file) {
    try {
        output.textContent = 'Processing PDF...';
        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
            try {
                const typedarray = new Uint8Array(this.result);
                
                // Load the PDF file
                const loadingTask = pdfjsLib.getDocument(typedarray);
                loadingTask.onProgress = function(progress) {
                    if (progress.total > 0) {
                        const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
                        output.textContent = `Loading PDF... ${percent}%`;
                    }
                };

                const pdf = await loadingTask.promise;
                let text = '';
                const totalPages = pdf.numPages;

                // Process each page
                for (let i = 1; i <= totalPages; i++) {
                    output.textContent = `Extracting text from page ${i} of ${totalPages}...`;
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                        .map(item => item.str)
                        .join(' ');
                    text += pageText + '\n\n';
                }

                output.textContent = text || 'No text found in PDF';
            } catch (error) {
                output.textContent = `Error processing PDF: ${error.message}`;
            }
        };

        fileReader.onerror = function() {
            output.textContent = 'Error reading file!';
        };

        fileReader.readAsArrayBuffer(file);
    } catch (error) {
        output.textContent = `Error: ${error.message}. Please make sure you're using a valid PDF file.`;
    }
}

// Update the copy button handler
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(output.textContent);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.disabled = true;
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.disabled = false;
        }, 2000);
    } catch (error) {
        alert('Failed to copy text. Please try selecting and copying manually.');
    }
});

// Update the download button handler
downloadBtn.addEventListener('click', () => {
    try {
        const blob = new Blob([output.textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('Failed to download text. Please try copying and saving manually.');
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file.type === 'application/pdf') {
        processPDF(file);
    } else {
        alert('Please upload a PDF file');
    }
});

selectFile.addEventListener('click', () => pdfInput.click());
pdfInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processPDF(e.target.files[0]);
    }
});