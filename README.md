# 🔥 Fresh Autocomplete

A modern, intelligent autocomplete search app that surfaces the most up-to-date trending content as you type. It learns from your interests and provides personalized suggestions based on your location and search history.

## ✨ Features

- **Real-time Trending Content**: Pulls fresh trending topics from multiple sources
- **Intelligent Autocomplete**: Advanced multi-source autocomplete that works with natural queries
- **Smart Query Expansion**: Automatically suggests completions for conversational queries like "what is happening..."
- **Personalized Suggestions**: Learns from your search history and interests
- **Location-Aware**: Detects your location for local trending content
- **Multiple Data Sources**:
  - Google Autocomplete Suggestions
  - Wikipedia OpenSearch
  - DuckDuckGo Autocomplete
  - Smart Query Templates (for natural language queries)
  - Reddit Hot Topics
  - Wikipedia Trending Articles
  - News Headlines (with NewsAPI key)
- **Privacy-Focused**: All personalization data stored locally in your browser
- **Beautiful UI**: Modern dark theme with smooth animations
- **Fully Responsive**: Works great on desktop and mobile

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in your web browser - no server required!

```bash
# On Mac
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

### Option 2: Use a Local Server
For best results, serve using a local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🔑 Optional: NewsAPI Setup

For enhanced trending news topics:

1. Get a free API key from [newsapi.org](https://newsapi.org)
2. Click the ⚙️ Settings button in the app
3. Enter your API key in the NewsAPI Key field
4. Your key is saved locally and will be used for news trending topics

**Note**: The app works perfectly fine without a NewsAPI key - it will use Reddit and Wikipedia as trending sources.

## 📖 How to Use

1. **Start Typing**: Begin typing in the search box to see autocomplete suggestions
2. **View Trending**: Check out the "Trending Now" section for current hot topics
3. **Click Topics**: Click any trending topic to search for it
4. **Navigation**: Use arrow keys to navigate suggestions, Enter to select
5. **Personalization**: The more you search, the better the suggestions become!

### 💬 Natural Language Queries

The app works great with conversational queries! Try typing:
- "what is happening..." → get suggestions like "what is happening today", "what is happening in [your city]"
- "how to..." → smart completions with current year and trending topics
- "why is..." → trending topic completions
- "where can..." → location-aware suggestions
- "when is..." → time-based query expansions

The smart query expansion feature recognizes question patterns and automatically suggests relevant completions!

## 🎯 Understanding Suggestion Sources

Suggestions are tagged with different sources:

- 🔥 **Trending**: From current trending topics (Reddit, Wikipedia, News)
- 💡 **Smart**: Intelligent query expansions for natural language questions
- ⭐ **Personalized**: Based on your search history and interests
- 🔍 **Google**: From Google's autocomplete API
- 📚 **Wikipedia**: From Wikipedia's OpenSearch suggestions
- 🦆 **DuckDuckGo**: From DuckDuckGo's autocomplete

The app intelligently combines all sources and prioritizes fresh, trending content!

## 🔒 Privacy

- All data is stored **locally** in your browser's localStorage
- No data is sent to any third-party servers (except public APIs for trending data)
- You can clear your search history and personalization data anytime in Settings

## 🛠️ Technical Details

### Technologies Used
- Pure Vanilla JavaScript (ES6+)
- CSS3 with animations
- LocalStorage for data persistence
- Geolocation API for location detection

### Data Sources
- **Google Autocomplete**: `suggestqueries.google.com`
- **Wikipedia OpenSearch**: `en.wikipedia.org/w/api.php` (autocomplete suggestions)
- **Wikipedia Trending**: Wikimedia pageviews API (trending articles)
- **DuckDuckGo**: `duckduckgo.com/ac/` (autocomplete suggestions)
- **Reddit**: `/r/all/hot.json` endpoint
- **NewsAPI**: Top headlines (optional, requires API key)
- **OpenStreetMap**: Nominatim API for location names
- **Smart Query Templates**: Client-side pattern matching for natural language queries

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## ⚙️ Settings

Access settings by clicking the ⚙️ Settings button:

- **NewsAPI Key**: Enter your API key for news trending topics
- **Clear Search History**: Remove all saved searches
- **Reset Personalization**: Clear learned interests
- **Use Location**: Toggle location detection on/off

## 🎨 Customization

The app uses CSS variables for easy theming. Edit `styles.css`:

```css
:root {
    --primary-color: #6366f1;    /* Main theme color */
    --accent-color: #ec4899;     /* Accent highlights */
    --bg-color: #0f172a;         /* Background */
    --surface-color: #1e293b;    /* Card backgrounds */
    --text-color: #f1f5f9;       /* Text */
}
```

## 🔄 How Personalization Works

1. **Search History**: Every search is saved locally (up to 50 recent searches)
2. **Interest Learning**: Keywords from your searches are tracked and weighted
3. **Smart Suggestions**: Your personalized interests are used to rank and filter suggestions
4. **Freshness Priority**: Recent trending topics are prioritized over older data

## 📱 Mobile Support

The app is fully responsive and works great on mobile devices:
- Touch-friendly interface
- Responsive design for all screen sizes
- Optimized performance for mobile browsers

## 🐛 Troubleshooting

**Autocomplete not working?**
- Check your internet connection
- Make sure you're allowing the page to access the internet
- Some ad blockers may interfere with external APIs

**Location not detected?**
- Grant location permission when prompted
- Check browser settings for location access
- Some browsers block location on non-HTTPS sites

**Trending topics not updating?**
- The app caches trending topics for 5 minutes
- Refresh the page to force an update
- Check console for any API errors

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork, modify, and improve this app! Some ideas for enhancements:

- Add more trending data sources (Twitter, TikTok, etc.)
- Implement category-based filtering
- Add search history visualization
- Create backend for shared trending topics
- Add internationalization support

## 📞 Support

If you encounter any issues or have suggestions, please open an issue on the repository.

---

**Enjoy discovering what's trending! 🎉**
