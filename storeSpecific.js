// LDLC

SPAPI.addStoreFunc("LDLC", (elementsNeeded)=>{
	if (elementsNeeded.DOM) {
		SPAPI.currentPayload.storeName = "LDLC";
		SPAPI.currentPayload.itemID = elementsNeeded.pathname;
		SPAPI.currentPayload.itemPrice = $(elementsNeeded.DOM).find("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');
		SPAPI.currentPayload.itemCurrency = "EUR";
		SPAPI.currentPayload.itemName = $(elementsNeeded.DOM).find("span.fn.designation_courte").first().text().trim();
	}
	else{
		console.log("No dom specified");
	}
});


// Hardware.fr


SPAPI.addStoreFunc("hardwarefr", (elementsNeeded) => {
	SPAPI.currentPayload.storeName = "hardwarefr";
	SPAPI.currentPayload.itemID = elementsNeeded.pathname;
	SPAPI.currentPayload.itemCurrency = "EUR";
	SPAPI.currentPayload.itemName = $(elementsNeeded.DOM).find("#description h1").first().text().trim();
	SPAPI.currentPayload.itemPrice = $(elementsNeeded.DOM).find("meta[itemprop=price]").attr("content");
});


// Amazon, for all countries


function parseAmazonPage(elementsNeeded){

	// if (elementsNeeded.pathname.startsWith("/dp/"))
	// 	payload.itemID = getUrlPart(window.location.pathname, 2);
	// else if (elementsNeeded.pathname.startsWith("/d/"))
	// 	payload.itemID =  getUrlPart(window.location.pathname, 4);
	// else
	// 	payload.itemID =  getUrlPart(window.location.pathname, 3);

	var regex = /\/(([A-Z]|[0-9]){10})(\/|\?|&|#)*/g;
	regex = regex.exec(elementsNeeded.pathname);
	if (regex === null) {
		console.log("ERROR: item ID could not be found");
		return;
	}
	else{
		regex = regex[1];
		console.log("Item ID is " + regex);
		return;
	}

	payload.itemPrice = $(elementsNeeded.DOM).find('span#priceblock_saleprice').text().trim();
	if (payload.itemPrice.length === 0)
		payload.itemPrice = $(elementsNeeded.DOM).find('span#priceblock_dealprice').text().trim();
	if (payload.itemPrice.length === 0)
		payload.itemPrice = $(elementsNeeded.DOM).find('span#priceblock_ourprice').text().trim();

	payload.itemName = $("span#productTitle").text().trim();

	//This value of the payload should already be set at this point
	switch(SPAPI.currentPayload.storeName)
	{
		case "amazoncom":
			SPAPI.currentPayload.itemCurrency = "USD";
			SPAPI.currentPayload.itemPrice = SPAPI.currentPayload.itemPrice.replace(/(\$|,|\s+)/g, "");
			break;
		case "amazoncouk":
			SPAPI.currentPayload.itemCurrency = "GBP";
			SPAPI.currentPayload.itemPrice = SPAPI.currentPayload.itemPrice.replace(/(£|,|\s+)/g, "");
			break;
		case "amazonfr":
			SPAPI.currentPayload.itemCurrency = "EUR";
			SPAPI.currentPayload.itemPrice = SPAPI.currentPayload.itemPrice.replace(/(EUR|\s+|,)/g, "");
			break;
	}

}

SPAPI.addStoreFunc("amazonfr", parseAmazonPage);
SPAPI.addStoreFunc("amazoncom", parseAmazonPage);
SPAPI.addStoreFunc("amazoncouk", parseAmazonPage);