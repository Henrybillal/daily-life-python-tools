class WeatherForecaster {
    constructor() {
        this.apiKey = 'YOUR_API_KEY';
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.location = document.getElementById('location');
        this.temperature = document.getElementById('temperature');
        this.description = document.getElementById('description');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.forecast = document.getElementById('forecast');

        this.setupEventListeners();
        this.getCurrentLocation();
    }

    setupEventListeners() {
        this.searchBtn.addEventListener('click', () => this.getWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.getWeather();
        });
    }

    async getCurrentLocation() {
        try {
            if ('geolocation' in navigator) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
                );
                const data = await response.json();
                this.displayWeather(data);
                this.getForecast(data.name);
            }
        } catch (error) {
            console.log('Location access denied or error:', error);
        }
    }

    // Weather condition to Unsplash image mapping
    getWeatherImage(condition) {
        const weatherImages = {
            'Clear': 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=640&q=80',
            'Clouds': 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=640&q=80',
            'Rain': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=640&q=80',
            'Snow': 'https://images.unsplash.com/photo-1516431883744-0787975ffe0a?w=640&q=80',
            'Thunderstorm': 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=640&q=80',
            'Drizzle': 'https://images.unsplash.com/photo-1541919939460-a978b6778490?w=640&q=80',
            'Mist': 'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=640&q=80'
        };
        return weatherImages[condition] || weatherImages['Clear'];
    }

    displayWeather(data) {
        const country = data.sys?.country || '';
        this.location.textContent = country ? `${data.name}, ${country}` : data.name;
        this.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        this.description.textContent = data.weather[0].description;
        this.humidity.textContent = `${data.main.humidity}%`;
        this.windSpeed.textContent = `${data.wind.speed} m/s`;
        this.pressure.textContent = `${data.main.pressure} hPa`;
        
        // Use Unsplash weather images
        const condition = data.weather[0].main;
        this.weatherIcon.src = this.getWeatherImage(condition);
        this.weatherIcon.alt = condition;
    }

    displayForecast(data) {
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
        this.forecast.innerHTML = dailyForecasts.map(day => `
            <div class="forecast-item">
                <div>${new Date(day.dt * 1000).toLocaleDateString()}</div>
                <img src="${this.getWeatherImage(day.weather[0].main)}" 
                     alt="${day.weather[0].main}"
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                <div>${Math.round(day.main.temp)}°C</div>
                <div>${day.weather[0].description}</div>
            </div>
        `).join('');
    }

    async getWeather() {
        const city = this.cityInput.value.trim();
        if (!city) return;

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
            );
            const data = await response.json();

            if (data.cod === '404') {
                throw new Error('City not found');
            }

            this.displayWeather(data);
            this.getForecast(city);
        } catch (error) {
            alert(error.message || 'Error fetching weather data');
        }
    }

    async getForecast(city) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`
            );
            const data = await response.json();
            this.displayForecast(data);
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    }
}

new WeatherForecaster();