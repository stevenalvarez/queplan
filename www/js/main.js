
/************************************ BIND EVENT *******************************************************/

$(document).bind('pageinit', function(){
});

$(document).bind('pageshow', function() {
    var page_id = $("#" + $.mobile.activePage.attr('id'));
});

/************************************ EVENTOS *******************************************************/

//PLANES
$('#planes').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    var categoria_id = getUrlVars()["id"];
    //inicializamos el carrousel
    getCategoriasByCarrousel(page_id, categoria_id);
    getLocalesById(page_id, categoria_id);
});

//GUIA
$('#guia').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getCategorias(page_id);
});

//PLAN DESCRIPCION
$(document).on('pageinit', "#plan_descripcion", function(){
    var page_id = $(this).attr("id");
    //iniciamos el carrousel
    $("#"+page_id).find("#carrousel_plan").carousel();
});

//RECOMPENSAS
$('#recompensas').live('pagebeforeshow', function(event, ui) {
    var page_id = $(this).attr("id");
    getRecompensas(page_id);
});


//RECOMPENSA DESCRIPCION
$(document).on('pageinit', "#recompensa_descripcion", function(){
    var page_id = $(this).attr("id");
    //iniciamos el carrousel
    $("#"+page_id).find("#carrousel_recompensa").carousel();
});

/************************************ FUNCTIONS *******************************************************/

//OBTENEMOS LAS CATEGORIAS PARA EL CARROUSEL - PLANES
function getCategoriasByCarrousel(parent_id, categoria_id){
    var parent = $("#"+parent_id);
    var container = parent.find("#slider_items");
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

//OBTENEMOS LOS LOCALES SEGUN EL ID QUE NOS PASA - PLANES
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
    		$.each(items, function(index, item) {
    		  
            	var html='<li class="'+item.Local.categoria_id+'">' +
                    '<img src="'+BASE_URL_APP+'img/locales/' + item.Local.imagen + '"/>' +
                    '<div class="content_descripcion">' +
                        '<div class="ubicacion">' +
                            '<h3 class="ui-li-heading">' +
                                '<a href="plan_descripcion.html?id='+item.Local.id+'">'+item.Local.title+'</a>' +
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
                //ocultamos loading
                
                //si viene alguna categoria seleccionda solo mostramos esa
                if(categoria_id != undefined){
                    container.find("li."+categoria_id).show();
                }else{
                    container.find("li").show();
                }
                
                $.mobile.loading( 'hide' );
                parent.find(".ui-content").fadeIn("slow");
            });
        }
	});
}

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
                clone.attr("href", "planes.html?id=" + item.Categoria.id);
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
