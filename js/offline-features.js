/**
 * STRIAN Offline Features Module
 * Provides local file save/load, export capabilities, and offline caching
 */

(function() {
    'use strict';

    // Configuration constants
    const CONFIG = {
        AUTO_SAVE_INTERVAL: 120000,  // 2 minutes in milliseconds
        MAX_FILE_SIZE: 10 * 1024 * 1024,  // 10MB in bytes
        SERVICE_WORKER_PATH: '/sw.js',
        CACHE_PREFIX: 'strian_'
    };

    // Offline Features Manager
    window.OfflineFeatures = {
        
        /**
         * Save current project data as JSON file to local disk
         */
        exportAsJSON: function() {
            try {
                // Get the Data element which contains the structure information
                const dataElement = document.getElementById('Data');
                if (!dataElement) {
                    this.showMessage('No data to export', 'error');
                    return;
                }

                // Get the XML content
                const xmlContent = dataElement.innerHTML;
                
                // Create a data object with metadata
                const exportData = {
                    version: '1.0',
                    timestamp: new Date().toISOString(),
                    application: 'STRIAN',
                    data: xmlContent,
                    settings: this.getCurrentSettings()
                };

                // Convert to JSON
                const jsonString = JSON.stringify(exportData, null, 2);
                
                // Create filename
                const filename = this.getFileName() || 'structure';
                const fullFilename = filename + '_' + this.getTimestamp() + '.json';
                
                // Download file
                this.downloadFile(jsonString, fullFilename, 'application/json');
                this.showMessage('Project exported as JSON: ' + fullFilename, 'success');
            } catch (error) {
                console.error('Export JSON error:', error);
                this.showMessage('Failed to export JSON: ' + error.message, 'error');
            }
        },

        /**
         * Save current project data as XML file to local disk
         */
        exportAsXML: function() {
            try {
                const dataElement = document.getElementById('Data');
                if (!dataElement) {
                    this.showMessage('No data to export', 'error');
                    return;
                }

                const xmlContent = dataElement.innerHTML;
                const filename = this.getFileName() || 'structure';
                const fullFilename = filename + '_' + this.getTimestamp() + '.xml';
                
                this.downloadFile(xmlContent, fullFilename, 'application/xml');
                this.showMessage('Project exported as XML: ' + fullFilename, 'success');
            } catch (error) {
                console.error('Export XML error:', error);
                this.showMessage('Failed to export XML: ' + error.message, 'error');
            }
        },

        /**
         * Export SVG diagram to file
         */
        exportAsSVG: function() {
            try {
                const svgElement = document.querySelector('#sti_svg_canvas svg');
                if (!svgElement) {
                    this.showMessage('No diagram to export', 'error');
                    return;
                }

                // Clone the SVG to avoid modifying the original
                const clonedSVG = svgElement.cloneNode(true);
                
                // Add XML namespace if not present
                clonedSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                clonedSVG.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                
                // Get all stylesheets and embed them
                const styles = this.getEmbeddedStyles();
                if (styles) {
                    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
                    styleElement.textContent = styles;
                    clonedSVG.insertBefore(styleElement, clonedSVG.firstChild);
                }

                // Serialize the SVG
                const serializer = new XMLSerializer();
                let svgString = serializer.serializeToString(clonedSVG);
                
                // Add XML declaration
                svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;

                const filename = this.getFileName() || 'diagram';
                const fullFilename = filename + '_' + this.getTimestamp() + '.svg';
                
                this.downloadFile(svgString, fullFilename, 'image/svg+xml');
                this.showMessage('Diagram exported as SVG: ' + fullFilename, 'success');
            } catch (error) {
                console.error('Export SVG error:', error);
                this.showMessage('Failed to export SVG: ' + error.message, 'error');
            }
        },

        /**
         * Export current view as PNG image
         */
        exportAsPNG: function() {
            try {
                const svgElement = document.querySelector('#sti_svg_canvas svg');
                if (!svgElement) {
                    this.showMessage('No diagram to export', 'error');
                    return;
                }

                // Get SVG dimensions
                const bbox = svgElement.getBoundingClientRect();
                const width = bbox.width;
                const height = bbox.height;

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width * 2; // 2x for better quality
                canvas.height = height * 2;
                const ctx = canvas.getContext('2d');
                ctx.scale(2, 2);

                // Convert SVG to image
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                const img = new Image();
                const self = this;
                
                img.onload = function() {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    URL.revokeObjectURL(url);

                    canvas.toBlob(function(blob) {
                        const filename = self.getFileName() || 'diagram';
                        const fullFilename = filename + '_' + self.getTimestamp() + '.png';
                        self.downloadBlob(blob, fullFilename);
                        self.showMessage('Diagram exported as PNG: ' + fullFilename, 'success');
                    });
                };

                img.onerror = function() {
                    URL.revokeObjectURL(url);
                    self.showMessage('Failed to export PNG', 'error');
                };

                img.src = url;
            } catch (error) {
                console.error('Export PNG error:', error);
                this.showMessage('Failed to export PNG: ' + error.message, 'error');
            }
        },

        /**
         * Export as PDF using SVG
         */
        exportAsPDF: function() {
            try {
                // Check if jsPDF is available
                if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
                    // Fallback: Open print dialog
                    this.showMessage('Opening print dialog. Use "Save as PDF" option.', 'info');
                    window.print();
                    return;
                }

                const svgElement = document.querySelector('#sti_svg_canvas svg');
                if (!svgElement) {
                    this.showMessage('No diagram to export', 'error');
                    return;
                }

                this.showMessage('PDF export: Use browser Print > Save as PDF', 'info');
                window.print();
            } catch (error) {
                console.error('Export PDF error:', error);
                this.showMessage('Failed to export PDF: ' + error.message, 'error');
            }
        },

        /**
         * Import project from local file
         */
        importFromFile: function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.xml';
            
            const self = this;
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (!file) return;

                // Validate file size (max defined in CONFIG)
                if (file.size > CONFIG.MAX_FILE_SIZE) {
                    self.showMessage('File too large. Maximum size is ' + 
                                   (CONFIG.MAX_FILE_SIZE / 1024 / 1024) + 'MB. File size: ' + 
                                   (file.size / 1024 / 1024).toFixed(2) + 'MB', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const content = event.target.result;
                        self.processImportedFile(content, file.name);
                    } catch (error) {
                        console.error('Import error:', error);
                        self.showMessage('Failed to import file: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            };
            
            input.click();
        },

        /**
         * Process imported file content
         */
        processImportedFile: function(content, filename) {
            try {
                let xmlContent;

                // Check if it's JSON or XML
                if (filename.endsWith('.json')) {
                    const data = JSON.parse(content);
                    
                    // Validate JSON structure
                    if (!this.validateImportData(data)) {
                        throw new Error('Invalid file format. The file does not contain valid STRIAN project data.');
                    }
                    
                    xmlContent = data.data || content;
                    
                    // Restore settings if available
                    if (data.settings) {
                        this.restoreSettings(data.settings);
                    }
                } else {
                    // Validate XML content
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(content, 'text/xml');
                    const parseError = xmlDoc.querySelector('parsererror');
                    
                    if (parseError) {
                        throw new Error('Invalid XML format: ' + parseError.textContent);
                    }
                    
                    xmlContent = content;
                }

                // Additional validation: check if xmlContent is not empty
                if (!xmlContent || xmlContent.trim().length === 0) {
                    throw new Error('File contains no data');
                }

                // Use the existing loadFile function if available
                if (typeof window.loadFile === 'function') {
                    window.loadFile(xmlContent);
                } else {
                    // Manual import
                    if (typeof window.deleteAll === 'function') {
                        window.deleteAll();
                    }
                    $('#Data').html(xmlContent);
                    if (typeof window.importXML === 'function') {
                        window.importXML();
                    }
                }

                this.showMessage('File imported successfully: ' + filename, 'success');
                
                // Update filename display
                const filenameDisplay = document.getElementById('filename');
                if (filenameDisplay) {
                    filenameDisplay.textContent = filename.replace(/\.(json|xml)$/, '');
                }
            } catch (error) {
                console.error('Process import error:', error);
                this.showMessage('Failed to process file: ' + error.message, 'error');
            }
        },

        /**
         * Validate imported JSON data structure
         */
        validateImportData: function(data) {
            try {
                // Check if data is an object
                if (typeof data !== 'object' || data === null) {
                    return false;
                }
                
                // Check for required fields
                if (!data.data || typeof data.data !== 'string') {
                    return false;
                }
                
                // Optional: Validate metadata
                if (data.application && data.application !== 'STRIAN') {
                    console.warn('File may not be from STRIAN application');
                }
                
                return true;
            } catch (error) {
                console.error('Validation error:', error);
                return false;
            }
        },

        /**
         * Get current settings from the application
         */
        getCurrentSettings: function() {
            const settings = {};
            
            try {
                const settingsElement = document.getElementById('Settings');
                if (settingsElement) {
                    settings.zoom = settingsElement.getAttribute('zoom');
                    settings.si = settingsElement.getAttribute('si');
                    settings.xmin = settingsElement.getAttribute('xmin');
                    settings.xmax = settingsElement.getAttribute('xmax');
                    settings.ymin = settingsElement.getAttribute('ymin');
                    settings.ymax = settingsElement.getAttribute('ymax');
                }

                // Get other settings from cookies/localStorage
                settings.paperXmin = this.getCookie('paperXmin');
                settings.paperXmax = this.getCookie('paperXmax');
                settings.paperYmin = this.getCookie('paperYmin');
                settings.paperYmax = this.getCookie('paperYmax');
            } catch (error) {
                console.error('Get settings error:', error);
            }

            return settings;
        },

        /**
         * Restore settings to the application
         */
        restoreSettings: function(settings) {
            try {
                if (settings.paperXmin) this.setCookie('paperXmin', settings.paperXmin, 365);
                if (settings.paperXmax) this.setCookie('paperXmax', settings.paperXmax, 365);
                if (settings.paperYmin) this.setCookie('paperYmin', settings.paperYmin, 365);
                if (settings.paperYmax) this.setCookie('paperYmax', settings.paperYmax, 365);
            } catch (error) {
                console.error('Restore settings error:', error);
            }
        },

        /**
         * Get embedded CSS styles for SVG export
         */
        getEmbeddedStyles: function() {
            try {
                let styles = '';
                const styleSheets = document.styleSheets;
                
                for (let i = 0; i < styleSheets.length; i++) {
                    try {
                        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                        if (rules) {
                            for (let j = 0; j < rules.length; j++) {
                                const rule = rules[j];
                                if (rule.selectorText && rule.selectorText.includes('svg')) {
                                    styles += rule.cssText + '\n';
                                }
                            }
                        }
                    } catch (e) {
                        // Cross-origin stylesheets may throw errors
                        console.warn('Could not access stylesheet:', e);
                    }
                }
                
                // Add critical inline styles
                styles += `
                    text { font-family: helvetica, sans-serif; }
                    .gridline { stroke: #c0c0c0; fill: #b0b0b0; }
                `;
                
                return styles;
            } catch (error) {
                console.error('Get styles error:', error);
                return '';
            }
        },

        /**
         * Auto-save to localStorage
         */
        autoSave: function() {
            try {
                const dataElement = document.getElementById('Data');
                if (!dataElement) return;

                const xmlContent = dataElement.innerHTML;
                const autosaveData = {
                    timestamp: new Date().toISOString(),
                    data: xmlContent,
                    settings: this.getCurrentSettings()
                };

                localStorage.setItem(CONFIG.CACHE_PREFIX + 'autosave', JSON.stringify(autosaveData));
                localStorage.setItem(CONFIG.CACHE_PREFIX + 'autosave_time', Date.now().toString());
                
                console.log('Auto-saved to localStorage');
            } catch (error) {
                console.error('Auto-save error:', error);
            }
        },

        /**
         * Restore from auto-save
         */
        restoreAutoSave: function() {
            try {
                const autosaveData = localStorage.getItem(CONFIG.CACHE_PREFIX + 'autosave');
                if (!autosaveData) {
                    return false;
                }

                const data = JSON.parse(autosaveData);
                const timestamp = new Date(data.timestamp);
                
                if (confirm('An auto-saved project was found from ' + timestamp.toLocaleString() + '. Do you want to restore it?')) {
                    this.processImportedFile(JSON.stringify(data), 'autosave.json');
                    return true;
                }
            } catch (error) {
                console.error('Restore auto-save error:', error);
            }
            return false;
        },

        /**
         * Cache settings to localStorage
         */
        cacheSettings: function(key, value) {
            try {
                localStorage.setItem(CONFIG.CACHE_PREFIX + 'setting_' + key, JSON.stringify(value));
            } catch (error) {
                console.error('Cache settings error:', error);
            }
        },

        /**
         * Get cached settings from localStorage
         */
        getCachedSettings: function(key) {
            try {
                const value = localStorage.getItem(CONFIG.CACHE_PREFIX + 'setting_' + key);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                console.error('Get cached settings error:', error);
                return null;
            }
        },

        /**
         * Enable offline mode with service worker
         */
        enableOfflineMode: function() {
            // Check if service worker is already being registered
            if (window.strianServiceWorkerRegistered) {
                this.cacheSettings('offlineMode', true);
                this.showMessage('Offline mode already enabled.', 'info');
                return;
            }

            if ('serviceWorker' in navigator) {
                window.strianServiceWorkerRegistered = true;
                navigator.serviceWorker.register(CONFIG.SERVICE_WORKER_PATH)
                    .then(registration => {
                        console.log('Service Worker registered:', registration);
                        this.cacheSettings('offlineMode', true);
                        this.showMessage('Offline mode enabled. Your work will be auto-saved locally.', 'success');
                    })
                    .catch(error => {
                        console.error('Service Worker registration failed:', error);
                        this.cacheSettings('offlineMode', true);
                        this.showMessage('Offline mode partially enabled (auto-save only).', 'info');
                    });
            } else {
                this.cacheSettings('offlineMode', true);
                this.showMessage('Service Worker not supported. Auto-save enabled.', 'info');
            }
        },

        /**
         * Helper: Download file
         */
        downloadFile: function(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            this.downloadBlob(blob, filename);
        },

        /**
         * Helper: Download blob
         */
        downloadBlob: function(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        /**
         * Helper: Get current filename
         */
        getFileName: function() {
            const filenameElement = document.getElementById('filename');
            if (filenameElement && filenameElement.textContent) {
                return filenameElement.textContent.trim();
            }
            
            const saveInput = document.getElementById('filename_save');
            if (saveInput && saveInput.value) {
                return saveInput.value.trim();
            }
            
            return null;
        },

        /**
         * Helper: Get timestamp string
         */
        getTimestamp: function() {
            const now = new Date();
            return now.getFullYear() + 
                   ('0' + (now.getMonth() + 1)).slice(-2) + 
                   ('0' + now.getDate()).slice(-2) + '_' +
                   ('0' + now.getHours()).slice(-2) + 
                   ('0' + now.getMinutes()).slice(-2) + 
                   ('0' + now.getSeconds()).slice(-2);
        },

        /**
         * Helper: Get cookie value
         */
        getCookie: function(name) {
            if (typeof window.getCookie === 'function') {
                return window.getCookie(name);
            }
            const value = '; ' + document.cookie;
            const parts = value.split('; ' + name + '=');
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        },

        /**
         * Helper: Set cookie value
         */
        setCookie: function(name, value, days) {
            if (typeof window.setCookie === 'function') {
                window.setCookie(name, value, days);
                return;
            }
            let expires = '';
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + (value || '') + expires + '; path=/';
        },

        /**
         * Helper: Show message
         */
        showMessage: function(text, type) {
            if (typeof window.message === 'function') {
                window.message(text);
            } else {
                console.log('[' + (type || 'info').toUpperCase() + ']', text);
                alert(text);
            }
        }
    };

    // Set up auto-save timer (interval defined in CONFIG)
    setInterval(function() {
        if (typeof g_Struct !== 'undefined' && g_Struct && g_Struct.bModified) {
            OfflineFeatures.autoSave();
        }
    }, CONFIG.AUTO_SAVE_INTERVAL);

    // Register service worker for offline support (only once)
    if ('serviceWorker' in navigator && !window.strianServiceWorkerRegistered) {
        window.strianServiceWorkerRegistered = true;
        window.addEventListener('load', function() {
            navigator.serviceWorker.register(CONFIG.SERVICE_WORKER_PATH)
                .then(registration => {
                    console.log('Service Worker registered successfully');
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }

    // Check for auto-save on page load
    window.addEventListener('load', function() {
        setTimeout(function() {
            // Only check if there's no active project
            const dataElement = document.getElementById('Data');
            if (dataElement && dataElement.children.length === 0) {
                OfflineFeatures.restoreAutoSave();
            }
        }, 1000);
    });

})();
