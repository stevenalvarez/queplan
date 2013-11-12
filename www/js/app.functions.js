/************************************ FUNCTIONS APP *******************************************************/

/* REGISTRO FACEBOOK FUNCTION */
//getLoginStatus
function getLoginStatus() {
    var connected = false;
    FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
            connected = true;
        }
    });
    
    return connected;
}

//loginFacebookConnect
function loginFacebookConnect() {
    if(FB_LOGIN_SUCCESS || getLoginStatus()){
        showRegistroSocial("facebook");
    }else{
    	FB.login(function(response) {
    		if (response.authResponse) {
    		  
                FB_LOGIN_SUCCESS = true;
                
                //llenamos los datos
                FB.api('/me', {
                    fields: 'id, name, first_name, last_name, username, email, picture, gender'
                },function(response) {
                    if (response.error) { 
                       showAlert('get user datas failed ' + JSON.stringify(response.error));
                    }else{
                        var user = response;
                        var app_id = user.id;
                        var first_name = user.first_name;
                        var last_name = user.last_name;
                        var username = user.username;
                        var nombre = user.name;
                        var email = user.email;
                        var genero = user.gender;
                        var imagen = user.picture.data.url;
                        
                	    //mostramos loading
                        showLoadingCustom('Validando datos...');
                        
                        //verificamos si este usuario no se logeo con anterioridad, si lo hizo, lo creamos como nuevo, si lo hizo solo actualizamos su estado logeado a 1
                    	$.getJSON(BASE_URL_APP + 'usuarios/mobileGetUsuarioByAppId/'+app_id, function(data) {
                    	   
                            //ocultamos el loading
                            $.mobile.loading( 'hide' );
                    	    if(data.success){
                    	        var usuario = data.usuario.Usuario;
                                //guardamos los datos en la COOKIE
                    	        createCookie("user", JSON.stringify(usuario), 365);
                                //mandamos directo al home si es que la cookie se creo correctamente
                                if(isLogin()){
                                    $.mobile.changePage('#home');
                                }
                            }else{
                                //registramos los datos
                                registrar_datos(app_id,email,'facebook',username,nombre,imagen,genero);
                                //registrar_datos(100000614903708, "steven.alvarez.v@gmail.com",'facebook',"johsteven","Jhonny Esteban Alvarez Villazante","http://profile.ak.fbcdn.net/hprofile-ak-ash2/371352_100000614903708_518504752_q.jpg","male");
                            }
                    	});
                    }
                });
                
    		} else {
                showAlert("User cancelled login or did not fully authorize.", 'Error Login', 'Aceptar');
    		}
    	}, {
    		scope : "email,offline_access,publish_stream"
    	});
    }
}

//logoutFacebookConnect
function logoutFacebookConnect() {
    FB.logout(function(response) {
        //alert('logged out');
    });
}

//compartiFacebookWallPost
//comparte en facebook el proyecto del deportista
function compartiFacebookWallPost(usuario_title, proyecto_title, proyecto_actividad_patrocinio, proyecto_imagen, enlace_proyecto) {
    var params = {
        method: 'feed',
        name: usuario_title + ' - ' + proyecto_title,
        link: enlace_proyecto,
        picture: proyecto_imagen,
        caption: 'www.patrocinalos.com',
        description: proyecto_actividad_patrocinio
    };
    FB.ui(params, function(obj) { 
        showAlert("Haz compartido con exito el proyecto!.", "Enhorabuena", "Aceptar");
    });
}

//loginTwitter
function loginTwitter() {
    if(TW_LOGIN_SUCCESS){
        showRegistroSocial("twitter");
    }else{
        Twitter.init();
    }
}

function showRegistroSocial(red_social){
    $.mobile.changePage('#home');
}

function isLogin(){
    var res = false;
    var cookie_user = $.parseJSON(readCookie("user"));
    if(cookie_user !== null){
        res = true;
        COOKIE = cookie_user;
    }else{
        REDIREC_TO = window.location.href;
    }
    return res;
}

function redirectLogin(){
    $.mobile.changePage('#view', {data : { 'logout' : 'true' }, transition: "fade", changeHash: false});
}

//Abrimos el enlace en un navegador del sistema (IOS|ANDROID)
//target: the target to load the URL in (String) (Optional, Default: "_self")
//_self - opens in the Cordova WebView if url is in the white-list, else it opens in the InAppBrowser 
//_blank - always open in the InAppBrowser 
//_system - always open in the system web browser/
function openOnWindow(element, target){
	element.find('a').bind("click", function() {
	   window.open($(this).attr('href') , target );
	   return false;
	});
}

//fixea el error que hay cuando se selecciona un elemento del selector
function fixedSelector(form_id, element_selector){
    var selector_deporte = jQuery('#'+form_id).find("#" +element_selector);
    var opcion_selected = selector_deporte.find("option:selected").html();
    var element = selector_deporte.prev(".ui-btn-inner").find(".ui-btn-text").find("span");
    element.removeClass()
    element.addClass("valid")
    element.text(opcion_selected);
    element.show();
}

/*EVENTOS QUE SE LANZAN AL MOMENTO DE CAMBIAR DE LANSCAPE A PORTRAIT O VICEVERSA*/
/*orientation:puede ser lanscape o portrait*/
/*page_id:el id de la pagina actual en el que se realizo el movimiento*/
function callbackOrientationChange(orientation, page_id){
    if(orientation == "landscape" && page_id == "planes"){
        var owl = $(".owl-carousel").data('owlCarousel');
        owl.reinit({
            items : 6,
            itemsMobile : [479,6]
        });
    }
}

/*borramos los datos de la cookie*/
function logout(){
    if(isLogin()){
        navigator.notification.confirm(
            "Estas seguro que quieres salir?", // message
            function(buttonIndex){
                //1:aceptar,2:cancelar
                if(buttonIndex == 1){
                    showLoadingCustom('Espere por favor...');
                    
                    var user = COOKIE;
                    var me = user.id;
                    
                	$.getJSON(BASE_URL_APP + 'usuarios/mobileLogout/'+me, function(data) {
                        
                        if(data){
                            //ocultamos loading
                            $.mobile.loading( 'hide' );
                            
                            if(data.success){
                                //logout de fb y tw
                                logoutFacebookConnect();
                                
                                eraseCookie("user");
                                redirectLogin();
                            }else{
                                showAlert(data.mensaje, "Error", "Aceptar");
                            }
                        }
                	});
                }
            },            // callback to invoke with index of button pressed
        'Salir',           // title
        'Aceptar,Cancelar'         // buttonLabels
        );
    }
}