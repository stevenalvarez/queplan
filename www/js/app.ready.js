/************************************ GLOBAL VARIABLES *******************************************************/
var FB_LOGIN_SUCCESS = false;
var TW_LOGIN_SUCCESS = false;
var COOKIE = '';
var REDIREC_TO = '';
var LATITUDE = 0;
var LONGITUDE = 0;

//Twitter Codebird
var cb = new Codebird; // we will require this everywhere

var consumer_key = 'pPrzITObRT4z0VoBAtag'; //YOUR Twitter CONSUMER_KEY
var consumer_secret = '1L8V3qJwdDocLD653uYhgxU5TtIm45pdAhyE022EBLw'; //// YOUR Twitter CONSUMER_SECRET

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
				appId : "537875786305519",
				nativeInterface : CDV.FB,
				useCachedDialogs : false
			});
			document.getElementById('data_loading_fb').innerHTML = "FB inicializado...";
		} catch (e) {
		      console.log("Error al inicializar con facebook");
		}
        
        //Inicializamos el api de twitter
        cb.setConsumerKey(consumer_key, consumer_secret);
    }
};