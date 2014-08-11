/************************************ GLOBAL VARIABLES *******************************************************/
var FB_LOGIN_SUCCESS = false;
var TW_LOGIN_SUCCESS = false;
var APP_INITIALIZED = false;
var COOKIE = '';
var REDIREC_TO = '';
var LATITUDE = 0;
var LONGITUDE = 0;
var PUSH_NOTIFICATION_REGISTER = '';
var PUSH_NOTIFICATION_TOKEN = 0;
var INTERVAL;
var LOGIN_INVITADO = false;
var CIUDAD_ID = 0; //NADA;

/* notificacion */
var HAVE_NOTIFICATION = false;
var TYPE_NOTIFICATION = '';
var EVENT = '';

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
        //pause
        document.addEventListener("pause", this.onPause, false);
        //resume
        document.addEventListener("resume", this.onResume, false);        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //Hide the statusbar
        StatusBar.hide();
                
        //Inicializamos el api de facebook
        openFB.init({appId: '537875786305519'});
        
        //Inicializamos el api de twitter
        cb.setConsumerKey(consumer_key, consumer_secret);
        
        //Iniciamos el intervalo de mostrar la notificaion local
        this.initIntervalNotificacion();
        
        //Inicializamos el pushNotification
        var pushNotification = window.plugins.pushNotification;
        if (device.platform == 'android' || device.platform == 'Android') {
            //alert("Register called android");
            pushNotification.register(this.successHandler, this.errorHandler,{"senderID":"629734064389","ecb":"app.onNotificationGCM"});
        }
        else {
            //alert("Register called ios");
            pushNotification.register(this.tokenHandler,this.errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"app.onNotificationAPN"});
        }
    },
    // result contains any message sent from the plugin call
    successHandler: function(result) {
        //console.log("Regid " + result);
        //alert('Callback Success! Result = '+result);
    },
    errorHandler:function(error) {
        alert(error);
    },
    tokenHandler:function(result) {
        PUSH_NOTIFICATION_REGISTER = 'ios';
        
        //solo si no se lleno antes con el token llenamos, porque viene otro tipo de mensajes igual
        if(PUSH_NOTIFICATION_TOKEN == 0){
            PUSH_NOTIFICATION_TOKEN = result;
            //alert(PUSH_NOTIFICATION_TOKEN);
            //mandamos a guardar el token para las notificaciones solo si no se guardo antes
            if(!APP_INITIALIZED){
                getValidarDeviceUuid("view", device.uuid, PUSH_NOTIFICATION_TOKEN);
            }
        }
        //console.log("Regid " + result);
        //alert('Callback Success! Result = '+result);
    },    
    onNotificationGCM: function(e) {
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    PUSH_NOTIFICATION_REGISTER = 'android';
                    PUSH_NOTIFICATION_TOKEN = e.regid;
                    //console.log("Regid " + e.regid);
                    //alert('registration id = '+e.regid);
                    
                    //mandamos a guardar el token para las notificaciones solo si no se guardo antes
                    if(!APP_INITIALIZED){
                        getValidarDeviceUuid("view", device.uuid, PUSH_NOTIFICATION_TOKEN);
                    }
                }
            break;
 
            case 'message':
              // this is the actual push notification. its format depends on the data model from the push server
              //alert('message = '+e.message+' msgcnt = '+e.msgcnt);
                if(APP_INITIALIZED){
                    showNotification(e,'android');
                }else{
                    HAVE_NOTIFICATION = true;
                    TYPE_NOTIFICATION = 'android';
                    EVENT = e;
                }
            break;
 
            case 'error':
                alert('GCM error = '+e.msg);
            break;
 
            default:
                alert('An unknown GCM event has occurred');
            break;
        }
    },
    onNotificationAPN: function(event) {
        if (event.alert) {
            if(APP_INITIALIZED){
                showNotification(event,'ios');
            }else{
                HAVE_NOTIFICATION = true;
                TYPE_NOTIFICATION = 'ios';
                EVENT = event;
            }
        }
        /*
        if (event.badge) {
            window.plugins.pushNotification.setApplicationIconBadgeNumber(this.successHandler, this.errorHandler, event.badge);
        }
        if (event.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }
        */
    },
    onPause: function(){
        app.stopIntervalNotificacion();
    },
    onResume: function(){
        app.initIntervalNotificacion();
    },    
    initIntervalNotificacion: function(){
        INTERVAL = setInterval(function(){
            mobileCheckDistance();
        },30000); // 300000 - 5min, 30000 - 30seg
    },
    stopIntervalNotificacion: function(){
        clearInterval(INTERVAL);
    },
    scan: function() {
        if(isLogin()){
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");
            scanner.scan( function (result) {
                if(result.format == "QR_CODE"){
                    if(result.text != ""){
                        var params = (result.text).toString().split("/");
                        var urlamigable = params[params.length-1].toString();
                        //Mandamos al checkIn
                        checkIn(urlamigable);
                    }else{
                        showAlert("Scanner failed, please try again.","Error","Aceptar");
                    }
                }else if(result.cancelled){
                    showAlert("Scanner Cancelled.","Error","Aceptar");
                }
            }, function (error) {
                alert("Scanning failed: ", error);
            } );
        }else if(LOGIN_INVITADO){
            alertaInvitado();
        }
    }
};