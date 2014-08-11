/************************************ FUNCTIONS APP *******************************************************/
//loginFacebookConnect
function loginFacebookConnect() {
    openFB.login(
            function(response) {
                if(response.status === 'connected') {
                    FB_LOGIN_SUCCESS = true;
                    openFB.api({
                        path: '/me',
                        success: function(data) {
                            var app_id = data.id;
                            var first_name = data.first_name;
                            var last_name = data.last_name;
                            var username = data.username;
                            var nombre = data.name;
                            var email = data.email;
                            var genero = data.gender;
                            var imagen = "";
                            
                    	    //mostramos loading
                            showLoadingCustom('Validando datos...');
                            
                            //verificamos si este usuario no se logeo con anterioridad, si no lo hizo lo creamos como nuevo, si lo hizo solo actualizamos su estado logeado a 1
                        	$.getJSON(BASE_URL_APP + 'usuarios/mobileGetUsuarioByAppId/'+app_id+'/'+email+'/'+device.uuid+'/'+device.platform+'/'+PUSH_NOTIFICATION_TOKEN, function(data) {
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
                                    if(data.email_registrado){
                                        showAlert(data.mensaje, 'Error Login', 'Aceptar');
                                    }else{
                                        //registramos los datos
                                        registrar_datos(app_id,email,'facebook',username,nombre,imagen,genero);
                                        //registrar_datos(100000614903708, "steven.alvarez.v@gmail.com",'facebook',"johsteven","Jhonny Esteban Alvarez Villazante","http://profile.ak.fbcdn.net/hprofile-ak-ash2/371352_100000614903708_518504752_q.jpg","male");
                                    }
                                }
                        	});                            
                            
                        },
                        error: errorHandler});                    
                } else {
                    showAlert('Facebook login failed: ' + response.error, 'Error Login', 'Aceptar');
                }
            }, {scope: 'email,offline_access,read_stream,publish_stream'});
}

//logoutFacebookConnect
function logoutFacebookConnect() {
    openFB.logout(
            function() {
                FB_LOGIN_SUCCESS = false;
            },
            errorHandler);
}

//shareFacebookWallPost
function shareFacebookWallPost(subtitulo, descripcion, imagen) {
    openFB.api({
        method: 'POST',
        path: '/me/feed',
        params: {
            message: descripcion
        },
        success: function() {
            showAlert("Se ha publicado tu Post!.", "Enhorabuena", "Aceptar");
        },
        error: errorHandler});
}

//shareTwitterWallPost
function shareTwitterWallPost(subtitulo, descripcion, imagen) {
    
    descripcion+= " via @QuePlanMadrid";
    
    // check if we already have access tokens
    if(localStorage.accessToken && localStorage.tokenSecret) {
    	// then directly setToken() and read the timeline
    	cb.setToken(localStorage.accessToken, localStorage.tokenSecret);
        cb.__call(
            "statuses_update",
            {"status": descripcion},
            function (reply) {
                //alert(JSON.stringify(reply));
            }
        );
    } else { // authorize the user and ask her to get the pin.
        cb.__call(
        	"oauth_requestToken",
        		{oauth_callback: "http://www.queplanmadrid.es/"},
        		function (reply) {
        			// nailed it!
           			cb.setToken(reply.oauth_token, reply.oauth_token_secret);
           			cb.__call(
        			"oauth_authorize",	{},
        			function (auth_url) {
        			    var ingreso_correcto = true;
        				window.plugins.ChildBrowser.showWebPage(auth_url, { showLocationBar : false }); // This opens the Twitter authorization / sign in page
                		window.plugins.ChildBrowser.onLocationChange = function(loc){
                			if (loc.indexOf("http://www.queplanmadrid.es/?") >= 0 && ingreso_correcto) {
                			    ingreso_correcto = false;
                                //close ChildBrowser
                                window.plugins.ChildBrowser.close();
                                
                    			// Parse the returned URL
                                var params = loc.toString().split("&");
                                var verifier = params[1].toString();
                                var parameter = verifier.split("="); //oauth_verifier
                                                                
                            	cb.__call(
                                   	"oauth_accessToken", {oauth_verifier: parameter[1]},
                                   	function (reply) {
                                	   	cb.setToken(reply.oauth_token, reply.oauth_token_secret);
                                        
                                        //almacenamos el oauth_token y oauth_token_secret en la db del dispositivo
                                       	localStorage.accessToken = reply.oauth_token;
                                       	localStorage.tokenSecret = reply.oauth_token_secret;
                                        
                                        //publicamos en twitter
                                        cb.__call(
                                            "statuses_update",
                                            {"status": descripcion},
                                            function (reply) {
                                                //alert(JSON.stringify(reply));
                                            }
                                        );
                                    }
                                );
                			}
                		}; // When the ChildBrowser URL changes we need to track that
           			}
        		);
        	}
        );
    }
}
    
/* REGISTRO TWITTER FUNCTION */
//loginTwitterConnect
function loginTwitterConnect() {
    cb.__call(
    	"oauth_requestToken",
    		{oauth_callback: "http://www.queplanmadrid.es/"},
    		function (reply) {
    			// nailed it!
       			cb.setToken(reply.oauth_token, reply.oauth_token_secret);
       			cb.__call(
    			"oauth_authorize",	{},
    			function (auth_url) {
    			    var ingreso_correcto = true;
    				window.plugins.ChildBrowser.showWebPage(auth_url, { showLocationBar : false }); // This opens the Twitter authorization / sign in page
            		window.plugins.ChildBrowser.onLocationChange = function(loc){
            			if (loc.indexOf("http://www.queplanmadrid.es/?") >= 0 && ingreso_correcto) {
            			    ingreso_correcto = false;
                            //close ChildBrowser
                            window.plugins.ChildBrowser.close();
                            
                			// Parse the returned URL
                            var params = loc.toString().split("&");
                            var verifier = params[1].toString();
                            var parameter = verifier.split("="); //oauth_verifier
                            
                    	    //mostramos loading
                            showLoadingCustom('Redireccionando, espere por favor...');
                            
                        	cb.__call(
                               	"oauth_accessToken", {oauth_verifier: parameter[1]},
                               	function (reply) {
                            	   	cb.setToken(reply.oauth_token, reply.oauth_token_secret);
                                    
                                    //almacenamos el oauth_token y oauth_token_secret en la db del dispositivo
                                   	localStorage.accessToken = reply.oauth_token;
                                   	localStorage.tokenSecret = reply.oauth_token_secret;
                                    
                                    //obtenemos el nombre y el id del usuario de su twitter
                                    var user_id = reply.user_id;
                                    var user_screen_name = reply.screen_name;
                                    var email = '';
                                    
                            	    //mostramos loading
                                    showLoadingCustom('Validando datos...');
                                    
                                    //verificamos si este usuario no se logeo con anterioridad, si no lo hizo lo creamos como nuevo, si lo hizo solo actualizamos su estado logeado a 1
                                	$.getJSON(BASE_URL_APP + 'usuarios/mobileGetUsuarioByAppId/'+user_id+'/'+email+'/'+device.uuid+'/'+device.platform+'/'+PUSH_NOTIFICATION_TOKEN, function(data) {
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
                                            if(data.email_registrado){
                                                showAlert(data.mensaje, 'Error Login', 'Aceptar');
                                            }else{
                                                //registramos los datos
                                                registrar_datos(user_id,email,'twitter',user_screen_name,"","","");                                                
                                            }
                                        }
                                	});
                                }
                            );
            			}
            		}; // When the ChildBrowser URL changes we need to track that
       			}
    		);
    	}
    );
}

/* FUNCTION GENERALES DE LA APP */
//isLogin
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

//redirectLogin
function redirectLogin(){
    $("#view").find(".ui-header").fadeIn("slow");
    $("#view").find(".ui-content").fadeIn("slow");
    $.mobile.changePage('#view');
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
    
    var numero_zonas = $(".zonas.owl-carousel").find(".owl-item").length;
    if(orientation == "landscape"){
        var owlfooter = $(".zonas.owl-carousel").data('owlCarousel');
        owlfooter.reinit({
            items : parseInt(numero_zonas),
            itemsMobile : [479,parseInt(numero_zonas)]
        });
    }else if(orientation == "portrait"){
        var owlfooter = $(".zonas.owl-carousel").data('owlCarousel');
        owlfooter.reinit({
            items : parseInt(numero_zonas),
            itemsMobile : [479,parseInt(numero_zonas)]
        });
    }
    
    $(".nav-custom.zonas").find("li").css("width","100%");
    $(".nav-custom.zonas").find(".owl-wrapper-outer").css("overflow","inherit");
}

//MOSTRAMOS EL GOOGLE MAP DEL LOCAL
function showGoogleMap(latitud, longitud) {
    var map;
    var marcador;
    if(latitud != "" && longitud != ""){
        var latlng = new google.maps.LatLng(latitud, longitud);
        var myOptions = {
          zoom: 16,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: true
        };
        map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
        marcador = new google.maps.Marker({position: latlng, map: map});
    }
}

//REALIZAMOS EL CHECK-IN
function checkIn(urlamigable){
    //volvemos a recalcular la ubicacion 
    getLocationGPS();
    
    //verficamos que este logeado porque solo si lo esta podemos dejarle que haga check-in
    if(isLogin()){
        var user = COOKIE;
        var me = user.id;
        
        showLoadingCustom('Estoy Aqu\u00ED, en progreso...');
        
    	$.getJSON(BASE_URL_APP + 'locals/mobileCheckIn/'+me+'/'+urlamigable, function(data) {
            
            if(data){
                //ocultamos loading
                $.mobile.loading( 'hide' );
                
                if(data.success){
                    var imagen = BASE_URL_APP+'img/logo_oficial.png';
                    
                    //re-escribimos la cookie con los puntos totales
                    reWriteCookie("user","puntos_acumulados",data.total_puntos_acumulados);
		    reWriteCookie("user","Puntos",data.puntos);
                    
                    //mostramos el mensaje de success y al cerrar mostramos la pantalla de compartir
                    //que puede ser de facebook o twitter
                    navigator.notification.alert(
                        data.mensaje,           // message
                        function(){
                            if(user.registrado_mediante == "facebook"){
                                /*
                                setTimeout(function(){
                                    shareFacebookWallPost(data.subtitulo, data.descripcion, imagen);
                                },500);
                                */
                            }else if(user.registrado_mediante == "twitter"){
                                setTimeout(function(){
                                    shareTwitterWallPost(data.subtitulo, data.descripcion, imagen);
                                },500);
                            }
                        },         // callback
                        "AQU\u00CD ESTOY!", // title
                        "Aceptar"               // buttonName
                    );
                    
                }else{
                    showAlert(data.mensaje, "AQU\u00CD ESTOY NO DISPONIBLE", "Aceptar");
                }
            }
    	});
    
    }else if(LOGIN_INVITADO){
        alertaInvitado();
    }
}

//REGISTRAMOS LOS DATOS CUANDO SE REALIZA EL LOGIN CON FB O TW
function registrar_datos(app_id, email, registrado_mediante, username, nombre, imagen, genero){
    $.ajax({
        data: {u_app_id:app_id, u_email:email, u_login_con:registrado_mediante, u_username:username, u_nombre:nombre, u_imagen:imagen, u_genero:genero, d_plataforma:device.platform, d_version:device.version, d_uuid:device.uuid, d_name:device.name, u_token_notificacion:PUSH_NOTIFICATION_TOKEN},
        type: "POST",
        url: BASE_URL_APP + 'usuarios/mobileNewRegistro',
        dataType: "html",
        success: function(data){
            //ocultamos el loading
            $.mobile.loading( 'hide' );
            data = $.parseJSON(data);
            
            var success = data.success;
            if(success){
                var usuario = data.usuario.Usuario;
                var usuario_id = usuario.id;
                
                //una vez creado guardamos en cookies su datos importantes
                createCookie("user", JSON.stringify(usuario), 365);
                
                //una vez registrado los datos, mandamos a la home
                $.mobile.changePage('#home');
            }else{
                showAlert('Ha ocurrido un error al momento de registrarse!, por favor intente de nuevo', 'Error', 'Aceptar');
            }
        },
        beforeSend : function(){
            //mostramos loading
            showLoadingCustom('Guardando datos...');
        }
    });
}

//Comprar recompensa
function comprarRecompensa(local_id, recompensa_id){
    //verficamos que este logeado porque solo si lo esta podemos dejarle que haga la compra de la recompensa
    if(isLogin()){
        var user = COOKIE;
        var me = user.id;
        
        showLoadingCustom('Compra de recompensa, en progreso...');
        
    	$.getJSON(BASE_URL_APP + 'recompensas/mobileComprarRecompensa/'+me+'/'+local_id+'/'+recompensa_id, function(data) {
            
            if(data){
                //ocultamos loading
                $.mobile.loading( 'hide' );
                
                if(data.success){
                    var imagen = BASE_URL_APP+'img/logo_oficial.png';
                    
                    //re-escribimos la cookie con los puntos restantes
                    reWriteCookie("user","puntos_acumulados",data.total_puntos_restantes);
                    reWriteCookie("user","Puntos",data.puntos);
                    
                    //mostramos el mensaje de success y al cerrar mostramos la pantalla de compartir
                    //que puede ser de facebook o twitter
                    navigator.notification.alert(
                        data.mensaje,           // message
                        function(){
                            if(user.registrado_mediante == "facebook"){
                                /*
                                setTimeout(function(){
                                    shareFacebookWallPost(data.subtitulo, data.descripcion, imagen);
                                },500);
                                */
                            }else if(user.registrado_mediante == "twitter"){
                                setTimeout(function(){
                                    shareTwitterWallPost(data.subtitulo, data.descripcion, imagen);
                                },500);
                            }
                        },         // callback
                        "Compra Realizada!",    // title
                        "Aceptar"               // buttonName
                    );
                    
                }else{
                    showAlert(data.mensaje, "Compra no disponible", "Aceptar");
                }
            }
    	});
    
    }else if(LOGIN_INVITADO){
        alertaInvitado();
    }
}

//logout
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
    }else if(LOGIN_INVITADO){
        alertaInvitado();
    }
}

//mobileCheckDistance
function mobileCheckDistance(){
    //volvemos a recalcular la ubicacion 
    getLocationGPS();
        
    if(isLogin()){
        var user = COOKIE;
        var app_id = user.app_id;
        
        //verificamos si esta a distancia para que se le envie una alerta automatica
    	$.getJSON(BASE_URL_APP + 'locals/mobileCheckDistance/'+app_id+'/'+LATITUDE+"/"+LONGITUDE, function(data) {
    	   //respuesta
    	   if(data){
    	       //alert(JSON.stringify(data))
    	       //console.log(data);
    	   }
        });
    }
}

//verificamos si hay notificaciones pendiente de mostrar
function verifyNotification(){
    //si tiene una notificacion pendiente la mostramos
    if(HAVE_NOTIFICATION){
        setTimeout(function(){
            showNotification(EVENT, TYPE_NOTIFICATION);
        },800);
        HAVE_NOTIFICATION = false;
    }
}

//showNotification
function showNotification(event, type){
    var message = type == "android" ? event.message : event.alert;
    var seccion = type == "android" ? event.payload.seccion : event.seccion;
    var seccion_id = type == "android" ? event.payload.seccion_id : event.seccion_id;
    
    navigator.notification.alert(
        message,
        function(){
            redirectToPage(seccion, seccion_id);
        },
        "Alert",
        "Aceptar"
    );
}

//redirectToPage
function redirectToPage(seccion, id){
    var page = "";
    if(seccion == "local"){
        page = "#guia"
        if(id != ""){
            page = "local_descripcion.html?id="+id;
        }        
    }else if(seccion == "plan"){
        page = "planes.html";
        if(id != ""){
            page = "plan_descripcion.html?id="+id;
        }
    }else if(seccion == "recompensa"){
        page = "#recompesas";
        if(id != ""){
            page = "recompensa_descripcion.html?id="+id;
        }
    }
    
    if(seccion != ""){
        setTimeout(function(){
            $.mobile.changePage(page);
        },400);
    }else{
        //TODO
    }
}

function loginInvitado(){
    LOGIN_INVITADO = true;
    $.mobile.changePage('#ciudades');
}

function goHome(ciudad_id){
    CIUDAD_ID = ciudad_id;
    
    //se guarda la ciudad
    if(isLogin()){
        var user = COOKIE;
        var me = user.id;
        
    	$.getJSON(BASE_URL_APP + 'usuarios/mobileSetCiudad/'+me+"/"+CIUDAD_ID, function(data) {
            
            if(data){
                if(data.success){
                    //showAlert(data.mensaje, "Aviso", "Aceptar");
                    //re-escribimos la cookie con la nueva ciudad
                    reWriteCookie("user","ciudad_id",data.ciudad_id);
                }else{
                    //showAlert(data.mensaje, "Error", "Aceptar");
                }
            }
    	});
    }
    
    $.mobile.changePage('#home');
}

function alertaInvitado(){
    navigator.notification.alert(
        "Hemos detectado que est\u00E1s navegando como invitado, para ingresar a esta secci\u00F3n debes hacer login",           // message
        function(){
            $.mobile.changePage('#view');
        },         // callback
        "INVITADO", // title
        "Aceptar"               // buttonName
    );
}

//REGISTRAMOS LOS DATOS CUANDO SE REALIZA EL REGISTRO CON EMAL
function registrar_email(container, email, password){
    $.ajax({
        data: {u_email:email, u_password:password, u_login_con:'email', d_plataforma:device.platform, d_version:device.version, d_uuid:device.uuid, d_name:device.name, u_token_notificacion:PUSH_NOTIFICATION_TOKEN},
        type: "POST",
        url: BASE_URL_APP + 'usuarios/mobileNewRegistro',
        dataType: "html",
        success: function(data){
            //ocultamos el loading
            $.mobile.loading( 'hide' );
            data = $.parseJSON(data);
            
            var success = data.success;
            if(success){
                container.find(".codigovalidacion").show();
                container.find(".registrarse").hide();
                showAlert(data.mensaje, 'Aviso', 'Aceptar');
            }else{
                showAlert(data.mensaje, 'Error', 'Aceptar');
            }
        },
        beforeSend : function(){
            //mostramos loading
            showLoadingCustom('Guardando datos...');
        }
    });
}

//LOGIN PARA EL REGISTRO POR EMAIL
function login_email(container, formulario){
    $.ajax({
        data: formulario.serialize(), 
        type: "POST",
        url: BASE_URL_APP + 'usuarios/mobileLogin',
        dataType: "html",
        success: function(data){
            //ocultamos el loading
            $.mobile.loading( 'hide' );
            data = $.parseJSON(data);
            
            var success = data.success;
            var validado = data.validado;
            if(success && validado){
    	        var usuario = data.usuario.Usuario;
                //guardamos los datos en la COOKIE
    	        createCookie("user", JSON.stringify(usuario), 365);
                //mandamos directo al home si es que la cookie se creo correctamente
                if(isLogin()){
                    document.getElementById("form_registro_email").reset();
                    container.find(".registrarse").hide();
                    container.find(".codigovalidacion").hide();
                    $.mobile.changePage('#home');
                }
            }else{
                if(success == true && validado == false){
                    container.find(".codigovalidacion").show();
                    container.find(".registrarse").hide();
                    if(data.codigo_validacion != ""){
                        showAlert("El c\u00F3digo de confirmaci\u00F3n, que introdujo es err\u00F3neo. Por favor verifique o ingrese nuevamente el c\u00F3digo de confirmaci\u00F3n.", 'Aviso', 'Aceptar');
                    }else{
                        showAlert(data.mensaje, 'Aviso', 'Aceptar');
                    }
                }else{
                    showAlert(data.mensaje, 'Error', 'Aceptar');
                }
            }
        },
        beforeSend : function(){
            //mostramos loading
            showLoadingCustom('Validando datos...');
        }
    });
}

//Pagar Recompensa
function pagar_recompensa(id){
    navigator.notification.confirm(
        "\u00BFSeguro que quieres VALIDAR? S\u00F3lo el responsable del local puede hacer este proceso. Si validas sin estar en el local perder\u00E1s tu recompensa.", // message
        function(buttonIndex){
            //1:aceptar,2:cancelar
            if(buttonIndex == 1){
                showLoadingCustom('Espere por favor...');
                
            	$.getJSON(BASE_URL_APP + 'usuarios_recompensas/mobileSetPagado/'+id, function(data) {
                    
                    if(data){
                        //ocultamos loading
                        $.mobile.loading( 'hide' );
                        
                        if(data.success){
                            var element = $("#"+id+".validar_recompensa")
                            element.hide();
                            element.parent().parent().find(".ui-icon-arrow-r").css("top","50%");
                            showAlert(data.mensaje, "Aviso", "Aceptar");
                        }else{
                            showAlert(data.mensaje, "Error", "Aceptar");
                        }
                    }
            	});
            }
        },            // callback to invoke with index of button pressed
    'Validar Recompensa',           // title
    'Aceptar,Cancelar'         // buttonLabels
    );
}