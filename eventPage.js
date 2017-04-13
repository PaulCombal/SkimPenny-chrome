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


//Check the favorites price on every chrome startup
//Do NOT forget to switch those lines for testing as Installed will 
//trigger more esily than if it were a onStartup event, it's just for testing purposes
//chrome.runtime.onStartup.addListener(()=>{	
chrome.runtime.onInstalled.addListener(()=>{
	//Original plan was to embed the pages in an iframe for them to be processed again,
	//but X-frame headers prevented that, and chrome doesn't offer non-displayed tabs.
	//So now we have to download the raw html and retrieve the price, to compare it
	//with the user's last price record

	console.log("SkimPenny will check for updated prices in background now.");

	chrome.storage.sync.get(null, (data) => {
		//TODO add check if want this feature enabled
		$.each(data.favlist, (i, fav) => {
			var currentDate = new Date("2020-01-01"); //THIS IS A FUTURE DATE FOR TEST!! REMOVE THE STRING FOR PROD!!
			var lastDate = new Date(fav.lastTimeUpdated);
			var timeDifference = new Date(currentDate.getTime() - lastDate.getTime());
			//gets time difference in seconds, 86400 is the number of seconds in a day
			//It's useless to modify this value, as the server will reject the request anyway
			//if set to lower.
			//Yet, if anyone wants to add a feature to check prices only every 2 days or more,
			//I'm open to this
			if (timeDifference.getTime()/1000 > 86400) {
				console.log("Favorite: " + fav.itemName + " should be updated.");
				//Now we have to load the favorite page in an iframe

				switch(fav.store){
					case "amazonfr":
						//Fuck amazon AWS, better download everything, it's free
						$.get(fav.fullurl, ( data ) => {
						startPos = data.indexOf('"priceblock_dealprice"', 100000); //Value can be changed if proven to b too high
						endPos = data.indexOf("</", startPos);
						/*price = ""; TODO

						price = $(allpage).find('span#priceblock_dealprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
						if (payload.itemPrice.length === 0)
							payload.itemPrice = $('span#priceblock_saleprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
						if (payload.itemPrice.length === 0)
							payload.itemPrice = $('span#priceblock_ourprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");

						});*/
						break;
				}
			}
		});
	});
});