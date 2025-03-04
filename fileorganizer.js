const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('folderInput');
const selectButton = document.getElementById('selectFiles');
const resultDiv = document.getElementById('result');
const progressBar = document.getElementById('progressBar');

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = '#f0f2f5';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.background = 'transparent';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = 'transparent';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

selectButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
    if (files.length === 0) {
        showError('Please select files to organize');
        return;
    }

    const organizedFiles = {};
    let processed = 0;

    Array.from(files).forEach(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!organizedFiles[extension]) {
            organizedFiles[extension] = [];
        }
        organizedFiles[extension].push(file.name);
        
        processed++;
        updateProgress(processed / files.length * 100);
    });

    displayResults(organizedFiles);
}

function updateProgress(percentage) {
    progressBar.style.width = `${percentage}%`;
}

function displayResults(organizedFiles) {
    let output = '<h3>Organized Files:</h3>';
    
    for (const [extension, fileList] of Object.entries(organizedFiles)) {
        output += `
            <div class="category">
                <h4>📁 .${extension} files (${fileList.length})</h4>
                <ul>
                    ${fileList.map(file => `<li>${file}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    resultDiv.innerHTML = output;
    resultDiv.classList.add('show');
}

function showError(message) {
    resultDiv.innerHTML = `<p style="color: red;">${message}</p>`;
    resultDiv.classList.add('show');
}