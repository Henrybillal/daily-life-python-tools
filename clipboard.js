class ClipboardManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('clipboardItems')) || [];
        this.input = document.getElementById('clipboardInput');
        this.list = document.getElementById('clipboardList');
        this.addBtn = document.getElementById('addBtn');

        this.requestClipboardPermission();
        this.setupEventListeners();
        this.renderItems();
    }

    async requestClipboardPermission() {
        try {
            const result = await navigator.permissions.query({ name: 'clipboard-read' });
            if (result.state === 'denied') {
                alert('Please allow clipboard access for this feature to work properly');
            }
        } catch (error) {
            console.log('Clipboard API not fully supported');
        }
    }

    setupEventListeners() {
        this.addBtn.addEventListener('click', () => this.addItem());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });

        // Enhanced paste event handler
        document.addEventListener('paste', async (e) => {
            try {
                const pastedText = e.clipboardData.getData('text');
                if (document.activeElement !== this.input) {
                    this.input.value = pastedText;
                }
            } catch (error) {
                alert('Unable to access clipboard. Please paste manually.');
            }
        });
    }

    addItem() {
        const text = this.input.value.trim();
        if (text) {
            this.items.unshift({
                id: Date.now(),
                text: text,
                timestamp: new Date().toLocaleString()
            });
            this.saveItems();
            this.renderItems();
            this.input.value = '';
        }
    }

    deleteItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveItems();
        this.renderItems();
    }

    copyItem(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                const copyBtn = document.querySelector(`[data-text="${text}"]`);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 1000);
            })
            .catch(err => alert('Failed to copy: ' + err));
    }

    saveItems() {
        localStorage.setItem('clipboardItems', JSON.stringify(this.items));
    }

    renderItems() {
        this.list.innerHTML = this.items.map(item => `
            <div class="clipboard-item">
                <div class="item-content">
                    <div class="item-text">${item.text}</div>
                    <small>${item.timestamp}</small>
                </div>
                <div class="item-actions">
                    <button class="copy-btn" data-text="${item.text}">Copy</button>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to buttons
        this.list.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyItem(btn.dataset.text));
        });

        this.list.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteItem(parseInt(btn.dataset.id)));
        });
    }
}

// Initialize the clipboard manager
new ClipboardManager();