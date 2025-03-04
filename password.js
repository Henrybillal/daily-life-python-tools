class PasswordGenerator {
    constructor() {
        this.passwordDisplay = document.getElementById('passwordDisplay');
        this.lengthInput = document.getElementById('passwordLength');
        this.uppercaseCheck = document.getElementById('uppercase');
        this.lowercaseCheck = document.getElementById('lowercase');
        this.numbersCheck = document.getElementById('numbers');
        this.symbolsCheck = document.getElementById('symbols');
        this.generateBtn = document.getElementById('generateBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.strengthIndicator = document.getElementById('strengthIndicator');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.copyBtn.addEventListener('click', () => this.copyPassword());
        this.lengthInput.addEventListener('input', () => this.validateLength());
    }

    validateLength() {
        let value = parseInt(this.lengthInput.value);
        if (value < 8) this.lengthInput.value = 8;
        if (value > 64) this.lengthInput.value = 64;
    }

    generatePassword() {
        const length = parseInt(this.lengthInput.value);
        const hasUpper = this.uppercaseCheck.checked;
        const hasLower = this.lowercaseCheck.checked;
        const hasNumbers = this.numbersCheck.checked;
        const hasSymbols = this.symbolsCheck.checked;

        if (!hasUpper && !hasLower && !hasNumbers && !hasSymbols) {
            alert('Please select at least one character type');
            return;
        }

        const charset = {
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lower: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        let characters = '';
        if (hasUpper) characters += charset.upper;
        if (hasLower) characters += charset.lower;
        if (hasNumbers) characters += charset.numbers;
        if (hasSymbols) characters += charset.symbols;

        let password = '';
        for (let i = 0; i < length; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        this.passwordDisplay.textContent = password;
        this.updateStrengthMeter(password);
    }

    updateStrengthMeter(password) {
        const strength = this.calculateStrength(password);
        const colors = ['#ff4444', '#ffbb33', '#00C851', '#33b5e5'];
        const strengthColor = colors[strength - 1];
        
        this.strengthIndicator.style.width = `${(strength / 4) * 100}%`;
        this.strengthIndicator.style.backgroundColor = strengthColor;
    }

    calculateStrength(password) {
        let strength = 0;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    async copyPassword() {
        const password = this.passwordDisplay.textContent;
        if (password === 'Click Generate') return;

        try {
            await navigator.clipboard.writeText(password);
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            alert('Failed to copy password');
        }
    }
}

new PasswordGenerator();