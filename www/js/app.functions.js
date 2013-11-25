/************************************ FUNCTIONS APP *******************************************************/

/* REGISTRO FACEBOOK FUNCTION */
//getLoginStatusFacebook
function getLoginStatusFacebook() {
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
                    
                    //verificamos si este usuario no se logeo con anterioridad, si no lo hizo lo creamos como nuevo, si lo hizo solo actualizamos su estado logeado a 1
                	$.getJSON(BASE_URL_APP + 'usuarios/mobileGetUsuarioByAppId/'+app_id+'/'+device.uuid+'/'+device.platform+'/'+PUSH_NOTIFICATION_TOKEN, function(data) {
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

//logoutFacebookConnect
function logoutFacebookConnect() {
    FB.logout(function(response) {
        FB_LOGIN_SUCCESS = false;
    });
}

//shareFacebookWallPost
function shareFacebookWallPost(subtitulo, descripcion, imagen) {
    var params = {
        method: 'feed',
        name: "QuePlan?",
        caption: subtitulo,
        description: descripcion,
        link: 'http://www.queplanmadrid.es/',
        picture: imagen,
        actions: [
            { name: 'QuePlan?', link: 'http://www.queplanmadrid.es/' }
        ],
        user_message_prompt: 'Comparte tu opinion sobre QuePlan?'
    };
    FB.ui(params, function(response) {
        if (response && response.post_id) {
            showAlert("Se ha publicado tu Post!.", "Enhorabuena", "Aceptar");
        } else {
            showAlert("Lo sentimos no se publico tu Post!.", "Error", "Aceptar");
        }
    });
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
        				window.plugins.childBrowser.showWebPage(auth_url, { showLocationBar : false }); // This opens the Twitter authorization / sign in page
                		window.plugins.childBrowser.onLocationChange = function(loc){
                			if (loc.indexOf("http://www.queplanmadrid.es/?") >= 0 && ingreso_correcto) {
                			    ingreso_correcto = false;
                                //close childBrowser
                                window.plugins.childBrowser.close();
                                
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
    				window.plugins.childBrowser.showWebPage(auth_url, { showLocationBar : false }); // This opens the Twitter authorization / sign in page
            		window.plugins.childBrowser.onLocationChange = function(loc){
            			if (loc.indexOf("http://www.queplanmadrid.es/?") >= 0 && ingreso_correcto) {
            			    ingreso_correcto = false;
                            //close childBrowser
                            window.plugins.childBrowser.close();
                            
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
                                    
                            	    //mostramos loading
                                    showLoadingCustom('Validando datos...');
                                    
                                    //verificamos si este usuario no se logeo con anterioridad, si no lo hizo lo creamos como nuevo, si lo hizo solo actualizamos su estado logeado a 1
                                	$.getJSON(BASE_URL_APP + 'usuarios/mobileGetUsuarioByAppId/'+user_id+'/'+device.uuid+'/'+device.platform+'/'+PUSH_NOTIFICATION_TOKEN, function(data) {
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
                                            registrar_datos(user_id,"",'twitter',user_screen_name,"","","");
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
function checkIn(local_id){
    //volvemos a recalcular la ubicacion 
    getLocationGPS();
    
    //verficamos que este logeado porque solo si lo esta podemos dejarle que haga check-in
    if(isLogin()){
        var user = COOKIE;
        var me = user.id;
        
        showLoadingCustom('Estoy Aqu\u00ED, en progreso...');
        
    	$.getJSON(BASE_URL_APP + 'locals/mobileCheckIn/'+me+'/'+local_id+'/'+LATITUDE+"/"+LONGITUDE, function(data) {
            
            if(data){
                //ocultamos loading
                $.mobile.loading( 'hide' );
                
                if(data.success){
                    var imagen = BASE_URL_APP+'img/logo_oficial.png';
                    
                    //re-escribimos la cookie con los puntos totales
                    reWriteCookie("user","puntos_acumulados",data.total_puntos_acumulados);
                    
                    //mostramos el mensaje de success y al cerrar mostramos la pantalla de compartir
                    //que puede ser de facebook o twitter
                    navigator.notification.alert(
                        data.mensaje,           // message
                        function(){
                            if(user.registrado_mediante == "facebook"){
                                setTimeout(function(){
                                    shareFacebookWallPost(data.subtitulo, data.descripcion, imagen);
                                },500);
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
    
    }else{
        showAlert("Debes de conectarte con facebook o twitter para realizar Estoy aqu\u00ED","Error","Aceptar");
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
                $.mobile.changePage('#home', {transition: "fade"});
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
                    
                    //mostramos el mensaje de success y al cerrar mostramos la pantalla de compartir
                    //que puede ser de facebook o twitter
                    navigator.notification.alert(
                        data.mensaje,           // message
                        function(){
                            if(user.registrado_mediante == "facebook"){
                                setTimeout(function(){
                                    shareFacebookWallPost(data.subtitulo, data.descripcion, imagen);
                                },500);
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
    
    }else{
        showAlert("Debes de conectarte con facebook o twitter para realizar la compra.","Error","Aceptar");
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
    }
}

//notificaion local
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
    	       alert("asdf");
    	       console.log(data);
    	   }
        });
    }
}