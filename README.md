# Dynamic Trip Planner

A beautiful, interactive trip planning application that dynamically loads trip data from a CSV file. Perfect for visualizing multi-day journeys with dates, routes, and detailed stop information.

## 🌟 Features

- **Dynamic CSV Loading**: Trip data loads from `trip-data.csv` - no code changes needed
- **Date-Aware Interface**: Each stop displays proper dates with chronological organization
- **Interactive Map**: Leaflet-based mapping with route visualization
- **Glass UI Design**: Modern, translucent interface with backdrop blur effects
- **Responsive Design**: Floating day buttons that adapt to content
- **Route Visualization**: Automatic routing between stops with fallback support
- **Cross-Device Sync**: Updates appear on all devices when CSV is modified

## 🚀 Quick Start

### Local Development
1. Place `index.html` and `trip-data.csv` in the same folder
2. Open `index.html` in a web browser
3. Edit `trip-data.csv` to update trip data

### Netlify Deployment
1. Create a GitHub repository
2. Upload `index.html` and `trip-data.csv`
3. Connect to Netlify with auto-deploy enabled
4. Get your public URL: `https://your-site-name.netlify.app`

## 📄 CSV Data Format

The `trip-data.csv` file uses this structure:

```csv
day,date,location,lat,lon,notes,color
1,2025-10-03,"585 E 21st St, Brooklyn NY",40.6089,-73.9570,"Trip starting point",#FF6B6B
1,2025-10-03,"1349 Main Road, Granville MA",42.0653,-72.8620,"First destination",#FF6B6B
2,2025-10-04,"218 Streeter Rd, Dorchester NH",43.7534,-71.9723,"Mountain views",#4ECDC4
```

### CSV Fields

- **day**: Numeric day identifier (1, 2, 3, etc.)
- **date**: ISO date format (YYYY-MM-DD)
- **location**: Full address or place name
- **lat/lon**: Decimal coordinates for mapping
- **notes**: Optional description or details
- **color**: Hex color code for the day's theme

## ✨ UI Features

### Day Buttons
- **Compact Design**: Shows "Day 1 (2 stops) • Oct 3"
- **Color Coding**: Each day has a unique color with indicator dot
- **Visibility Toggle**: Checkbox to show/hide routes and markers
- **Dynamic Layout**: Automatically fits available space

### Expanded Views
- **Full Date Display**: "Day 1 - October 3, 2025"
- **Color Picker**: Change route colors interactively
- **Stop Cards**: Detailed view with dates and notes
- **Route Information**: Visual connection between stops

### Map Features
- **Smart Markers**: Day numbers with color-coded backgrounds
- **Route Visualization**: Curved roads or straight-line fallbacks
- **Interactive Popups**: Detailed stop information on click
- **Auto-Fitting**: Map centers on trip bounds automatically

## 🔄 Content Management

### GitHub Workflow (Recommended)
1. **Edit CSV**: Use GitHub web interface or upload new file
2. **Commit Changes**: Automatic deployment triggers
3. **Live Updates**: Changes appear on all devices within 30 seconds
4. **Version Control**: Full history of all changes

### Google Sheets Alternative
For easier editing, you can:
1. Create a Google Sheet with the same column structure
2. Publish as CSV with public access
3. Update the fetch URL in `index.html` to point to your sheet
4. Changes appear instantly across all devices

## 🛠️ Customization

### Adding More Days
Simply add more rows to the CSV with higher day numbers. The interface automatically adapts.

### Changing Locations
Update coordinates using:
- Google Maps: Right-click → "What's here?"
- Geocoding APIs: Convert addresses to coordinates
- GPS coordinates: From mobile devices

### Styling
Modify CSS variables in `index.html`:
- Glass blur effects
- Color schemes
- Button layouts
- Typography

## 🌐 API Dependencies

- **OpenStreetMap**: Map tiles (free, no limits)
- **OSRM**: Route calculations (free, rate limited)
- **Nominatim**: Address geocoding (free, rate limited)

All APIs have fallback systems for reliability.

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Friendly**: Responsive design for all devices
- **Offline Capable**: Works without internet after initial load

## 🤝 Contributing

1. Fork the repository
2. Edit `trip-data.csv` or `index.html`
3. Test changes locally
4. Submit pull request

## 📄 License

Open source - feel free to use, modify, and share!

---

**Ready to plan your next adventure?** 🗺️ Just update the CSV file and watch your trip come to life!