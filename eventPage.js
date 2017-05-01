function listenMessages(request, sender, callback) {
	if (request.action === "showPageAction") {
		chrome.pageAction.show(sender.tab.id);
	}
	else if (request.action === "xhttp") {
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
	}
	else if (request.action === "updatefav") {
		addRecord(request.fav);
	}
	
	return true; // prevents the callback from being called too early on return
}

//Will send a notification if price dropped, and send the new record to the server
function notifyAndSend(payload, favorite) {
	payload.storeName = favorite.store;
	payload.productPage = favorite.shorturl;
	payload.action = "xhttp";
	
	//will send to server
	listenMessages(payload, null, null);

	//Now let's notify
	//Broken in 2 ifs because I might add options that would get in between the two.
	if (payload.currency === favorite.currency) {
		// if (payload.price == favorite.lastUserAcknowledgedPrice) {
		if (payload.price < favorite.lastUserAcknowledgedPrice) {
			var notificationTitle = chrome.i18n.getMessage("notification_title");
			var newprice = parseFloat(payload.price);
			var oldprice = parseFloat(favorite.lastUserAcknowledgedPrice);
			var notificationText = favorite.itemName.substr(0, 20) + chrome.i18n.getMessage("dropped_from") + oldprice + chrome.i18n.getMessage("dropped_to") + newprice +"(" + favorite.currency + ")!";
			
			var e = {
				type: "basic",
				title: notificationTitle,
				message: notificationText,
				requireInteraction: true,
				isClickable: true,
				iconUrl: "img/sp48.png"
			};

			chrome.notifications.create(favorite.fullurl, e, () => {
			//chrome.storage.sync.get({PlayAudio: 'true'}, function (data) {
			//if (data.PlayAudio == 'true'){
			//	var e = new Audio("audio.mp3");
			//	e.play()
			//}
			});
		}
	}
}

//Gets the price of a favorite, and send it to the sever
function addRecord(fav) {
	//Now we have to load the favorite page in an iframe
	var payload = {};
	//The two values you have to set are:
	// payload.price = YOU SET IT;
	// payload.currency = YOU SET IT; Try to get the same than the saved favorite

	switch(fav.store){
		case "amazonfr":
			//Fuck amazon AWS, better download everything, it's free
			$.get(fav.fullurl, ( data ) => {
				startPos = data.indexOf('"priceblock_dealprice"', 100000); //Value can be changed if proven to be too high
				if (startPos < 0) {
					startPos = data.indexOf('"priceblock_saleprice"', 100000);
				}
				if (startPos < 0) {
					startPos = data.indexOf('"priceblock_ourprice"', 100000);
				}
				if (startPos < 0) {
					console.log("It doesn't seem that " + fav.itemName + "'s page can be accessed, or price is available.");
					return;
				}
				endPos = data.indexOf("</", startPos);
				price = data.substring(startPos + 20, endPos);
				if (price.length > 0) {
					price = price.replace(/.*EUR\s+/g, "");
					price = price.replace(/\s+/g, "");
					price = price.replace(/,/g, ".");
					
					payload.price = price;
					payload.currency = "EUR";

				}
				else{
					console.log("It doesn't seem that " + fav.itemName + "'s page can be accessed, or price is available.");
					return;
				}

				notifyAndSend(payload, fav);
			});
		break;
		case "amazoncom":
			//Fuck amazon AWS, better download everything, it's free
			$.get(fav.fullurl, ( data ) => {
				startPos = data.indexOf('"priceblock_dealprice"', 100000); //Value can be changed if proven to be too high
				if (startPos < 0) {
					startPos = data.indexOf('"priceblock_saleprice"', 100000);
				}
				if (startPos < 0) {
					startPos = data.indexOf('"priceblock_ourprice"', 100000);
				}
				if (startPos < 0) {
					console.log("It doesn't seem that " + fav.itemName + "'s page can be accessed, or price is available.");
					return;
				}
				endPos = data.indexOf("</", startPos);
				price = data.substring(startPos + 20, endPos);
				if (price.length > 0) {
					price = price.replace(/(.*\$|,)/g, "");
					
					payload.price = price;
					payload.currency = "USD";

				}
				else{
					console.log("It doesn't seem that " + fav.itemName + "'s page can be accessed, or price is available.");
					return;
				}

				notifyAndSend(payload, fav);
			});
		break;
		case "amazoncouk":
			//Fuck amazon AWS, better download everything, it's free
			$.get(fav.fullurl, ( data ) => {
				startPos = data.indexOf('"priceblock_dealprice"', 100000); //Value can be changed if proven to be too high
				if (startPos < 0) {
					startPos = data.indexOf('"priceblock_saleprice"', 100000);
				}
				if (startPos < 0) {
					startPos = data.indexOf('"priceblock_ourprice"', 100000);
				}
				if (startPos < 0) {
					console.log("It doesn't seem that " + fav.itemName + "'s page can be accessed, or price is available.");
					return;
				}
				endPos = data.indexOf("</", startPos);
				price = data.substring(startPos + 20, endPos);
				if (price.length > 0) {
					price = price.replace(/(.*£|,|\s)/g, "");
					
					payload.price = price;
					payload.currency = "GBP";

				}
				else{
					console.log("It doesn't seem that " + fav.itemName + "'s page can be accessed, or price is available.");
					return;
				}

				notifyAndSend(payload, fav);
			});
		break;
	}
}

chrome.runtime.onMessage.addListener(listenMessages);


//Check the favorites price on every chrome startup
//Do NOT forget to switch those lines for testing as Installed will 
//trigger more esily than if it were a onStartup event, it's just for testing purposes
chrome.runtime.onStartup.addListener(()=>{	
// chrome.runtime.onInstalled.addListener(()=>{
	//Original plan was to embed the pages in an iframe for them to be processed again,
	//but X-frame headers prevented that, and chrome doesn't offer non-displayed tabs.
	//So now we have to download the raw html and retrieve the price, to compare it
	//with the user's last price record, and send it to the database.

	console.log("SkimPenny will check for updated prices in background now.");

	chrome.storage.sync.get(null, (data) => {
		//TODO add check if want this feature enabled
		$.each(data.favlist, (i, fav) => {
			var currentDate = new Date();
			var lastDate = new Date(fav.lastUserAcknowledgedDate);
			var timeDifference = new Date(currentDate.getTime() - lastDate.getTime());
			//gets time difference in seconds, 86400 is the number of seconds in a day
			//You can lower this value if you want, but the server will only add records every 24h
			//Yet, if anyone wants to add a feature to check prices only every 2 days or more,
			//I'm open to this
			if (timeDifference.getTime()/1000 > 86400) {
				console.log("Favorite: " + fav.itemName + " should be updated.");
				addRecord(fav);
			}
		});
	});
});

/*Creating a new tab if notification is clicked*/
chrome.notifications.onClicked.addListener((notifID) => {
	chrome.notifications.clear(notifID);
	chrome.windows.getCurrent(function(currentWindow) {
		if (currentWindow != null) {
			return chrome.tabs.create({
				url: notifID
			});
		} else {
			return chrome.windows.create({
				url: notifID,
				type: "normal",
				focused: true
			});
		}
	})
});
