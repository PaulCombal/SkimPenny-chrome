// LDLC

SPAPI.addStoreFunc("LDLC", (payload, elementsNeeded)=>{
	
	if (!elementsNeeded.DOM) {
		console.log("No DOM specified!");
		return;
	}

	payload.storeName = "LDLC";
	payload.itemID = elementsNeeded.pathname;
	payload.itemPrice = $(elementsNeeded.DOM).find("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find("span.fn.designation_courte").first().text().trim();
});


// Hardware.fr


SPAPI.addStoreFunc("hardwarefr", (payload, elementsNeeded) => {
	payload.storeName = "hardwarefr";
	payload.itemID = elementsNeeded.pathname;
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find("#description h1").first().text().trim();
	payload.itemPrice = $(elementsNeeded.DOM).find("meta[itemprop=price]").attr("content");
});


// Amazon, for all countries


function parseAmazonPage(payload, elementsNeeded){

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
		payload.itemID = regex;
	}

	payload.itemPrice = $(elementsNeeded.DOM).find('span#priceblock_saleprice').text().trim();
	if (payload.itemPrice.length === 0)
		payload.itemPrice = $(elementsNeeded.DOM).find('span#priceblock_dealprice').text().trim();
	if (payload.itemPrice.length === 0)
		payload.itemPrice = $(elementsNeeded.DOM).find('span#priceblock_ourprice').text().trim();

	payload.itemName = $(elementsNeeded.DOM).find("span#productTitle").text().trim();

	//This value of the payload should already be set at this point
	switch(payload.storeName)
	{
		case "amazoncom":
			payload.itemCurrency = "USD";
			payload.itemPrice = payload.itemPrice.replace(/(\$|,|\s+)/g, "");
			break;
		case "amazoncouk":
			payload.itemCurrency = "GBP";
			payload.itemPrice = payload.itemPrice.replace(/(£|,|\s+)/g, "");
			break;
		case "amazonfr":
			payload.itemCurrency = "EUR";
			payload.itemPrice = payload.itemPrice.replace(/(EUR|\s+)/g, "").replace(/,/g, ".");
			break;
	}
}

SPAPI.addStoreFunc("amazonfr", parseAmazonPage);
SPAPI.addStoreFunc("amazoncom", parseAmazonPage);
SPAPI.addStoreFunc("amazoncouk", parseAmazonPage);