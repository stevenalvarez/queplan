/************************************ FUNCTIONS APP *******************************************************/

// REGISTRO SUCCESS
//
function success_registro(){
    $.mobile.changePage('#xxx', {transition: "slide"});
    $.mobile.loading( 'hide' );
}

// REGISTRO ERROR
//
function error_registro(msg){
    $.mobile.loading( 'hide' );
    showAlert(msg, 'Aviso', 'Aceptar');
}

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
                    fields: 'id, name, first_name, last_name, username, email, picture'
                },function(response) {
                    if (response.error) { 
                       showAlert('get user datas failed ' + JSON.stringify(response.error));
                    }else{
                        var user = response;
                        var first_name = user.first_name;
                        var last_name = user.last_name;
                        var username = user.username;
                        var email = user.email;
                        
                        //ocultamos el loading...
                        $.mobile.loading( 'hide' );
                    }
                });
                                
                //mandamos a la page
                setTimeout(function(){
                    showRegistroSocial('facebook');
                    showLoadingCustom('Cargando datos...');
                }, 10);
                
    		} else {
                showAlert("User cancelled login or did not fully authorize.", 'Error Login', 'Aceptar');
    		}
    	}, {
    		scope : "email,offline_access,publish_stream,user_birthday,user_location,user_work_history,user_about_me,user_hometown"
    	});
    }
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
    $.mobile.changePage('#view', {transition: "fade", changeHash: false});
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
    createCookie("user", "", 0);
    redirectLogin();
}