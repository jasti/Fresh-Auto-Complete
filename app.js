// Fresh Autocomplete App
// Combines trending data from multiple sources with personalization

class FreshAutocomplete {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.resultsContainer = document.getElementById('autocompleteResults');
        this.clearBtn = document.getElementById('clearBtn');
        this.trendingTopics = document.getElementById('trendingTopics');
        this.locationText = document.getElementById('locationText');
        this.personalizedText = document.getElementById('personalizedText');

        this.selectedIndex = -1;
        this.currentResults = [];
        this.userLocation = null;
        this.searchHistory = this.loadSearchHistory();
        this.interests = this.loadInterests();
        this.trendingCache = { data: [], timestamp: 0 };
        this.debounceTimer = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.detectLocation();
        this.loadTrendingTopics();
        this.updatePersonalizationText();

        // Refresh trending topics every 5 minutes
        setInterval(() => this.loadTrendingTopics(), 5 * 60 * 1000);
    }

    setupEventListeners() {
        // Search input
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
        this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.searchInput.addEventListener('focus', () => {
            if (this.currentResults.length > 0) {
                this.resultsContainer.classList.add('visible');
            }
        });

        // Clear button
        this.clearBtn.addEventListener('click', () => this.clearSearch());

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.resultsContainer.classList.remove('visible');
            }
        });

        // Settings
        document.getElementById('settingsToggle').addEventListener('click', () => {
            document.getElementById('settingsPanel').classList.toggle('hidden');
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearSearchHistory();
        });

        document.getElementById('clearPersonalization').addEventListener('click', () => {
            this.resetPersonalization();
        });

        document.getElementById('newsApiKey').addEventListener('change', (e) => {
            localStorage.setItem('newsApiKey', e.target.value);
            this.loadTrendingTopics();
        });

        // Load saved API key
        const savedApiKey = localStorage.getItem('newsApiKey');
        if (savedApiKey) {
            document.getElementById('newsApiKey').value = savedApiKey;
        }
    }

    handleInput(e) {
        const query = e.target.value.trim();

        // Show/hide clear button
        if (query) {
            this.clearBtn.classList.add('visible');
        } else {
            this.clearBtn.classList.remove('visible');
            this.resultsContainer.classList.remove('visible');
            return;
        }

        // Debounce autocomplete requests
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.getAutocomplete(query);
        }, 150);
    }

    handleKeydown(e) {
        if (!this.resultsContainer.classList.contains('visible')) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentResults.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectResult(this.currentResults[this.selectedIndex]);
                }
                break;
            case 'Escape':
                this.resultsContainer.classList.remove('visible');
                break;
        }
    }

    async getAutocomplete(query) {
        const suggestions = await Promise.all([
            this.getGoogleSuggestions(query),
            this.getWikipediaSearchSuggestions(query),
            this.getDuckDuckGoSuggestions(query),
            this.getSmartQueryExpansions(query),
            this.getPersonalizedSuggestions(query),
            this.getTrendingSuggestions(query)
        ]);

        // Combine and deduplicate suggestions
        const combined = [];
        const seen = new Set();

        suggestions.forEach(source => {
            source.forEach(item => {
                const normalized = item.text.toLowerCase();
                if (!seen.has(normalized)) {
                    seen.add(normalized);
                    combined.push(item);
                }
            });
        });

        // Sort by relevance and freshness
        combined.sort((a, b) => {
            // Prioritize trending and personalized
            if (a.source === 'trending' && b.source !== 'trending') return -1;
            if (b.source === 'trending' && a.source !== 'trending') return 1;
            if (a.source === 'personalized' && b.source !== 'personalized') return -1;
            if (b.source === 'personalized' && a.source !== 'personalized') return 1;
            if (a.source === 'smart' && b.source !== 'smart') return -1;
            if (b.source === 'smart' && a.source !== 'smart') return 1;

            // Then by freshness score
            return (b.freshness || 0) - (a.freshness || 0);
        });

        this.currentResults = combined.slice(0, 10);
        this.displayResults();
    }

    async getGoogleSuggestions(query) {
        try {
            const response = await fetch(
                `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();

            return (data[1] || []).map(text => ({
                text,
                source: 'google',
                freshness: 5
            }));
        } catch (error) {
            console.error('Google suggestions error:', error);
            return [];
        }
    }

    async getWikipediaSearchSuggestions(query) {
        try {
            const response = await fetch(
                `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`
            );
            const data = await response.json();

            return (data[1] || []).map(text => ({
                text,
                source: 'wikipedia',
                freshness: 6
            }));
        } catch (error) {
            console.error('Wikipedia search error:', error);
            return [];
        }
    }

    async getDuckDuckGoSuggestions(query) {
        try {
            const response = await fetch(
                `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`
            );
            const data = await response.json();

            return (data[1] || []).slice(0, 5).map(text => ({
                text,
                source: 'duckduckgo',
                freshness: 5
            }));
        } catch (error) {
            console.error('DuckDuckGo suggestions error:', error);
            return [];
        }
    }

    getSmartQueryExpansions(query) {
        const queryLower = query.toLowerCase();
        const suggestions = [];

        // Common question patterns
        const questionPatterns = [
            { starts: ['what is', 'what are', 'what was', 'what were'], completions: ['happening', 'trending', 'the best', 'the latest', 'new'] },
            { starts: ['how to', 'how do', 'how does', 'how can'], completions: ['today', 'now', 'this year', '2026'] },
            { starts: ['why is', 'why are', 'why did', 'why does'], completions: ['trending', 'important', 'popular', 'happening'] },
            { starts: ['when is', 'when did', 'when does'], completions: ['today', 'this year', 'happening', 'next'] },
            { starts: ['where is', 'where are', 'where can'], completions: ['trending', 'happening', 'now', 'today'] }
        ];

        // Check if query matches any pattern
        questionPatterns.forEach(pattern => {
            pattern.starts.forEach(start => {
                if (queryLower.startsWith(start)) {
                    pattern.completions.forEach(completion => {
                        const suggestion = `${query} ${completion}`;
                        suggestions.push({
                            text: suggestion,
                            source: 'smart',
                            freshness: 7
                        });
                    });
                }
            });
        });

        // Add location-based completions if we have location
        if (this.userLocation && this.userLocation.name) {
            if (queryLower.includes('what is happening') || queryLower.includes('what\'s happening')) {
                suggestions.push({
                    text: `${query} in ${this.userLocation.name}`,
                    source: 'smart',
                    freshness: 9
                });
                suggestions.push({
                    text: `${query} today`,
                    source: 'smart',
                    freshness: 9
                });
            }

            // Add location for general queries
            const locationTriggers = ['near me', 'nearby', 'local', 'in my area'];
            if (!locationTriggers.some(trigger => queryLower.includes(trigger)) && query.split(' ').length <= 3) {
                if (queryLower.startsWith('where') || queryLower.startsWith('find')) {
                    suggestions.push({
                        text: `${query} near ${this.userLocation.name}`,
                        source: 'smart',
                        freshness: 8
                    });
                }
            }
        }

        // Add trending topic completions
        if (query.length >= 3) {
            this.trendingCache.data.slice(0, 3).forEach(trend => {
                const trendWords = trend.toLowerCase().split(' ');
                const queryWords = queryLower.split(' ');

                // Check if any words match
                const hasMatch = trendWords.some(tw => queryWords.some(qw => tw.includes(qw) || qw.includes(tw)));

                if (hasMatch && !queryLower.includes(trend.toLowerCase())) {
                    suggestions.push({
                        text: `${query} ${trend}`,
                        source: 'smart',
                        freshness: 8
                    });
                }
            });
        }

        return suggestions.slice(0, 4);
    }

    getPersonalizedSuggestions(query) {
        const queryLower = query.toLowerCase();
        const matches = [];

        // Match against search history
        this.searchHistory.forEach(item => {
            if (item.query.toLowerCase().includes(queryLower) && item.query !== query) {
                matches.push({
                    text: item.query,
                    source: 'personalized',
                    freshness: 8
                });
            }
        });

        // Match against interests
        Object.keys(this.interests).forEach(interest => {
            if (interest.toLowerCase().includes(queryLower)) {
                matches.push({
                    text: interest,
                    source: 'personalized',
                    freshness: 7
                });
            }
        });

        return matches.slice(0, 3);
    }

    getTrendingSuggestions(query) {
        const queryLower = query.toLowerCase();
        const matches = [];

        this.trendingCache.data.forEach(trend => {
            if (trend.toLowerCase().includes(queryLower)) {
                matches.push({
                    text: trend,
                    source: 'trending',
                    freshness: 10
                });
            }
        });

        return matches.slice(0, 3);
    }

    displayResults() {
        if (this.currentResults.length === 0) {
            this.resultsContainer.classList.remove('visible');
            return;
        }

        this.resultsContainer.innerHTML = this.currentResults.map((result, index) => `
            <div class="autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}"
                 data-index="${index}">
                <span class="autocomplete-item-text">${this.highlightQuery(result.text)}</span>
                <span class="autocomplete-item-source source-${result.source}">
                    ${this.getSourceIcon(result.source)}
                </span>
            </div>
        `).join('');

        this.resultsContainer.classList.add('visible');

        // Add click handlers
        this.resultsContainer.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.selectResult(this.currentResults[index]);
            });
        });
    }

    highlightQuery(text) {
        const query = this.searchInput.value.trim();
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    getSourceIcon(source) {
        const icons = {
            'google': '🔍',
            'wikipedia': '📚',
            'duckduckgo': '🦆',
            'smart': '💡',
            'trending': '🔥',
            'personalized': '⭐',
            'local': '📍'
        };
        return icons[source] || '•';
    }

    updateSelection() {
        const items = this.resultsContainer.querySelectorAll('.autocomplete-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });

        // Scroll selected item into view
        if (this.selectedIndex >= 0) {
            items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    selectResult(result) {
        this.searchInput.value = result.text;
        this.resultsContainer.classList.remove('visible');
        this.addToSearchHistory(result.text);
        this.updateInterests(result.text);

        // Simulate search (in a real app, this would navigate or perform search)
        console.log('Searching for:', result.text);
    }

    clearSearch() {
        this.searchInput.value = '';
        this.clearBtn.classList.remove('visible');
        this.resultsContainer.classList.remove('visible');
        this.currentResults = [];
        this.searchInput.focus();
    }

    // Location Detection
    async detectLocation() {
        if (!navigator.geolocation) {
            this.locationText.textContent = '📍 Location not available';
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            this.userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            // Get location name
            await this.getLocationName();
        } catch (error) {
            this.locationText.textContent = '📍 Location access denied';
        }
    }

    async getLocationName() {
        try {
            // Using OpenStreetMap's Nominatim API for reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${this.userLocation.lat}&lon=${this.userLocation.lon}&format=json`
            );
            const data = await response.json();

            const city = data.address.city || data.address.town || data.address.village || 'Unknown';
            const country = data.address.country || '';

            this.locationText.textContent = `📍 ${city}, ${country}`;
            this.userLocation.name = city;
        } catch (error) {
            this.locationText.textContent = '📍 Location detected';
        }
    }

    // Trending Topics
    async loadTrendingTopics() {
        // Check cache (5 minute freshness)
        if (Date.now() - this.trendingCache.timestamp < 5 * 60 * 1000 && this.trendingCache.data.length > 0) {
            this.displayTrendingTopics();
            return;
        }

        const topics = await Promise.all([
            this.getRedditTrending(),
            this.getWikipediaTrending(),
            this.getNewsTrending()
        ]);

        // Combine and deduplicate
        const combined = [];
        const seen = new Set();

        topics.forEach(source => {
            source.forEach(topic => {
                const normalized = topic.toLowerCase();
                if (!seen.has(normalized) && topic.length > 2) {
                    seen.add(normalized);
                    combined.push(topic);
                }
            });
        });

        this.trendingCache = {
            data: combined.slice(0, 15),
            timestamp: Date.now()
        };

        this.displayTrendingTopics();
    }

    async getRedditTrending() {
        try {
            const response = await fetch('https://www.reddit.com/r/all/hot.json?limit=10');
            const data = await response.json();

            return data.data.children.map(post => post.data.title.split(' ').slice(0, 5).join(' '));
        } catch (error) {
            console.error('Reddit trending error:', error);
            return [];
        }
    }

    async getWikipediaTrending() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0].replace(/-/g, '/');

            const response = await fetch(
                `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${dateStr}`
            );
            const data = await response.json();

            return (data.items[0]?.articles || [])
                .slice(0, 10)
                .map(article => article.article.replace(/_/g, ' '))
                .filter(title => !title.includes(':') && title.length < 50);
        } catch (error) {
            console.error('Wikipedia trending error:', error);
            return [];
        }
    }

    async getNewsTrending() {
        const apiKey = localStorage.getItem('newsApiKey');
        if (!apiKey) return [];

        try {
            const response = await fetch(
                `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${apiKey}`
            );
            const data = await response.json();

            if (data.articles) {
                return data.articles.map(article => {
                    // Extract key phrases from title
                    const words = article.title.split(' ').slice(0, 4);
                    return words.join(' ');
                });
            }
        } catch (error) {
            console.error('News trending error:', error);
        }
        return [];
    }

    displayTrendingTopics() {
        this.trendingTopics.innerHTML = this.trendingCache.data.map((topic, index) => `
            <div class="trending-topic ${index < 5 ? 'fresh' : ''}"
                 onclick="freshAutocomplete.fillSearch('${topic.replace(/'/g, "\\'")}')">
                ${topic}
            </div>
        `).join('');
    }

    fillSearch(topic) {
        this.searchInput.value = topic;
        this.searchInput.focus();
        this.getAutocomplete(topic);
    }

    // Personalization
    loadSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('searchHistory') || '[]');
        } catch {
            return [];
        }
    }

    addToSearchHistory(query) {
        // Add to beginning, remove duplicates, limit to 50
        this.searchHistory = [
            { query, timestamp: Date.now() },
            ...this.searchHistory.filter(item => item.query !== query)
        ].slice(0, 50);

        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }

    loadInterests() {
        try {
            return JSON.parse(localStorage.getItem('interests') || '{}');
        } catch {
            return {};
        }
    }

    updateInterests(query) {
        // Extract keywords and increase their weight
        const words = query.toLowerCase().split(' ').filter(w => w.length > 3);

        words.forEach(word => {
            this.interests[word] = (this.interests[word] || 0) + 1;
        });

        // Keep top 100 interests
        const sorted = Object.entries(this.interests)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 100);

        this.interests = Object.fromEntries(sorted);
        localStorage.setItem('interests', JSON.stringify(this.interests));

        this.updatePersonalizationText();
    }

    updatePersonalizationText() {
        const interestCount = Object.keys(this.interests).length;
        const historyCount = this.searchHistory.length;

        if (interestCount === 0 && historyCount === 0) {
            this.personalizedText.textContent = '🎯 Start searching to personalize';
        } else {
            this.personalizedText.textContent = `🎯 ${interestCount} interests learned from ${historyCount} searches`;
        }
    }

    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
        this.updatePersonalizationText();
        alert('Search history cleared!');
    }

    resetPersonalization() {
        this.interests = {};
        localStorage.removeItem('interests');
        this.updatePersonalizationText();
        alert('Personalization reset!');
    }
}

// Initialize the app
let freshAutocomplete;
document.addEventListener('DOMContentLoaded', () => {
    freshAutocomplete = new FreshAutocomplete();
});
