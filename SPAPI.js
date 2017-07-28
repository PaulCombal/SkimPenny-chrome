//I'm not making a regular of that object because I only want one instance of this
//Not sure if it's the correct way this should have been done

function SPAPI(){

}

SPAPI.storeFuncs = [];
SPAPI.pendingPayloads = [];

SPAPI.addStoreFunc = (storeID, func) => {
	SPAPI.storeFuncs.push({store: storeID, specificFunc: func});
};

SPAPI.createPayload = (nameOfStore)=>{
	var payload = {};
	payload.storeName = nameOfStore;
	return payload;
};

SPAPI.preparePayload = (payload, necessaryElements) => {
	if (payload.storeName === undefined) {
		console.log("Fatal error: payload has no store name in preparePayload!");
		return;
	}

	//Getting the index
	var funcToCall = SPAPI.storeFuncs.map((a)=>{return a.store}).indexOf(payload.storeName);

	if (funcToCall == -1) {
		console.log("Error, couldn't find appropriate function in preparePayload");
		return;
	}

	funcToCall = SPAPI.storeFuncs[funcToCall].specificFunc;

	funcToCall(payload, necessaryElements);
};

SPAPI.sendPayload = (payload) => {
	//For some reason, I can't seem to be able to send a message from background script
	//to background script, so I'm using this stupid workaround to ensure the request 
	//is sent from the background page to avoid chrome security troubles and make the
	//server happy too.
	
	// console.log("Payload that should have been sent");
	// console.log(payload);
	// return;

	if (payload.cancelled){
		console.log("Payload was cancelled and will not be sent");
		return;
	}

	switch(window.location.protocol)
	{
		case "http:":
		case "https:":
			chrome.runtime.sendMessage({
				action: 'xhttp',
				storeName: payload.storeName,
				productPage: payload.itemID,
				price: payload.itemPrice,
				currency: payload.itemCurrency
			});
			break;

		case "chrome-extension:":
			$.post("http://waxence.fr/skimpenny/add.php", 
			{
				store : payload.storeName,
				product : payload.itemID,
				price : payload.itemPrice,
				currency: payload.itemCurrency
			},
			(response)=>{console.log(response);},
			'text')
			.fail(function(){
				console.log("Error sending request :(");
			});
			break;
	}
};

//Updates the favorite: last time/price seen by user
SPAPI.registerLastTimeUserSeen = (payload) => {
	chrome.storage.sync.get(null, (data)=>{
		if (isInFavorites(data.favlist, payload.itemID)) {
			
			var favoriteIndex = data.favlist.map((a)=>{return a.shorturl}).indexOf(payload.itemID);
			
			data.favlist[favoriteIndex].lastUserAcknowledgedDate = new Date().toJSON();
			data.favlist[favoriteIndex].lastUserAcknowledgedPrice = payload.itemPrice;
			data.favlist[favoriteIndex].currency = payload.itemCurrency;

			chrome.storage.sync.set({favlist: data.favlist}, ()=>{console.log("Favorite updated.")});
		}
	});
};

//Returns the generated payload that has been sent
SPAPI.sendSimpleRecord = (parameters, necessaryElements) => {
	var payload = SPAPI.createPayload(parameters.storeName);
	SPAPI.preparePayload(payload, necessaryElements);

	if(payload.cancelled)
		return payload;

	if(!SPAPI.validatePayload(payload))
		return payload;

	SPAPI.sendPayload(payload);
	
	if (parameters.updateFavorite) {
		SPAPI.registerLastTimeUserSeen(payload);
	}
	if (parameters.feedPopup) {
		SPAPI.feedPopup(payload);
	}

	return payload;
};

//Should only be used on content scripts
SPAPI.feedPopup = (payload) => {
	//If the popup is opened, it will ask for the item info

	SPAPI.popupFeedingPayload = payload;

	if (!SPAPI.bPopupFed){

		chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
			if (request.action == "getItemData"){
			 	sendResponse(
			 		{
			 			itemPayload: SPAPI.popupFeedingPayload,
			 			fullurl: window.location.href
			 		}
			 	);
			}
			else
				console.log("Unexpected message");
			}
		);

		chrome.runtime.sendMessage({
			action: 'showPageAction'
		});

		SPAPI.bPopupFed = true;
	}
}

SPAPI.createUnavailableItemNotification = (sUrl, sItemName) => {
	var e = {
		type: "basic",
		title: sItemName,
		message: chrome.i18n.getMessage("no_more_available_long"),
		isClickable: true,
		iconUrl: "img/sp48.png"
	};

	//Function declared in event page
	createNotif(sUrl, e, null);
};

SPAPI.cancelPayload = (payload) => {
	payload.cancelled = true;
}

SPAPI.validatePayload = (payload) => {
	if(
		payload.storeName 		!= undefined &&
		payload.itemID 			!= undefined &&
		payload.itemPrice 		!= undefined &&
		payload.itemCurrency 	!= undefined &&
		payload.itemName 		!= undefined
	){
		return true;
	}
	else{
		console.log("Payload could not be validated.");
		return false;
	}
}

function isInFavorites(favArray, itemID) {
	return favArray === undefined ? false : favArray.map((a)=>{return a.shorturl}).indexOf(itemID) != -1;
}