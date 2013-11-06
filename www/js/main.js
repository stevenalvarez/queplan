
/************************************ BIND EVENT *******************************************************/

$(document).bind('pageinit', function(){
});

$(document).bind('pageshow', function() {
    var page_id = $("#" + $.mobile.activePage.attr('id'));
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
                var clone = container.find('a:first').clone(true);
                clone.attr("href", "locales.html?id=" + item.Categoria.id);
                clone.find(".ui-btn-text").html(item.Categoria.title);
                clone.find(".ui-icon").css("background","url('"+BASE_URL_APP+"img/categorias/"+item.Categoria.imagen+"')  no-repeat scroll top center transparent");
                clone.find(".ui-icon").css("background-size","35px");
                clone.find(".ui-icon").css("padding-left","5px");
                clone.find(".ui-icon").css("margin-top","-18px");
                clone.css("display","block");
                clone.addClass("clone");
                
                //append container
                container.append(clone);
    		});
            
            container.promise().done(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
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
    		  
            	var html='<li>'+
                        '<div class="recuadro">' +
                            '<a href="#'+item.Categoria.id+'" id="'+item.Categoria.id+'">' +
                                '<img src="'+BASE_URL_APP+'img/categorias/' + item.Categoria.imagen + '" />' +
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
                container.find("a").bind("touchstart click", function(){
                    container.find(".owl-item").removeClass("active");
                    $(this).parent().parent().parent().addClass("active");
                    var id = $(this).attr("href");
                    id = id.substring(1,id.length);
                    
                    //mostramos u ocultamos los items
                    var container_ul = parent.find(".ui-listview");
                    container_ul.css("opacity","0.5");
                    container_ul.find("li").hide();
                    container_ul.find("li."+id).show();
                    container_ul.animate({opacity: 1}, 500 );
                });
                
                //si viene alguna categoria seleccionda marcamos esa
                if(categoria_id != undefined){
                    container.find("a#"+categoria_id).parent().parent().parent().addClass("active");
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
        		  
                	var html='<li class="'+item.Local.categoria_id+'">' +
                        '<img src="'+BASE_URL_APP+'img/promociones/thumbnails/' + item.Promocion.imagen + '"/>' +
                        '<div class="content_descripcion">' +
                            '<div class="ubicacion">' +
                                '<h3 class="ui-li-heading">' +
                                    '<a href="plan_descripcion.html?id='+item.Promocion.id+'">'+item.Promocion.title+'</a>' +
                                '</h3>' +
                            '</div>' +
                            '<div class="km">' +
                                '<b>1248 km</b>' +
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
    
	$.getJSON(BASE_URL_APP + 'promocions/mobileGetPlanById/'+plan_id, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
            var promocion = data.item.Promocion;
            var promocion_fotos = data.item.PromocionsFoto;
           	$.each(promocion_fotos, function(index, promocion_foto) {
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
                    '<img src="'+BASE_URL_APP+'img/promociones/' + promocion_foto.imagen + '"/>' +
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
    
	$.getJSON(BASE_URL_APP + 'locals/mobileGetLocales', function(data) {
        
        if(data.items){
            //mostramos loading
            $.mobile.loading( 'show' );
            
    		items = data.items;
            if(items.length){            
        		$.each(items, function(index, item) {
        		  
                	var html='<li class="'+item.Local.categoria_id+'">' +
                        '<img src="'+BASE_URL_APP+'img/locales/thumbnails/' + item.Local.imagen + '"/>' +
                        '<div class="content_descripcion">' +
                            '<div class="ubicacion">' +
                                '<h3 class="ui-li-heading">' +
                                    '<a href="local_descripcion.html?id='+item.Local.id+'">'+item.Local.title+'</a>' +
                                '</h3>' +
                            '</div>' +
                            '<div class="km">' +
                                '<b>1248 km</b>' +
                            '</div>' +
                        '</div>' +
                    '</li>';
        		    
                    container.append(html);
        		});
                
                //refresh
        		container.listview('refresh');
                
                container.find("li:last img").load(function() {
                    //mostramos los locales de esa categoria
                    container.find("li."+categoria_id).show();
                    
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
    
	$.getJSON(BASE_URL_APP + 'locals/mobileGetLocalById/'+local_id, function(data) {
        
        if(data){
            //mostramos loading
            $.mobile.loading( 'show' );
            
            var local = data.item.Local;
            var local_fotos = data.item.LocalsFoto;
           	$.each(local_fotos, function(index, local_foto) {
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
                    '<img src="'+BASE_URL_APP+'img/locales/' + local_foto.imagen + '"/>' +
                '</div>';
                
           	    container.find(".m-carousel-inner").append(html);
                container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
            });
            
            //llenamoas los datos del local
            parent.find(".texto_descripcion").html(local.descripcion);
            parent.find(".llamada span").html(local.telefono);
            parent.find(".llamar a").attr("href","tel:"+local.telefono);
            
            //map
            parent.find(".map a").attr("href","local_google_map.html?latitud="+local.latitud+"&longitud="+local.longitud);
            //web
            if(local.web != null && local.web != "")parent.find(".web a").attr("onclick", "window.open(this.href,'_system'); return false;");
            //twitter
            if(local.twitter != null && local.twitter != "")parent.find(".twitter a").attr("onclick", "window.open(this.href,'_system'); return false;");
            //facebook
            if(local.facebook != null && local.facebook != "")parent.find(".facebook a").attr("onclick", "window.open(this.href,'_system'); return false;");
            
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

//OBTENEMOS LAS RECOMPENSAS
function getRecompensas(parent_id) {
    var parent = $("#"+parent_id);
    var container = parent.find(".ui-listview");
    container.find('li').remove();
    
    parent.find(".ui-content").hide();
    
	$.getJSON(BASE_URL_APP + 'recompensas/mobileGetRecompensas', function(data) {
        
        if(data.items){
            //mostramos loading
            $.mobile.loading( 'show' );
                    
    		items = data.items;
    		$.each(items, function(index, item) {
    		  
            	var html='<li>'+
                    '<a href="recompensa_descripcion.html?id='+item.Recompensa.id+'">'+
                        '<img src="'+BASE_URL_APP+'img/recompensas/thumbnails/' + item.Recompensa.imagen + '"/>'+
                        '<div class="content_descripcion">'+
                            '<h3 class="ui-li-heading">'+item.Recompensa.title+'</h3>'+
                            '<span>'+item.Recompensa.punto_costo+'</span> <span>puntos</span>'+
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
                    '<img src="'+BASE_URL_APP+'img/recompensas/' + recompensa_foto.imagen + '"/>' +
                '</div>';
                
           	    container.find(".m-carousel-inner").append(html);
                container.find(".m-carousel-controls").append('<a href="#" data-slide="'+(index+1)+'">'+(index+1)+'</a>');
            });
            
            //llenamoas los datos del plan
            parent.find(".texto_descripcion").html(recompensa.descripcion);
            parent.find(".ir_al_local a").attr("href","local_descripcion.html?id="+recompensa.local_id);
            parent.find("#recompensa_condiciones").find(".container_descripcion").html(recompensa.condicion);
            
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
                var clone = container.find('a:first').clone(true);
                clone.attr("href", "como_funciona_descripcion.html?id=" + item.ComoFunciona.id);
                clone.find(".ui-btn-text").html(item.ComoFunciona.title);
                clone.find(".ui-icon").css("background","url('"+BASE_URL_APP+"img/comofunciona/"+item.ComoFunciona.imagen+"')  no-repeat scroll top center transparent");
                clone.find(".ui-icon").css("background-size","28px");
                clone.find(".ui-icon").css("margin-top","-13px");
                clone.css("display","block");
                clone.addClass("clone");
                
                //append container
                container.append(clone);
    		});
            
            container.promise().done(function() {
                //ocultamos loading
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

//OBTENEMOS COMO FUNCIONA POR SU ID
function getComoFuncionaById(parent_id, como_funcion_id){
    var parent = $("#"+parent_id);
    var container = parent.find(".content_details");
    parent.find(".ui-content").hide();
    
    $.getJSON(BASE_URL_APP + 'como_funcionas/mobileGetComoFuncionaById/'+como_funcion_id, function(data) {
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