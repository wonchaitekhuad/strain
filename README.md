# STRIAN - Structural Analysis Application

Online free structure analysis calculator for evaluating beams, frames, and trusses.

## New Offline Features

### Export Capabilities

The application now supports exporting your work to local files:

#### 1. Export as JSON
- Complete project data including structure and settings
- Recommended format for backup and data interchange
- Includes metadata and timestamp

#### 2. Export as XML
- Structure data in XML format
- Compatible with server save format
- Lightweight and portable

#### 3. Export Diagram (SVG)
- Scalable vector graphics format
- Perfect for documentation and presentations
- Includes embedded styles for accurate rendering
- Can be opened in any vector graphics editor

#### 4. Export Diagram (PNG)
- High-quality raster image (2x resolution)
- Ready for insertion in documents
- Compatible with all image viewers

#### 5. Export as PDF
- Opens browser print dialog
- Use "Save as PDF" option
- Includes current view and results

### Import Capabilities

#### Import from File
- Load previously exported JSON or XML files
- Automatically detects file format
- Restores project structure and settings

### Auto-Save Feature

- Automatically saves your work to browser's localStorage every 2 minutes
- Prevents data loss from accidental browser closure
- Offers to restore auto-saved project on next visit
- No server connection required

### Offline Support

The application now includes:

#### Service Worker
- Caches application resources for offline use
- Enables the app to work without internet connection
- Automatically updates when new version is available

#### Progressive Web App (PWA)
- Can be installed on your device
- Works like a native application
- Responsive design for mobile and desktop

#### Settings Cache
- User preferences stored in localStorage
- Settings persist across sessions
- No need to reconfigure each time

## How to Use

### Exporting a Project

1. Click the "Files" button in the toolbar
2. Navigate to the "Export" tab
3. Choose your preferred export format
4. File will be downloaded to your Downloads folder

### Importing a Project

1. Click the "Files" button in the toolbar
2. Navigate to the "Import" tab
3. Click "Import from File"
4. Select a previously exported JSON or XML file
5. Project will be loaded immediately

### Using Offline

1. Visit the application while online (first time)
2. Resources are automatically cached
3. Application will work offline on subsequent visits
4. Auto-save ensures your work is never lost

## Browser Compatibility

- **Chrome/Edge:** Full support including Service Worker
- **Firefox:** Full support including Service Worker
- **Safari:** Full support (Service Worker support varies by version)
- **Mobile browsers:** Full support on modern browsers

## Technical Details

### File Formats

- **JSON Export:** UTF-8 encoded JSON with project data, settings, and metadata
- **XML Export:** XML format compatible with server storage
- **SVG Export:** Standard SVG 1.1 with embedded CSS
- **PNG Export:** High-quality PNG with 2x scaling for clarity

### Storage

- **localStorage:** Used for auto-save and settings cache
- **Service Worker Cache:** Used for offline resource storage
- **File System:** Export/Import uses browser's File API

### Security

- All processing happens in your browser
- No data is sent to external servers during export/import
- Service Worker only caches application resources
- User data remains private

## Limitations

- Auto-save limited by browser's localStorage quota (typically 5-10 MB)
- Service Worker requires HTTPS in production (works on localhost for development)
- PNG export quality depends on browser's canvas rendering
- PDF export requires browser's print functionality

## Credits

Original STRIAN application with new offline features added for enhanced usability and data portability.
