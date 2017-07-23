function listenMessages(request, sender, callback) {
	if (request.action === "showPageAction") {
		chrome.pageAction.show(sender.tab.id);
	}
	else if (request.action === "xhttp") {
		
		if (request.cancelled){
			console.log("Payload was cancelled and will not be sent");
			return;
		}

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
	else if(request.action === "createNotif") {
		createNotif(request.id, request.options, request.callback);
	}
	
	return true; // prevents the callback from being called too early on return
}

function createNotif(id, options, callback) {
	chrome.notification.create(id, options, callback);
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
			var notificationTitle = chrome.i18
			n.getMessage("notification_title");
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

			createNotif(favorite.fullurl, e, () => {
			//chrome.storage.sync.get({PlayAudio: 'true'}, function (data) {
			//if (data.PlayAudio == 'true'){
			//	var e = new Audio("audio.mp3");
			//	e.play()
			//}
			});
		}
	}
}

function downloadPage(url, callback){
	$.ajax(
	{
		url: url
	})
	.done((data)=>{callback(data);})
	.fail(()=>{
		console.warn("Could not download page " + url + " in the background.");
	});
}

//Gets the price of a favorite, and send it to the sever
function addRecord(fav) {
	switch(fav.store)
	{
		case "LDLC":
		case "amazoncom":
		case "amazoncouk":
		case "amazonfr":
			downloadPage(fav.fullurl, (page)=>{
				SPAPI.sendSimpleRecord({storeName: fav.store}, {DOM: page, pathname: new URL(fav.fullurl).pathname, fullurl: fav.fullurl});
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
		var currentDate = new Date("2020-01-01");
		$.each(data.favlist, (i, fav) => {
			var lastDate = new Date(fav.lastUserAcknowledgedDate);
			var timeDifference = new Date(currentDate.getTime() - lastDate.getTime());
			//gets time difference in seconds, 86400 is the number of seconds in a day
			//You can lower this value if you want, but the server will only add records every 24h
			//Yet, if anyone wants to add a feature to check prices only every 2 days or more,
			//please go on
			if (timeDifference.getTime()/1000 > 86400) {
				console.log("Favorite: " + fav.itemName + " will be updated.");
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
