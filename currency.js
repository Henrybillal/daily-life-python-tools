class CurrencyConverter {
    constructor() {
        this.amount = document.getElementById('amount');
        this.fromCurrency = document.getElementById('fromCurrency');
        this.toCurrency = document.getElementById('toCurrency');
        this.convertBtn = document.getElementById('convertBtn');
        this.result = document.getElementById('result');
        
        // Initialize with empty currencies object
        this.currencies = {};
        
        // Add debug message
        console.log('CurrencyConverter initialized');
        
        // Load currencies first, then initialize
        this.loadAllCurrencies().then(() => {
            console.log('Currencies loaded:', Object.keys(this.currencies).length);
            this.initialize();
        }).catch(error => {
            console.error('Failed to initialize:', error);
        });
    }

    async loadAllCurrencies() {
        try {
            console.log('Fetching currencies...');
            const response = await fetch('https://api.exchangerate.host/symbols');
            const data = await response.json();
            
            console.log('API Response:', data);
            
            if (data.success) {
                this.currencies = data.symbols;
                console.log('Currencies loaded:', this.currencies);
                this.populateCurrencyDropdowns();
            } else {
                throw new Error('API returned unsuccessful response');
            }
        } catch (error) {
            console.error('Currency loading error:', error);
            // Use fallback currencies
            this.currencies = {
                "USD": { "description": "United States Dollar" },
                "EUR": { "description": "Euro" },
                "GBP": { "description": "British Pound" },
                "JPY": { "description": "Japanese Yen" },
                "CNY": { "description": "Chinese Yuan" },
                "INR": { "description": "Indian Rupee" }
            };
            this.populateCurrencyDropdowns();
        }
    }

    populateCurrencyDropdowns() {
        console.log('Populating dropdowns with currencies:', this.currencies);
        
        // Clear existing options
        this.fromCurrency.innerHTML = '';
        this.toCurrency.innerHTML = '';

        if (Object.keys(this.currencies).length === 0) {
            console.error('No currencies available to populate dropdowns');
            return;
        }

        // Sort currencies by code
        const sortedCurrencies = Object.entries(this.currencies)
            .sort(([codeA], [codeB]) => codeA.localeCompare(codeB));

        console.log('Sorted currencies:', sortedCurrencies);

        sortedCurrencies.forEach(([code, info]) => {
            const description = info.description || info;
            const option1 = new Option(`${code} - ${description}`, code);
            const option2 = new Option(`${code} - ${description}`, code);
            
            this.fromCurrency.add(option1);
            this.toCurrency.add(option2);
        });

        console.log('Dropdowns populated. From options:', this.fromCurrency.options.length);
        console.log('To options:', this.toCurrency.options.length);

        // Set default values
        this.fromCurrency.value = 'USD';
        this.toCurrency.value = 'EUR';
    }

    initialize() {
        this.convertBtn.addEventListener('click', () => this.convertCurrency());
        this.amount.addEventListener('input', () => this.convertCurrency());
        this.fromCurrency.addEventListener('change', () => this.convertCurrency());
        this.toCurrency.addEventListener('change', () => this.convertCurrency());
    }

    async convertCurrency() {
        try {
            const amount = parseFloat(this.amount.value) || 0;
            const from = this.fromCurrency.value;
            const to = this.toCurrency.value;

            if (amount === 0) {
                this.result.textContent = 'Please enter an amount';
                return;
            }

            this.result.innerHTML = '<div style="color: #666;">Converting...</div>';
            
            // Using a more reliable endpoint
            const response = await fetch(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}&amount=${amount}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success !== false) {
                const rate = data.rates[to];
                const convertedAmount = (amount * rate).toFixed(2);
                const timestamp = new Date().toLocaleString();
                
                this.result.innerHTML = `
                    <div style="font-size: 1.2em; margin-bottom: 10px;">
                        ${this.formatNumber(amount)} ${from} = 
                        <strong>${this.formatNumber(convertedAmount)} ${to}</strong>
                    </div>
                    <div style="font-size: 0.8em; color: #666;">
                        Rate: 1 ${from} = ${rate.toFixed(6)} ${to}<br>
                        Last updated: ${timestamp}
                    </div>
                `;
            } else {
                throw new Error('Conversion failed');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.result.innerHTML = `
                <div style="color: #e74c3c;">
                    Unable to convert currency at the moment.<br>
                    <small>Please try again in a few moments.</small>
                </div>
            `;
        }
    }

    formatNumber(number) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
        }).format(number);
    }
}

new CurrencyConverter();