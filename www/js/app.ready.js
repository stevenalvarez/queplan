/************************************ GLOBAL VARIABLES *******************************************************/
var FB_LOGIN_SUCCESS = false;
var TW_LOGIN_SUCCESS = false;
var COOKIE = '';
var REDIREC_TO = '';
var LATITUDE = 0;
var LONGITUDE = 0;

//Twitter
var oauth; // Holds out oAuth request
var requestParams; // Specific request params

var consumer_key = '5MbWg9ZfT2W2wcDzyT8Q'; //YOUR Twitter CONSUMER_KEY
var consumer_secret = 'PRpVXyyaDmMiIGBX5Q2dUntNaLSyBWwQuoh78G9H6I'; //// YOUR Twitter CONSUMER_SECRET
var callback = 'http://www.patrocinalos.com/registro/deportistas';  //// YOUR CALLBACK URL

var options = { 
            consumerKey: consumer_key, // REPLACE WITH YOUR CONSUMER_KEY
            consumerSecret: consumer_secret, // REPLACE WITH YOUR CONSUMER_SECRET
            callbackUrl: callback }; // YOUR URL 
            
var twitterKey = "twttrKey"; // what we will store our twitter user information in

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //Inicializamos el api de facebook
        try {
			//console.log('Device is ready!	Make sure you set your app_id below this alert.');
			FB.init({
				appId : "582928678420559",
				nativeInterface : CDV.FB,
				useCachedDialogs : false
			});
			document.getElementById('data_loading_fb').innerHTML = "FB inicializado...";
		} catch (e) {
		      console.log("Error al inicializar con facebook");
		}
    }
};