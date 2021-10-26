var applicationConfig = {
    // These default values get updated by the HTML inputs
    clientID: 'b2d23339-1d4d-4d72-9b87-b976de58ad69',
    scopes: ['XboxLive.signin'],
    authority: "https://login.microsoftonline.com/consumers"
};

var id_token_global = null
var access_token_global = null

var userAgentApplication = new Msal.UserAgentApplication(applicationConfig.clientID, applicationConfig.authority, function (errorDes, token, error, tokenType, instance) {
    // this callback is called after loginRedirect OR acquireTokenRedirect. It's not used with loginPopup,  acquireTokenPopup.
    if (error) {
        console.log(error + ": " + errorDes);
    }
    else
        console.log("Token type = " + tokenType);

})

function update_app() {    
    userAgentApplication = new Msal.UserAgentApplication(applicationConfig.clientID, applicationConfig.authority, function (errorDes, token, error, tokenType, instance) {
        // this callback is called after loginRedirect OR acquireTokenRedirect. It's not used with loginPopup,  acquireTokenPopup.
        if (error) {
            console.log(error + ": " + errorDes);
        }
        else
            console.log("Token type = " + tokenType);
    
    })
}

function sign_in() {
    update_app();
    
    userAgentApplication.loginPopup(applicationConfig.scopes).then(function (id_token) {
        var user = userAgentApplication.getUser();
        
        if (user) {
            console.log("signed in sucessfully");
            console.log(id_token);
            id_token_global = id_token;
            updatePage();
            // get an access token
            userAgentApplication.acquireTokenSilent(applicationConfig.scopes).then(function (access_token) {
                console.log("Success acquiring access token");
                console.log(access_token);
                access_token_global = access_token;
                updatePage();
            }, function (error) {
                // interaction required
                if (error.indexOf("interaction_required" != -1)) {
                    userAgentApplication.acquireTokenPopup(applicationConfig.scopes).then(function (access_token) {
                        console.log("Success acquiring access token");
                        console.log(access_token);
                        access_token_global = access_token;
                        updatePage();
                    }, function (error) {
                        console.log("Failure acquiring token: " + error);
                        document.getElementById("sign_in_text").innerText = error;
                    });
                }
            });
            
        } else {
            console.log("signed in failure");
        }
    }, function (error) {
        console.log("error: " + error);
        document.getElementById("sign_in_text").innerText = error;
        });

}