// This is your Telerik Backend Services API key.
var bsApiKey = 'BACKEND_SERVICES_API_KEY';

// The URI scheme for the Telerik Backend Services API
var bsScheme = 'http';

// This is your Google API project number. It is required by Google in order to enable push notifications for your Android. You do not need it for iOS.
var googleApiProjectNumber = 'GOOGLE_API_PROJECT_NUMBER';

// Set this to true in order to test push notifications in the emulator. Note, that you will not be able to actually receive 
// push notifications because we will generate fake push tokens. But you will be able to test your other push-related functionality without getting errors.
var emulatorMode = false;

var app = (function () {
    'use strict';
    
    window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
        alert(url + ":" + lineNumber + ": " + errorMsg);
        return false;
    }
    
    var onDeviceReady = function() {
        if (!bsApiKey || bsApiKey === 'BACKEND_SERVICES_API_KEY') {
            $("#messageParagraph").html("Missing API key!<br /><br />It appears that you have not filled in your Backend Services API key.<br/><br/>Please go to scripts/app/main.js and enter your Everlive API key at the beginning of the file.");
            $("#registerButton").hide();
        } else if ((!googleApiProjectNumber || googleApiProjectNumber === 'GOOGLE_API_PROJECT_NUMBER') && device.platform.toLowerCase() == "android") {
            $("#messageParagraph").html("Missing Google API Project Number!<br /><br />It appears that you have not filled in your Google API project number. It is required for push notifications on Android.<br/><br/>Please go to scripts/app/main.js and enter your Google API project number at the beginning of the file.");
            $("#registerButton").hide();
        }
    };

    document.addEventListener("deviceready", onDeviceReady, false);

    // Initialize the Backend Services SDK
    var el = new Everlive({
        apiKey: bsApiKey,
        scheme: bsScheme
    });

    var mobileApp = new kendo.mobile.Application(document.body, { transition: 'slide', layout: 'mobile-tabstrip' });

    //Login view model
    var mainViewModel = (function () {
        
        var successText = "SUCCESS!<br /><br />The device has been registered for push notifications.<br /><br />";
        
        var _onDeviceIsRegistered = function() {
            $("#registerButton").hide();
            $("#unregisterButton").show();
            $("#messageParagraph").html(successText);
        };
        
        var _onDeviceUnregistered = function() {
            $("#messageParagraph").html("Device successfully unregistered.");
            $("#registerButton").show();
            $("#unregisterButton").hide();
        };
        
        var onAndroidPushReceived = function(args) {
            alert('Android notification received: ' + JSON.stringify(args)); 
        };
        
        var onIosPushReceived = function(args) {
            alert('iOS notification received: ' + JSON.stringify(args)); 
        };
        
        var registerForPush = function() {
            var pushSettings = {
                android: {
                    senderID: googleApiProjectNumber
                },
                iOS: {
                    badge: "true",
                    sound: "true",
                    alert: "true"
                },
                notificationCallbackAndroid : onAndroidPushReceived,
                notificationCallbackIOS: onIosPushReceived,
                customParameters: {
                    Age: 21
                }
            };
            
            el.push.register(pushSettings)
                .then(
                    _onDeviceIsRegistered,
                    function(err) {
                        alert('REGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
        };
        
        var unregisterFromPush = function() {
            el.push.unregister()
                .then(
                    _onDeviceUnregistered,
                    function(err) {
                        alert('UNREGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
        };
        
        return {
            registerForPush: registerForPush,
            unregisterFromPush: unregisterFromPush
        };
    }());
    

    return {
        viewModels: {
            main: mainViewModel
        }
    };
}());