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

SPAPI.addStoreFunc("hardwarefr", (elementsNeeded) => {
	SPAPI.currentPayload.storeName = "hardwarefr";
	SPAPI.currentPayload.itemID = elementsNeeded.pathname;
	SPAPI.currentPayload.itemCurrency = "EUR";
	SPAPI.currentPayload.itemName = $(elementsNeeded.DOM).find("#description h1").first().text().trim();
	SPAPI.currentPayload.itemPrice = $(elementsNeeded.DOM).find("meta[itemprop=price]").attr("content");
});