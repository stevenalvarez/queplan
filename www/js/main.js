
/************************************ BIND EVENT *******************************************************/

$(document).bind('pagebeforecreate', function(event){
    var page_id = event.target.id;
    if(page_id == "view"){
        //verificamos si el device_uuid ya esta registrado en la db
        getValidarDeviceUuid(page_id, device.uuid);
    }
});

$(document).bind('pagecreate', function(event){
    var page_id = event.target.id;
});

$(document).bind('pageinit', function(event){
    var page_id = event.target.id;
});

$(document).bind('pageshow', function(event, ui) {
    //verificamos que el usuario tenga email, sino tiene le obligamos a que si o si coloque
    if(isLogin()){
        var user = COOKIE;
        if($.trim(user.email) == ""){
            $.mobile.changePage('#mi_perfil', {transition: "fade"});
        }
    }
    
    var page_id = event.target.id;
    var page = $("#" + $.mobile.activePage.attr('id'));
    page.find(".zonas").find("a").unbind("touchstart").bind("touchstart", function(){
        $(this).parent().parent().find("a").removeClass("ui-btn-active-a");
        $(this).addClass("ui-btn-active-a");
        var zona_id = $(this).attr("href");
        zona_id = zona_id.substring(1,zona_id.length);
        
        //mostramos u ocultamos los items segun su zona
        var container_ul = page.find(".ui-listview");
        container_ul.css("opacity","0.5");
        container_ul.find("li").hide();
        container_ul.find("li.zona_"+zona_id).show();
        container_ul.animate({opacity: 1}, 500 );
        
        //borramos la clase de la categoria seleccionada
        var element_desactive = page.find(".owl-item.active");
        element_desactive.removeClass("active");
        var imagen_desactive = element_desactive.find("img");
        imagen_desactive.attr("src",BASE_URL_APP+'img/categorias/gris/' + imagen_desactive.attr("alt"));
    });
    
    //inicializamos la ubicacion 
    getLocationGPS();
});

/************************************ EVENTOS *******************************************************/

//GUIA
$('#guia').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getCategorias(page_id);
});

//PLANES
$('#planes').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    //inicializamos el carrousel slider
    getCategoriasByCarrousel(page_id);
    getPlanes(page_id);
});

//PLAN DESCRIPCION
$('#plan_descripcion').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getPlanById(page_id, getUrlVars()["id"]);
});

//LOCALES
$('#locales').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    var categoria_id = getUrlVars()["id"];
    //inicializamos el carrousel slider
    getCategoriasByCarrousel(page_id, categoria_id);
    getLocalesById(page_id, categoria_id);
});

//LOCAL DESCRIPCION
$('#local_descripcion').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getLocalById(page_id, getUrlVars()["id"]);
});

//RECOMPENSAS
$('#recompensas').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getRecompensas(page_id);
});

//RECOMPENSA DESCRIPCION
$('#recompensa_descripcion').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getRecompensaById(page_id, getUrlVars()["id"]);
});

//ESTOY AQUI
$('#estoy_aqui').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    //inicializamos el carrousel slider
    getCategoriasByCarrousel(page_id);
    getLocalesByDistance(page_id);
});

//COMO FUNCIONA
$('#como_funciona').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getComoFunciona(page_id);
});

//COMO FUNCIONA DESCRIPCION
$('#como_funciona_descripcion').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getComoFuncionaById(page_id, getUrlVars()["id"]);
});

//LOCAL GOOGLE MAP
$('#local_google_map').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    showGoogleMap(getUrlVars()["latitud"],getUrlVars()["longitud"]);
});

//QUIERO PARTICIPAR DESCRIPCION
$('#quiero_participar_descripcion').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getQuieroParticiparById(page_id, getUrlVars()["id"]);
});

//MI PERFIL
$('#mi_perfil').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getMiPerfil(page_id);
});

/************************************ FUNCTIONS *******************************************************/

//OBTENEMOS LAS CATEGORIAS
function getCategorias(parent_id) {
    var parent = $("#"+parent_id);
    var container = parent.find(".ui-controlgroup-controls");
    container.find("a.clone").remove();
    
    parent.find(".ui-content").hide();
	
    $.getJSON(BASE_URL_APP + 'categorias/mobileGetCategorias', function(data) {
        if(data){
            
            //mostramos loading
            $.mobile.loading('show');
            
    		items = data.items;
    		$.each(items, function(index, item) {
    		    var imagen = item.Categoria.imagen!=""?item.Categoria.imagen:"default.png";
                var clone = container.find('a:first').clone(true);
                clone.attr("href", "locales.html?id=" + item.Categoria.id);
                clone.find(".ui-btn-text").html(item.Categoria.title);
                clone.find(".ui-icon").css("background","url('"+BASE_URL_APP+"img/categorias/"+imagen+"')  no-repeat scroll top center transparent");
                clone.find(".ui-icon").css("background-size","35px");
                clone.find(".ui-icon").css("padding-left","5px");
                clone.find(".ui-icon").css("margin-top","-18px");
                clone.attr("lang",imagen);
                clone.css("display","block");
                clone.addClass("clone");
                
                //append container
                container.append(clone);
    		});
            
            container.promise().done(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
                
                //al momento de touch cambiamos su imagen a color rosa
                container.find("a").unbind("touchstart").bind("touchstart", function(){
                    $(this).find(".ui-icon").css("background","url('"+BASE_URL_APP+"img/categorias/rosa/"+$(this).attr("lang")+"')  no-repeat scroll top center transparent");
                    $(this).find(".ui-icon").css("background-size","35px");
                });
            });
        }
	});
}

//OBTENEMOS LAS CATEGORIAS PARA EL CARROUSEL - LOCALES
function getCategoriasByCarrousel(parent_id, categoria_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".slider_items");
    container.find('li').remove();
    container.hide();
    
    $.getJSON(BASE_URL_APP + 'categorias/mobileGetCategorias', function(data) {
        if(data){
            
    		items = data.items;
    		$.each(items, function(index, item) {
    		    var imagen = item.Categoria.imagen!=""?item.Categoria.imagen:"default.png";
            	var html='<li>'+
                        '<div class="recuadro">' +
                            '<a href="#'+item.Categoria.id+'" id="'+item.Categoria.id+'">' +
                                '<img src="'+BASE_URL_APP+'img/categorias/gris/' + imagen + '" alt="'+imagen+'" />' +
                            '</a>' +
                        '</div>' +
                        '<p>'+item.Categoria.title+'</p>' +
                '</li>';
    		    
                container.append(html);
    		});
            
            container.promise().done(function() {
                container.show();
                //iniciamos el carrousel
                container.owlCarousel({
                    pagination : false,
                    items : 4,
                    itemsMobile : [479,4],
                    responsive: false,
                });
                container.find("a").unbind("touchstart").bind("touchstart", function(){
                    var element = $(this);
                    //desactivamos el item
                    var element_desactive = container.find(".owl-item.active");
                    element_desactive.removeClass("active");
                    var imagen_desactive = element_desactive.find("img");
                    imagen_desactive.attr("src",BASE_URL_APP+'img/categorias/gris/' + imagen_desactive.attr("alt"));
                    
                    //activamos el item
                    var element_active = element.parent().parent().parent();
                    element_active.addClass("active");
                    var imagen_active = element_active.find("img");
                    imagen_active.attr("src",BASE_URL_APP+'img/categorias/' + imagen_active.attr("alt"));
                    
                    //obtenemos el id de la categoria
                    var categoria_id = element.attr("href");
                    categoria_id = categoria_id.substring(1,categoria_id.length);
                    
                    //mostramos u ocultamos los items segun a su categoria
                    var container_ul = parent.find(".ui-listview");
                    container_ul.css("opacity","0.5");
                    container_ul.find("li").hide();
                    container_ul.find("li.categoria_"+categoria_id).show();
                    container_ul.animate({opacity: 1}, 500 );
                    
                    //borramos la clase de la zona seleccionada
                    parent.find(".zonas").find("a").removeClass("ui-btn-active-a");
                });
                
                //si viene alguna categoria seleccionda marcamos esa
                if(categoria_id != undefined){
                    var element_active = container.find("a#"+categoria_id).parent().parent().parent();
                    element_active.addClass("active");
                    var imagen_active = element_active.find("img");
                    imagen_active.attr("src",BASE_URL_APP+'img/categorias/' + imagen_active.attr("alt"));
                }
            });
        }
	});
}

//OBTENEMOS LOS PLANES
function getPlanes(parent_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".ui-listview");
    container.find('li').remove();
    
    parent.find(".ui-content").hide();
    
	$.getJSON(BASE_URL_APP + 'promocions/mobileGetPlanes', function(data) {
        
        if(data.items){
            //mostramos loading
            $.mobile.loading( 'show' );
            
    		items = data.items;
            if(items.length){
        		$.each(items, function(index, item) {
                	
                    var class_categoria = 'categoria_'+item.Local.categoria_id;
                    var class_zona = 'zona_'+item.Local.zona_id;
                    var kilomentros = distance(LATITUDE,LONGITUDE,item.Local.latitud,item.Local.longitud,'K');
                    var imagen = item.Promocion.imagen!=""?item.Promocion.imagen:"default.png";
                    
                    var html='<li class="'+class_categoria+' '+class_zona+'">' +
                        '<img src="'+BASE_URL_APP+'img/promociones/thumbnails/' + imagen + '"/>' +
                        '<div class="content_recuadro">' +
                            '<div class="content_descripcion">' +
                                '<div class="ubicacion">' +
                                    '<h3 class="ui-li-heading">' +
                                        '<a href="plan_descripcion.html?id='+item.Promocion.id+'">'+item.Promocion.title+'</a>' +
                                    '</h3>' +
                                '</div>' +
                                '<div class="km">' +
                                    '<b>'+parseFloat(kilomentros).toFixed(2)+' km</b>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</li>';
        		    
                    container.append(html);
        		});
                
                //refresh
        		container.listview('refresh');
                
                container.find("li:last img").load(function() {
                    //mostramos todos los planes
                    container.find("li").show();
                    
                    //ocultamos loading
                    $.mobile.loading( 'hide' );
                    parent.find(".ui-content").fadeIn("slow");
                });
            }else{
                container.append("<li><p class='ningun_plan'>HOY NO TENEMOS NING&Uacute;N PLAN DISPONIBLE.</p></li>");
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            }
        }
	});
}

//OBTENEMOS EL PLAN SEGUN EL ID
function getPlanById(parent_id, plan_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_plan");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
    
    var nav_opciones = parent.find(".nav-opciones");
    nav_opciones.find("li:nth-child(3)").removeClass().addClass("ui-block-c");
    nav_opciones.find("li:nth-child(4)").removeClass().addClass("ui-block-d");
    nav_opciones.find("li:nth-child(5)").removeClass().addClass("ui-block-e");
    nav_opciones.find("li:nth-child(6)").removeClass().addClass("ui-block-f");
    
	$.getJSON(BASE_URL_APP + 'promocions/mobileGetPlanById/'+plan_id, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
            var promocion = data.item.Promocion;
            var promocion_fotos = data.item.PromocionsFoto;
           	$.each(promocion_fotos, function(index, promocion_foto) {
           	    var imagen = promocion_foto.imagen!=""?promocion_foto.imagen:"default.png";
           	    var mclass = ""; 
           	    if(index == 0) mclass = "m-active";
                var html='<div class="m-item '+mclass+'">' +
                    '<div data-role="navbar" data-corners="false" class="ui-navbar ui-mini" role="navigation">' + 
                        '<ul class="ui-grid-b">' + 
                            '<li class="ui-block-a">' + 
                                '<a href="#" data-slide="prev" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a ui-btn-active">' +
                                    '<span class="ui-btn-inner"><span class="ui-btn-text">previous</span></span>' +
                                '</a>' +
                            '</li>' + 
                            '<li class="ui-block-b">' +
                                '<h3>'+promocion.title+'</h3>' +
                            '</li>' +
                            '<li class="ui-block-c">' +
                                '<a href="#" data-slide="next" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a">' +
                                    '<span class="ui-btn-inner"><span class="ui-btn-text">next</span></span>' + 
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<img src="'+BASE_URL_APP+'img/promociones/' + imagen + '"/>' +
                '</div>';
                
           	    container.find(".m-carousel-inner").append(html);
                container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
            });
            
            //llenamoas los datos del plan
            parent.find(".texto_descripcion").html(promocion.descripcion);
            parent.find(".informacion").find(".from").html(promocion.fecha_ini_virtual);
            parent.find(".informacion").find(".to").html(promocion.fecha_fin_virtual);
            parent.find(".ir_al_local a").attr("href","local_descripcion.html?id="+promocion.local_id);
            parent.find("#plan_condiciones").find(".container_descripcion").html(promocion.condicion);
            parent.find("#plan_como_reservar").find(".container_descripcion").html(promocion.como_reservar);
            
            //iniciamos el carousel
            container.find(".m-carousel-inner").promise().done(function() {
                //iniciamos el carrousel
                container.carousel();
                
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS LOS LOCALES SEGUN EL ID QUE NOS PASA - LOCAL
function getLocalesById(parent_id, categoria_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".ui-listview");
    container.find('li').remove();
    
    parent.find(".ui-content").hide();
    
	$.getJSON(BASE_URL_APP + 'locals/mobileGetLocales/'+LATITUDE+"/"+LONGITUDE, function(data) {
        
        if(data.items){
            //mostramos loading
            $.mobile.loading( 'show' );
            
    		items = data.items;
            if(items.length){
        		$.each(items, function(index, item) {
                    
                    var class_categoria = 'categoria_'+item.Local.categoria_id;
                    var class_zona = 'zona_'+item.Local.zona_id;
                    
                    var imagen = item.Local.imagen!=""?item.Local.imagen : "default.png";
                    var html='<li class="'+class_categoria+' '+class_zona+'">' +
                        '<img src="'+BASE_URL_APP+'img/locales/thumbnails/' + imagen + '"/>' +
                        '<div class="content_recuadro">' +
                            '<div class="content_descripcion">' +
                                '<div class="ubicacion">' +
                                    '<h3 class="ui-li-heading">' +
                                        '<a href="local_descripcion.html?id='+item.Local.id+'">'+item.Local.title+'</a>' +
                                    '</h3>' +
                                '</div>' +
                                '<div class="km">';
                                
                                //si esta menos de 1km le mostramos la distancia en metros en la cual se encuentra
                                if(parseInt(item.Local.kilomentros) < 1){
                                    html+='<b>'+parseFloat(item.Local.metros).toFixed(2)+' m</b>';
                                }else{
                                    html+='<b>'+parseFloat(item.Local.kilomentros).toFixed(2)+' km</b>';
                                }
                                    
                                html+='</div>' +
                            '</div>' +
                        '</div>' +
                    '</li>';
        		    
                    container.append(html);
        		});
                
                //refresh
        		container.listview('refresh');
                
                container.find("li:last img").load(function() {
                    //mostramos los locales de esa categoria
                    container.find("li.categoria_"+categoria_id).show();
                    
                    //ocultamos loading
                    $.mobile.loading( 'hide' );
                    parent.find(".ui-content").fadeIn("slow");
                });
            }else{
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            }
        }
	});
}

//OBTENEMOS EL LOCAL SEGUN EL ID
function getLocalById(parent_id, local_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_local");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
    
    var nav_opciones = parent.find(".nav-opciones");
    nav_opciones.find("li:nth-child(3)").removeClass().addClass("ui-block-c");
    nav_opciones.find("li:nth-child(4)").removeClass().addClass("ui-block-d");
    nav_opciones.find("li:nth-child(5)").removeClass().addClass("ui-block-e");
    nav_opciones.find("li:nth-child(6)").removeClass().addClass("ui-block-f");
    
	$.getJSON(BASE_URL_APP + 'locals/mobileGetLocalById/'+local_id, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
            var local = data.item.Local;
            var local_fotos = data.item.LocalsFoto;
            var promocion = data.item.Promocion;
           	$.each(local_fotos, function(index, local_foto) {
           	    var imagen = local_foto.imagen!=""?local_foto.imagen:"default.png";
           	    var mclass = ""; 
           	    if(index == 0) mclass = "m-active";
                var html='<div class="m-item '+mclass+'">' +
                    '<div data-role="navbar" data-corners="false" class="ui-navbar ui-mini" role="navigation">' + 
                        '<ul class="ui-grid-b">' + 
                            '<li class="ui-block-a">' + 
                                '<a href="#" data-slide="prev" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a ui-btn-active">' +
                                    '<span class="ui-btn-inner"><span class="ui-btn-text">previous</span></span>' +
                                '</a>' +
                            '</li>' + 
                            '<li class="ui-block-b">' +
                                '<h3>'+local.title+'</h3>' +
                            '</li>' +
                            '<li class="ui-block-c">' +
                                '<a href="#" data-slide="next" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a">' +
                                    '<span class="ui-btn-inner"><span class="ui-btn-text">next</span></span>' + 
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<img src="'+BASE_URL_APP+'img/locales/' + imagen + '"/>' +
                '</div>';
                
           	    container.find(".m-carousel-inner").append(html);
                container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
            });
            
            //llenamoas los datos del local
            parent.find(".texto_descripcion").html(local.descripcion);
            var telefonos = (local.telefono).split("-");
            parent.find(".llamada span").html(local.telefono);
            parent.find(".direccion span").html(local.direccion);
            parent.find(".llamar a").attr("href","tel:"+$.trim(telefonos[0]));
            parent.find(".planes_hoy span").html(promocion.length);
            
            if(promocion.length > 0){
                //siempre sacamos el primero por mas que haiga mil
                var plan_id = promocion[0]['id'];
                parent.find(".planes_hoy a").attr("href","plan_descripcion.html?id="+plan_id);
            }
            
            //map
            parent.find(".map a").attr("href","local_google_map.html?latitud="+local.latitud+"&longitud="+local.longitud);
            //web
            if(local.web != null && local.web != ""){
                parent.find(".web a").attr("href",local.web);
                parent.find(".web a").attr("onclick", "window.open(this.href,'_system'); return false;");
            }
            //twitter
            if(local.twitter != null && local.twitter != ""){
                parent.find(".twitter a").attr("href",local.twitter);
                parent.find(".twitter a").attr("onclick", "window.open(this.href,'_system'); return false;");
            }
            //facebook
            if(local.facebook != null && local.facebook != ""){
                parent.find(".facebook a").attr("href",local.facebook);
                parent.find(".facebook a").attr("onclick", "window.open(this.href,'_system'); return false;");
            }
            
            //iniciamos el carousel
            container.find(".m-carousel-inner").promise().done(function() {
                //iniciamos el carrousel
                container.carousel();
                
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS LOS LOCALES SEGUN A LA DISTACIA EN LA QUE SE ENCUENTRA EL USUARIO - ESTOY AQUI
function getLocalesByDistance(parent_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".ui-listview");
    container.find('li').remove();
    
    parent.find(".ui-content").hide();
    
	$.getJSON(BASE_URL_APP + 'locals/mobileGetLocalesEstoyAqui/'+LATITUDE+"/"+LONGITUDE, function(data) {
        
        if(data.items){
            //mostramos loading
            $.mobile.loading( 'show' );
            
    		items = data.items;
            if(items.length){
        		$.each(items, function(index, item) {
                    
                    var class_categoria = 'categoria_'+item.Local.categoria_id;
                    var class_zona = 'zona_'+item.Local.zona_id;
                    var imagen = item.Local.imagen!=""?item.Local.imagen:"default.png";
                    
                    var html='<li class="'+class_categoria+' '+class_zona+'">' +
                        '<img src="'+BASE_URL_APP+'img/locales/thumbnails/' + imagen + '"/>' +
                        '<div class="content_recuadro">' +
                            '<div class="content_descripcion">' +
                                '<div class="ubicacion">' +
                                    '<h3 class="ui-li-heading">' +
                                        '<a href="javascript:checkIn('+item.Local.id+')">'+item.Local.title+'</a>' +
                                    '</h3>' +
                                '</div>' +
                                '<div class="km">';
                                
                                //si esta menos de 1km le mostramos la distancia en metros en la cual se encuentra
                                if(parseInt(item.Local.kilomentros) < 1){
                                    html+='<b>'+parseFloat(item.Local.metros).toFixed(2)+' m</b>';
                                }else{
                                    html+='<b>'+parseFloat(item.Local.kilomentros).toFixed(2)+' km</b>';
                                }
                                    
                                html+='</div>' +
                            '</div>' +
                        '</div>' +
                    '</li>';
        		    
                    container.append(html);
        		});
                
                //refresh
        		container.listview('refresh');
                
                container.find("li:last img").load(function() {
                    //mostramos todos los locales
                    container.find("li").show();
                    
                    //ocultamos loading
                    $.mobile.loading( 'hide' );
                    parent.find(".ui-content").fadeIn("slow");
                });
            }else{
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            }
        }
	});
}

//OBTENEMOS LAS RECOMPENSAS
function getRecompensas(parent_id) {
    var parent = $("#"+parent_id);
    var container = parent.find(".ui-listview");
    container.find('li').remove();
    
    parent.find(".ui-content").hide();
    
    //ponemos los puntos acumulados que tiene hasta el momento
    if(isLogin()){
        var user = COOKIE;
        var puntos_acumulados = user.puntos_acumulados;
        parent.find(".puntos").html(puntos_acumulados);
    }
    
    //obtenemos todas las recompensas
	$.getJSON(BASE_URL_APP + 'recompensas/mobileGetRecompensas', function(data) {
        
        if(data.items){
            //mostramos loading
            $.mobile.loading( 'show' );
                    
    		items = data.items;
    		$.each(items, function(index, item) {
    		    var imagen = item.Recompensa.imagen!=""?item.Recompensa.imagen : "default.png";
            	var html='<li>'+
                    '<a href="recompensa_descripcion.html?id='+item.Recompensa.id+'">'+
                        '<img src="'+BASE_URL_APP+'img/recompensas/thumbnails/' + imagen + '"/>'+
                        '<div class="content_recuadro">' +
                            '<div class="content_descripcion">'+
                                '<h3 class="ui-li-heading">'+item.Recompensa.title+'</h3>'+
                                '<span>'+item.Recompensa.punto_costo+'</span> <span>puntos</span>'+
                            '</div>'+
                        '</div>'+
                    '</a>'+
                '</li>';
    		    
                container.append(html);
    		});
            
            //refresh
    		container.listview('refresh');
            
            container.find("li:last img").load(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS LA RECOMPENSA SEGUN EL ID
function getRecompensaById(parent_id, recompensa_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#carrousel_recompensa");
    container.find('.m-item').remove();
    container.find(".m-carousel-controls > a").remove();
    
    parent.find(".ui-content").hide();
    
	$.getJSON(BASE_URL_APP + 'recompensas/mobileGetRecompensaById/'+recompensa_id, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
            var recompensa = data.item.Recompensa;
            var recompensa_fotos = data.item.RecompensasFoto;
           	$.each(recompensa_fotos, function(index, recompensa_foto) {
           	    var imagen = recompensa_foto.imagen!=""?recompensa_foto.imagen:"default.png";
           	    var mclass = ""; 
           	    if(index == 0) mclass = "m-active";
                var html='<div class="m-item '+mclass+'">' +
                    '<div data-role="navbar" data-corners="false" class="ui-navbar ui-mini" role="navigation">' + 
                        '<ul class="ui-grid-b">' + 
                            '<li class="ui-block-a">' + 
                                '<a href="#" data-slide="prev" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a ui-btn-active">' +
                                    '<span class="ui-btn-inner"><span class="ui-btn-text">previous</span></span>' +
                                '</a>' +
                            '</li>' + 
                            '<li class="ui-block-b">' +
                                '<h3>'+recompensa.title+'</h3>' +
                            '</li>' +
                            '<li class="ui-block-c">' +
                                '<a href="#" data-slide="next" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="span" data-theme="a" data-inline="true" class="ui-btn ui-btn-inline ui-btn-up-a">' +
                                    '<span class="ui-btn-inner"><span class="ui-btn-text">next</span></span>' + 
                                '</a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<img src="'+BASE_URL_APP+'img/recompensas/' + imagen + '"/>' +
                '</div>';
                
           	    container.find(".m-carousel-inner").append(html);
                container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
            });
            
            //establecemos los puntos que cuesta la recompensa
            var punto_costo = recompensa.punto_costo; 
            parent.find(".puntos b").html(punto_costo);
            var numero_items = punto_costo/10;
            parent.find(".content_puntos span").each(function(index){
                if(index < numero_items){
                    $(this).addClass("active");
                }
            });
            
            //llenamos los datos de la recompensa
            parent.find(".texto_descripcion").html(recompensa.descripcion);
            parent.find(".ir_al_local a").attr("href","local_descripcion.html?id="+recompensa.local_id);
            parent.find("#recompensa_condiciones").find(".container_descripcion").html(recompensa.condicion);
            parent.find(".comprar_recompensa a").unbind("touchstart").bind("touchstart", function(){
                comprarRecompensa(recompensa.local_id, recompensa.id);
            });
            
            //iniciamos el carousel
            container.find(".m-carousel-inner").promise().done(function() {
                //iniciamos el carrousel
                container.carousel();
                
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS LA LISTA DE COMO FUNCIONA
function getComoFunciona(parent_id) {
    var parent = $("#"+parent_id);
    var container = parent.find(".ui-controlgroup-controls");
    container.find("a.clone").remove();
    
    parent.find(".ui-content").hide();
	
    $.getJSON(BASE_URL_APP + 'como_funcionas/mobileGetComoFunciona', function(data) {
        if(data){
            
            //mostramos loading
            $.mobile.loading('show');
            
    		items = data.items;
    		$.each(items, function(index, item) {
    		    var imagen = item.ComoFunciona.imagen!=""?item.ComoFunciona.imagen:"default.png";
                var clone = container.find('a:first').clone(true);
                clone.attr("href", "como_funciona_descripcion.html?id=" + item.ComoFunciona.id);
                clone.find(".ui-btn-text").html(item.ComoFunciona.title);
                clone.find(".ui-icon").css("background","url('"+BASE_URL_APP+"img/comofunciona/"+imagen+"')  no-repeat scroll top center transparent");
                clone.find(".ui-icon").css("background-size","28px");
                clone.find(".ui-icon").css("margin-top","-13px");
                clone.attr("lang",imagen);
                clone.css("display","block");
                clone.addClass("clone");
                
                //append container
                container.append(clone);
    		});
            
            container.promise().done(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
                
                //al momento de touch cambiamos su imagen a color rosa
                container.find("a").unbind("touchstart").bind("touchstart", function(){
                    $(this).find(".ui-icon").css("background","url('"+BASE_URL_APP+"img/comofunciona/rosa/"+$(this).attr("lang")+"')  no-repeat scroll top center transparent");
                    $(this).find(".ui-icon").css("background-size","28px");
                });
                
            });
        }
	});
}

//OBTENEMOS COMO FUNCIONA POR SU ID
function getComoFuncionaById(parent_id, como_funciona_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".content_details");
    parent.find(".ui-content").hide();
    
    $.getJSON(BASE_URL_APP + 'como_funcionas/mobileGetComoFuncionaById/'+como_funciona_id, function(data) {
        if(data){
            
            //mostramos loading
            $.mobile.loading('show');
    		item = data.item;
            
            parent.find(".ui-li-heading").html(item.ComoFunciona.title);
            container.append(item.ComoFunciona.descripcion);
            
            container.promise().done(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS QUIERO PARTICIPAR POR SU ID
function getQuieroParticiparById(parent_id, quiero_participar_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".content_details");
    parent.find(".ui-content").hide();
    
    $.getJSON(BASE_URL_APP + 'sistemas/mobileGetQuieroParticiparById/'+quiero_participar_id, function(data) {
        if(data){
            
            //mostramos loading
            $.mobile.loading('show');
    		item = data.item;
            
            parent.find(".ui-li-heading").html(item.Sistema.title);
            container.append(item.Sistema.descripcion_quiero_participar);
            
            container.promise().done(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//VERIFICAMOS SI EL DISPOSITIVO YA FUE REGISTRADO, SI LO ESTA MANDAMOS DIRECTO A LA HOME
function getValidarDeviceUuid(parent_id, device_uuid){
    var parent = $("#"+parent_id);
        
	$.getJSON(BASE_URL_APP + 'usuarios/mobileValidarDeviceUuid/'+device_uuid, function(data) {
	    //mostramos loading
        $.mobile.loading('show');
       	   
	    if(data.success){
	        var usuario = data.usuario.Usuario;
            //guardamos los datos en la COOKIE
	        createCookie("user", JSON.stringify(usuario), 365);
            //mandamos directo al home si es que la cookie se creo correctamente
            //sino le pedimos que se logee con fb o tw
            if(isLogin()){
                $.mobile.changePage('#home');
            }
        }else{
            //ocultamos loading
            $.mobile.loading( 'hide' );
            parent.find(".ui-header").fadeIn("slow");
            parent.find(".ui-content").fadeIn("slow");
        }
	});
}

//Obtemos los puntos que tiene acumulado el usuario
function getMiPerfil(parent_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".content_details");
    var recibir_alertas = 0;
    
    if(isLogin()){
        var user = COOKIE;
        recibir_alertas = user.recibir_alertas;
        
        if($.trim(user.email) == ""){
            showAlert("Hemos detectado que no tienes un email asociado a tu cuenta. Para poder seguir por favor debes rellenar tu email, as\u00ED cuando ganes una recompensa podremos estar en contacto. Gracias","Aviso","Aceptar");
        }
        
        var puntos_acumulados = user.puntos_acumulados; 
        container.find(".puntos b").html(puntos_acumulados);
        var numero_items = puntos_acumulados/10;
        container.find(".content_puntos span").each(function(index){
            if(index < numero_items){
                $(this).addClass("active");
            }
        });
        
        //establecemos los datos y evento para el form
        var form = container.find("form#form_change_email");
        
        form.find(".user_id").val(user.id);
        form.find(".user_email").val(user.email);
        
        form.find(".cambiar_email").unbind("touchstart").bind("touchstart", function(){
            var email = $.trim(form.find(".user_email").val()); 
            if(valEmail(email)){
                showLoadingCustom('Guardando datos...');
                $.post(BASE_URL_APP + 'usuarios/mobileChangeEmail', form.serialize()).done(function(data) {
                    data = $.parseJSON(data);
                    $.mobile.loading( 'hide' );
                    if(data.success){
                        showAlert(data.mensaje, "Aviso", "Aceptar");
                        
                        //re-escribimos la cookie con el nuevo email
                        reWriteCookie("user","email",data.new_email);
                    }else{
                        showAlert(data.mensaje, "Error", "Aceptar");
                    }
                });
            }else{
                showAlert("Por favor ingrese un email valido!.");
            }
        });
        
        if(recibir_alertas == "" || recibir_alertas == 0){
            parent.find(".recibir_alertas").addClass("si");
            parent.find(".recibir_alertas").find(".ui-btn-text").html("Recibir alertas");
        }
        
        //recibir/dejar de recibir alertas
        parent.find(".recibir_alertas").unbind("touchstart").bind("touchstart", function(){
            
            if(recibir_alertas == 1){
                navigator.notification.confirm(
                    "Estas seguro que quieres dejar de recibir alertas?", // message
                    function(buttonIndex){
                        //1:aceptar,2:cancelar
                        if(buttonIndex == 1){
                            showLoadingCustom('Espere por favor...');
                            
                            var me = user.id;
                            
                        	$.getJSON(BASE_URL_APP + 'usuarios/mobileSetAlerta/'+me, function(data) {
                                
                                if(data){
                                    //ocultamos loading
                                    $.mobile.loading( 'hide' );
                                    
                                    if(data.success){
                                        recibir_alertas = data.recibir_alertas;
                                        parent.find(".recibir_alertas").addClass("si");
                                        parent.find(".recibir_alertas").find(".ui-btn-text").html("Recibir alertas");
                                        //re-escribimos la cookie con el nuevo recibir_alertas
                                        reWriteCookie("user","recibir_alertas",data.recibir_alertas);
                                        showAlert(data.mensaje, "Aviso", "Aceptar");
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
            
            }else{
                showLoadingCustom('Espere por favor...');
                
                var me = user.id;
                
            	$.getJSON(BASE_URL_APP + 'usuarios/mobileSetAlerta/'+me, function(data) {
                    
                    if(data){
                        //ocultamos loading
                        $.mobile.loading( 'hide' );
                        
                        if(data.success){
                            recibir_alertas = data.recibir_alertas;
                            parent.find(".recibir_alertas").removeClass("si");
                            parent.find(".recibir_alertas").find(".ui-btn-text").html("Dejar de recibir alertas");
                            //re-escribimos la cookie con el nuevo recibir_alertas
                            reWriteCookie("user","recibir_alertas",data.recibir_alertas);
                            showAlert(data.mensaje, "Aviso", "Aceptar");
                        }else{
                            showAlert(data.mensaje, "Error", "Aceptar");
                        }
                    }
            	});
            }
        });
        
        //mostramos solo el boton para deslogearse el cual puede ser facebook o twitter
        container.find(".ui-btn-"+user.registrado_mediante).css("display","block");
    }
}