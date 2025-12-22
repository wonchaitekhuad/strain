/**
 * Offline Handler for STRIAN Structural Analysis
 * Provides graceful fallbacks when external resources are unavailable
 */

(function() {
    'use strict';

    // Global offline detection state
    window.STRIAN_OFFLINE_MODE = false;

    /**
     * Check if the application is running offline
     * @returns {boolean} true if offline, false otherwise
     */
    function isOffline() {
        // Check browser's navigator.onLine property
        if (typeof navigator.onLine !== 'undefined') {
            return !navigator.onLine;
        }
        return false;
    }

    /**
     * Test network connectivity by attempting to fetch a small resource
     * @param {function} callback - Called with true if online, false if offline
     */
    function testConnectivity(callback) {
        if (isOffline()) {
            callback(false);
            return;
        }

        // Try to fetch a small image with a timeout
        var img = new Image();
        var timeout = setTimeout(function() {
            img.src = '';  // Cancel the request
            callback(false);
        }, 3000);  // 3 second timeout

        img.onload = function() {
            clearTimeout(timeout);
            callback(true);
        };

        img.onerror = function() {
            clearTimeout(timeout);
            callback(false);
        };

        // Try to load a small favicon (should be cached)
        img.src = 'images/StrianIcon_Transp_48x48.ico?' + Date.now();
    }

    /**
     * Gracefully handle failed external resource loads
     */
    function handleResourceError(resourceType, error) {
        console.warn('[STRIAN Offline] ' + resourceType + ' unavailable:', error);
        
        // Show user notification if this is the first offline resource
        if (!window.STRIAN_OFFLINE_MODE) {
            window.STRIAN_OFFLINE_MODE = true;
            showOfflineNotification();
        }
    }

    /**
     * Show a notification that the app is running in offline mode
     */
    function showOfflineNotification() {
        // Check if message() function exists (from main app)
        if (typeof message === 'function') {
            message('Running in offline mode - cloud features unavailable');
        } else {
            console.info('[STRIAN] Running in offline mode - some features may be unavailable');
        }
    }

    /**
     * Wrap HTTP requests with offline detection
     * @param {function} originalFunc - Original HTTP function to wrap
     * @returns {function} Wrapped function with offline handling
     */
    function wrapHttpFunction(originalFunc, functionName) {
        return function() {
            if (window.STRIAN_OFFLINE_MODE || isOffline()) {
                console.warn('[STRIAN Offline] Skipping ' + functionName + ' - offline mode active');
                return;
            }
            
            try {
                return originalFunc.apply(this, arguments);
            } catch (e) {
                handleResourceError(functionName, e);
            }
        };
    }

    /**
     * Override the httpCloud function to handle offline scenarios
     */
    function overrideCloudFunctions() {
        // Wait for httpCloud to be defined
        if (typeof window.httpCloud !== 'undefined') {
            var originalHttpCloud = window.httpCloud;
            window.httpCloud = function(action, param) {
                if (window.STRIAN_OFFLINE_MODE || isOffline()) {
                    console.warn('[STRIAN Offline] Cloud operation "' + action + '" unavailable offline');
                    if (typeof message === 'function') {
                        message('Cloud storage unavailable in offline mode');
                    }
                    return;
                }
                
                // Try the original function with error handling
                try {
                    return originalHttpCloud.apply(this, arguments);
                } catch (e) {
                    handleResourceError('Cloud Storage', e);
                    if (typeof message === 'function') {
                        message('Cloud storage failed - check connection');
                    }
                }
            };
        }
    }

    /**
     * Stub out analytics functions when offline
     */
    function handleAnalyticsOffline() {
        // Check if StatCounter is available
        if (typeof _statcounter === 'undefined' || window.STRIAN_OFFLINE_MODE) {
            // Create a stub _statcounter object if it doesn't exist
            if (typeof _statcounter === 'undefined') {
                window._statcounter = {
                    record_pageview: function() {
                        console.log('[STRIAN Offline] Analytics disabled in offline mode');
                    },
                    record_click: function() {},
                    get_visitor_id: function() { return 'offline-mode'; },
                    version: function() { return 'offline'; }
                };
            }
        }
    }

    /**
     * Initialize offline handling when DOM is ready
     */
    function init() {
        // Initial connectivity test
        testConnectivity(function(online) {
            if (!online) {
                window.STRIAN_OFFLINE_MODE = true;
                showOfflineNotification();
                handleAnalyticsOffline();
            }
        });

        // Listen for online/offline events
        if (typeof window.addEventListener !== 'undefined') {
            window.addEventListener('online', function() {
                console.log('[STRIAN] Connection restored - online mode');
                window.STRIAN_OFFLINE_MODE = false;
                if (typeof message === 'function') {
                    message('Connection restored');
                }
            });

            window.addEventListener('offline', function() {
                console.log('[STRIAN] Connection lost - offline mode');
                window.STRIAN_OFFLINE_MODE = true;
                showOfflineNotification();
                handleAnalyticsOffline();
            });
        }

        // Override cloud functions after a short delay to ensure they're loaded
        setTimeout(overrideCloudFunctions, 500);
    }

    // Export utilities for external use
    window.STRIAN_Offline = {
        isOffline: function() {
            return window.STRIAN_OFFLINE_MODE || isOffline();
        },
        testConnectivity: testConnectivity,
        handleResourceError: handleResourceError
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
