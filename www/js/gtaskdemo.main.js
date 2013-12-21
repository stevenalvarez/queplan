/*
   Event Handler HOOKS and Implementations.
   
   =================================================================================================
   BEGIN EVENT HOOK & HANDLING USING JS
   =================================================================================================
   
   Demo showing how to implement Google API with oAuth.
   
   Disclaimer: The code below is just another Javascript Spaghetti code. To avoid such spaghetti code, please look into 
   something like backbone.js to make the actual App :)! 
 */


$(document).ready(function() {
	
	/* startApp after device ready */
	document.addEventListener("deviceready", startApp, false);
});

/**
 * Start the App
 */
function startApp() {
	
	var oAuth = liquid.helper.oauth;
	
    $("#access-code").click(function(event) {
        liquid.helper.oauth.authorize(authorizeWindowChange);
        event.preventDefault();
    });

    
    if (oAuth.isAuthorized()) {
    	/* Start Page TaskList */
    	startPageTaskList();
    }
}

function startPageTaskList() {
    $.mobile.changePage("#page-tasklist", {
        transition : "none",
    });
}

function authorizeWindowChange(uriLocation) {
    //console.log("Location Changed: " + uriLocation); 
	var oAuth = liquid.helper.oauth;
	
	// oAuth process is successful!	
    if (oAuth.requestStatus == oAuth.status.SUCCESS) {
        var authCode = oAuth.authCode;

        // have the authCode, now save the refreshToken and start Page TaskList
        oAuth.saveRefreshToken({ 
        	  	auth_code: oAuth.authCode
        	  }, function() {
        		  startPageTaskList();
        	  });
        
    } 
    else if (oAuth.requestStatus == oAuth.status.ERROR) 
    {
    	console.log("ERROR - status received = oAuth.status.ERROR");
    } 
    else {
        // do nothing, since user can be visiting different urls
    }
}

(function() {
    //TODO
})();