chrome.runtime.onMessage.addListener((request, sender, callback) => {
    if (request.action == "showPageAction") {
    	chrome.pageAction.show(sender.tab.id);
    }
    else if (request.action == "xhttp") {
		$.post("http://waxence.fr/skimpenny/add.php", 
			{
				store : request.storeName,
				product : request.productPage,
				price : request.price,
				currency: request.currency
			},
			(response)=>{console.log(response);},
			'text')
		.fail(function(){
			console.log("Error sending request :(");
		});

        return true; // prevents the callback from being called too early on return
    }
});

/* TOO COMPLICATED, TODO!
//Check the favorites price on every chrome startup
//Do NOT forget to switch those lines for testing as Installed will 
//trigger more esily than if it were a onStartup event, it's just for testing purposes
//chrome.runtime.onStartup.addListener(()=>{
chrome.runtime.onInstalled.addListener(()=>{
	//Step 1: for every favorite, only keep those which need to be updated
	//Step 2: embed the page in an invisible iframe, content script will be embedded in the iframe i guess

	console.log("SkimPenny will check for updated prices in background now.");
	chrome.storage.sync.get(null, (data) => {
		//TODO add check if want this feature enabled
		$.each(data.favlist, (i, fav) => {
			var currentDate = new Date("2018-01-01"); //THIS IS A FUTURE DATE FOR TEST!! REMOVE THE STRING FOR PROD!!
			var timeDifference = new Date(currentDate - fav.lastTimeUpdated);
			//gets time difference in seconds, 86400 is the number of seconds in a day
			//It's useless to modify this value, as the server will reject the request anyway
			//if set to lower.
			//Yet, if anyone wants to add a feature to check prices only every 2 days or more,
			//I'm open to this
			if (timeDifference.getTime()/1000 > 86400) {
				console.log("Favorite: " + fav.itemName + " should be updated.");
				$.get(fav.fullurl, (data, status) => {
					//console.log(data); //OK!
					console.log(status);

					//
				});
			}
		});
	});
});*/