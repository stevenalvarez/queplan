var Twitter = {
    init:function(){
		
		// our storedAccessData and Raw Data
        var storedAccessData, rawData = localStorage.getItem(twitterKey);
		
		// First thing we need to do is check to see if we already have the user saved!
		if(localStorage.getItem(twitterKey) !== null){
			
			// If we already have them
			storedAccessData = JSON.parse(rawData); // Parse our JSON object
			options.accessTokenKey = storedAccessData.accessTokenKey; // This is saved when they first sign in
			options.accessTokenSecret = storedAccessData.accessTokenSecret; // this is saved when they first sign in
			
			// jsOAuth takes care of everything for us we just need to provide the options
			oauth = OAuth(options);
		}
		else {
			
			// We don't have a user saved yet
			oauth = OAuth(options);
			oauth.get('https://api.twitter.com/oauth/request_token',
				function(data) {
					requestParams = data.text;
					window.plugins.childBrowser.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text, { showLocationBar : false }); // This opens the Twitter authorization / sign in page
					window.plugins.childBrowser.onLocationChange = function(loc){ Twitter.success(loc); }; // When the ChildBrowser URL changes we need to track that
				},
				function(data) {
					console.log("ERROR: "+data);
				}
			);
		}
    },
	
	/*
	When The ChildBrowser URL changes we will track it here.
	We will also determine if the request was a success or not here
	*/
	success:function(loc){
		
		// The supplied oauth_callback_url for this session is being loaded
		
		/*
		We will check to see if the childBrowser's new URL matches our callBackURL
		*/
        if (loc.indexOf(callback + "?") >= 0) {
        
            // Parse the returned URL
            var params = loc.toString().split("&");
            var verifier = params[1].toString();
            //get access token
            oauth.get('https://api.twitter.com/oauth/access_token?' + verifier+'&'+requestParams,
                function(data) {
                    var accessParams = {};
                    var qvars_tmp = data.text.split('&');
                    for (var i = 0; i < qvars_tmp.length; i++) {
                        var y = qvars_tmp[i].split('=');
                        accessParams[y[0]] = decodeURIComponent(y[1]);
                    }
                    var screen_name = accessParams.screen_name;
                    
                    oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
                    
                    // Save access token/key in localStorage
                    var accessData = {};
                    accessData.accessTokenKey = accessParams.oauth_token;
                    accessData.accessTokenSecret = accessParams.oauth_token_secret;
                    
                    // SETTING OUR LOCAL STORAGE
                    localStorage.setItem(twitterKey, JSON.stringify(accessData));
                    
                    //mandamos al registro
                    setTimeout(function(){
                        TW_LOGIN_SUCCESS = true;
                        showRegistroSocial('twitter');
                        showLoadingCustom('Cargando datos...');
                    }, 0);
                    
                    oauth.get('https://api.twitter.com/1.1/users/show.json?screen_name=' + screen_name,
                    function(data)
                    {
                        var user = jQuery.parseJSON(data.text);
                        var urlamigable = (user.name).split(' ').join('');
                        $("#form_registro").find("#u_urlamigable").val(urlamigable);
                        $("#form_registro").find("#pictureImage").attr("src", user.profile_image_url).show();
                        $("#form_registro").find("#u_img_url_social").val(user.profile_image_url);
                        
                        //ocultamos el loading...
                        $.mobile.loading( 'hide' );
                    
                    },
                    function(data) { alert('Fail to fetch the info of the authenticated user!'); }
                    );                        
                    
                    // Since everything went well we can close our childBrowser!
                    window.plugins.childBrowser.close();
                },
                function(data) { 
                    console.log(data);
                }
            );
        }
        else {
        // do nothing	
        }
	},
	tweet:function(){
		var storedAccessData, rawData = localStorage.getItem(twitterKey);
		
			storedAccessData = JSON.parse(rawData); // Parse our JSON object
			options.accessTokenKey = storedAccessData.accessTokenKey; // This is saved when they first sign in
			options.accessTokenSecret = storedAccessData.accessTokenSecret; // this is saved when they first sign in
			
			// jsOAuth takes care of everything for us we just need to provide the options
			oauth = OAuth(options);
	},
	/*
	Now that we have the information we can Tweet!
	*/
	post:function(){
		var theTweet = $("#tweet").val(); // Change this out for what ever you want!
	}
};