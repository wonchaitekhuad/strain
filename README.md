# STRIAN - Free Online Structural Analysis

A free online structural analysis calculator for beams, frames, and trusses. Evaluate reactions, Shear Force Diagrams (SFD), Bending Moment Diagrams (BMD), Normal Force Diagrams (NFD), and deflected shapes.

## Features

- **2D Structural Analysis**: Analyze beams, frames, and trusses
- **Results Visualization**: View SFD, BMD, NFD, reactions, and deflections
- **Cloud Storage**: Save and share your structural models online (requires internet connection)
- **Offline Capable**: Core structural analysis functionality works without an internet connection

## Offline Functionality

STRIAN now supports offline operation with automatic fallback mechanisms for network-dependent features.

### What Works Offline

- **Structural Analysis**: All core analysis features work completely offline
  - Create and edit nodes, beams, and supports
  - Apply loads (point loads, distributed loads, moments)
  - Calculate reactions, internal forces, and deflections
  - Visualize results (SFD, BMD, NFD, deflected shapes)

- **Local Storage**: Save and load models using browser's file system
  - Use the "Save" button to download models as XML files
  - Use the "Load" button to open previously saved files from your computer

### What Requires Internet Connection

- **Cloud Storage**
  - Saving models to cloud
  - Loading models from cloud URLs
  - Sharing models with others via link

- **Analytics**: Web analytics (StatCounter) for usage tracking

### Offline Mode Detection

The application automatically detects when you're offline and:
1. Disables cloud storage features with informative messages
2. Bypasses analytics to prevent errors
3. Shows a notification: "Running in offline mode - cloud features unavailable"
4. Automatically re-enables features when connection is restored

### How to Use Offline

1. **First Time Setup** (requires internet):
   - Visit the application once while online
   - The browser will cache all necessary files

2. **Working Offline**:
   - Open the application as normal (from browser cache or local files)
   - Use all structural analysis features normally
   - Save your work using "Save" button to download files locally
   - Load previous work using "Load" button

3. **Reconnecting**:
   - When connection is restored, cloud features automatically become available
   - You'll see a notification: "Connection restored"

### Technical Implementation

The offline handling system consists of:

- **`js/offline-handler.js`**: Core offline detection and fallback logic
  - Monitors browser's online/offline status
  - Tests network connectivity
  - Provides graceful degradation for external resources
  - Wraps cloud API calls with offline checks

- **Graceful Fallbacks**:
  - Analytics services are stubbed when unavailable
  - Cloud API calls show user-friendly error messages
  - External resource loading is wrapped with error handlers

### Browser Compatibility

Offline features require modern browsers with:
- Service Workers support (for advanced caching, if implemented)
- LocalStorage API (for storing preferences)
- FileReader API (for loading local files)

Supported browsers:
- Chrome 45+
- Firefox 44+
- Safari 11.1+
- Edge 17+

## File Structure

```
/
├── index.html                 # Main application file
├── js/
│   ├── offline-handler.js    # Offline functionality handler
│   ├── counter.js            # Analytics (optional, online only)
│   ├── solver.32.min.js      # Structural analysis solver
│   ├── sections.min.js       # Section properties calculator
│   ├── jquery-3.6.0.min.js   # jQuery library
│   ├── jquery-ui.min.js      # jQuery UI  
│   └── svg.min.js            # SVG manipulation library
├── css/
│   └── kickstart.min.css     # Base styles
├── fonts/
│   └── Glyphter.*            # Icon font (embedded in HTML)
└── images/
    └── StrianIcon_Transp_48x48.ico  # Application icon
```

## Local Development

To run STRIAN locally:

1. **No build process required** - STRIAN is a static HTML application
2. **Option 1 - Simple File Open**: 
   - Simply open `index.html` in your browser
   - All features work except external analytics and cloud storage

3. **Option 2 - Local Server** (recommended for full testing):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using PHP
   php -S localhost:8000
   
   # Using Node.js (with http-server)
   npx http-server -p 8000
   ```
   Then visit `http://localhost:8000`

## Contributing

When contributing to offline functionality:

1. **Test Offline Scenarios**: Always test your changes with:
   - Browser in offline mode (DevTools > Network > Offline)
   - Network disconnected
   - Slow/intermittent connections

2. **Graceful Degradation**: Ensure features degrade gracefully:
   - Show informative error messages
   - Don't break core functionality
   - Provide alternative solutions when possible

3. **Error Handling**: Wrap external resource access with try/catch:
   ```javascript
   try {
       // External resource access
   } catch (e) {
       if (window.STRIAN_Offline) {
           window.STRIAN_Offline.handleResourceError('ResourceName', e);
       }
   }
   ```

## License

This project is available for free use. See the application credits for library attributions.

## Credits

- **Authors**: Miroslav Stibor, Petr Frantík
- **Contact**: info [at] structural-analyser.com
- **Libraries Used**:
  - [svg.js](https://svgjs.dev/docs/3.0/) by Wout Fierens
  - [HTML KickStart](https://github.com/joshuagatcke/HTML-KickStart) by Joshua Gatcke
  - [jQuery UI Touch Punch](https://github.com/furf/jquery-ui-touch-punch) by Dave Furfero
  - [Glyphter](https://glyphter.com/) for vector icons
  - [jQuery](https://jquery.com/) 
  - [jQuery UI](https://jqueryui.com/)

## Support

For issues or questions:
- GitHub Issues: [github.com/wonchaitekhuad/strain](https://github.com/wonchaitekhuad/strain)
- Email: info [at] structural-analyser.com
