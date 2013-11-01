
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
    //iniciamos el carrousel
    $("#"+page_id).find("#slider_items").owlCarousel({
        pagination : false,
        items : 4,
        itemsMobile : [479,4],
        responsive: false,
    });
    var element = $("#"+page_id).find("#slider_items");
    element.find("a").bind("touchstart click", function(){
        element.find(".owl-item").removeClass("active");
        $(this).parent().parent().parent().addClass("active");
        var id = $(this).attr("href");
        id = id.substring(1,id.length);
    });
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
		$('#lista_novedades li').remove();
        
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
