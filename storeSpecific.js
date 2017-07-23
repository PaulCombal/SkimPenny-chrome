// Useful functions you can use

function getUrlPart(url, index) {
   return url.replace(/^https?:\/\//, '').split('/')[index];
}

function getLastUrlPart(fullurl) {
	var shorturl = fullurl.substr(fullurl.lastIndexOf('/') + 1);

	var n = shorturl.indexOf('#');
	shorturl = shorturl.substring(0, n != -1 ? n : shorturl.length);

	n = shorturl.indexOf('?');
	shorturl = shorturl.substring(0, n != -1 ? n : shorturl.length);

	return shorturl;
}

// LDLC

SPAPI.addStoreFunc("LDLC", (payload, elementsNeeded)=>{
	
	if (!elementsNeeded.DOM) {
		console.log("No DOM specified!");
		return;
	}

	payload.storeName = "LDLC";
	payload.itemID = elementsNeeded.pathname;
	payload.itemPrice = $(elementsNeeded.DOM).find("#productshipping meta[itemprop=price]").attr("content");
	if(payload.itemPrice !== undefined){
		payload.itemPrice.replace(/,/g, '.');
	}
	else{
		SPAPI.createUnavailableItemNotification(elementsNeeded.fullurl);
		SPAPI.cancelPayload(payload);
		return;
	}
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
		// console.log("Item ID is " + regex);
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

// Cdiscount.fr
//Let's NOT use the API for the background and foreground, always down or "Too many invalid requests", never works.

SPAPI.addStoreFunc("cdiscount", (payload, elementsNeeded) => {
	payload.storeName = "cdiscount";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $(elementsNeeded.DOM).find("span.price[itemprop=price]").attr("content");
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find("h1[itemprop=name").text().trim();
});

//Conrad.fr

SPAPI.addStoreFunc("conradfr", (payload, elementsNeeded) => {
	payload.storeName = "conradfr";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $(elementsNeeded.DOM).find("span.price").text().trim();
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find("a.fn[name=head_detail").text().trim();
});

//NIKE international

SPAPI.addStoreFunc("nike", (payload, elementsNeeded) => {
	var priceString = $(elementsNeeded.DOM).find('.exp-pdp-product-price span').last().text().trim();
	
	//Add your own currency if you want, too lazy to make them all
	switch(true)
	{
		case priceString.includes("€"):
			payload.itemPrice = priceString.replace("€", "").replace(",", ".").trim();
			payload.itemCurrency = "EUR";
			break;

		case priceString.includes("$") && (window.location.href.includes("/us/") || window.location.href.includes("/pr/")):
			payload.itemPrice = priceString.replace(/\$/g, "").replace(",", ".").trim();
			payload.itemCurrency = "USD";
			break;

		case priceString.includes("CAD "):
			payload.itemPrice = priceString.replace(/CAD\s/g, "").replace(",", ".").trim();
			payload.itemCurrency = "CAD";
			break;

		case priceString.includes("$") && window.location.href.includes("/mx/"):
			payload.itemPrice = priceString.replace(/\$/g, "").replace(",", "").trim();
			payload.itemCurrency = "MXN";
			break;

		case $("span#ctl00_Conteudo_ctl21_precoPorValue").text().includes("R$  "):
			payload.itemPrice = $("span#ctl00_Conteudo_ctl21_precoPorValue").text().replace(/R\$\s/g, "").replace(",", ".").trim();
			payload.itemCurrency = "BRL";
			break;
	}

	payload.itemID = getUrlPart(elementsNeeded.pathname, 5);
	payload.itemName = $(elementsNeeded.DOM).find('h1.exp-product-title.nsg-font-family--platform').text().trim();
});

// Grosbill

SPAPI.addStoreFunc("grosbill", (payload, elementsNeeded) => {
	payload.storeName = "grosbill";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $(elementsNeeded.DOM).find('meta[itemprop=price]').first().attr("content").trim();
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find('h1[itemprop=name]').text().trim();
});

// Undiz

SPAPI.addStoreFunc("undiz", (payload, elementsNeeded) => {
	payload.storeName = "undiz";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $(elementsNeeded.DOM).find('.hidden.js-price-sales').first().text().trim();
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find('p.product-name').text().trim();
});

// Caseking.de

SPAPI.addStoreFunc("casekingde", (payload, elementsNeeded) => {
	payload.storeName = "casekingde";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $(elementsNeeded.DOM).find('meta[itemprop=price]').first().attr("content").trim();
	payload.itemCurrency = "EUR";
	payload.itemName = $('h1').clone().children().remove().end().text().trim();
});

//Newegg.com (TODO: NCIX, and newegg.ca)

SPAPI.addStoreFunc("neweggcom", (payload, elementsNeeded) =>{
	//Newegg has an API, yet it's very obscure and I don't really feel it's gonna be easy
	//http://stackoverflow.com/questions/8265061/newegg-api-access-for-price-inventory-json-xml
	payload.storeName = "neweggcom";
	payload.itemID = elementsNeeded.search.match(/N([A-Z]|[0-9]){14}/g);
	if(payload.itemID.length === 0){
		console.log("An error occurred getting the ID of this item, please let the devs know about it!");
		return;
	}
	payload.itemID = payload.itemID[0];
	payload.itemPrice = $(elementsNeeded.DOM).find("meta[itemprop=price]").attr("content");
	payload.itemCurrency = "USD";
	payload.itemName = $('#grpDescrip_h').text().trim();
});

// Zalando.fr (might want to do like amazon for other domains)

SPAPI.addStoreFunc("zalandofr", (payload, elementsNeeded) => {
	payload.storeName = "zalandofr";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $(elementsNeeded.DOM).find("meta[name='twitter:data1']").attr("content").replace(/\s+€/g, "").replace(/,/g, ".");
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find("title").first().text()
});

SPAPI.addStoreFunc("gearbestcom", (payload, elementsNeeded) => {
	payload.storeName = "gearbestcom";
	payload.itemName = $(elementsNeeded.DOM).find('h1').first().text().trim();
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemCurrency = $("span.currency").text().trim();

	payload.itemPrice = $("#unit_price").text().trim().match(/[0-9]{0,5}(\.[0-9]{1,2})?$/g);
	
	if (payload.itemPrice === null) {
		console.log("No price found!");
		return;
	}
	
	payload.itemPrice = payload.itemPrice[0];
});

SPAPI.addStoreFunc("topachatcom", (payload, elementsNeeded) => {
	payload.storeName = "topachatcom";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $(elementsNeeded.DOM).find("span.priceFinal[itemprop=price]").attr("content");
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find("h1[itemprop=name").text().trim();
});

SPAPI.addStoreFunc("rueducommercefr", (payload, elementsNeeded) => {
	payload.storeName = "rueducommercefr";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $(elementsNeeded.DOM).find("meta[itemprop=price]").attr("content").replace(/,/g, ".");
	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find("h1 span[itemprop=name]").text().trim();
});

SPAPI.addStoreFunc("materielnet", (payload, elementsNeeded) => {
	payload.storeName = "materielnet";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemPrice = $("#ProdInfoPrice span").text().trim().replace(/€ TTC/g, "").replace(/,/g, ".").replace(/\s+/g, "");
	payload.itemCurrency = "EUR";
	payload.itemName = $("#breadcrumb li").last().text().trim();
});

SPAPI.addStoreFunc("romwe", (payload, elementsNeeded) => {
	var price = $(elementsNeeded.DOM).find("span.price-discount").last().text().trim().match(/([0-9]{1,5}(\.[0-9]{2})?)/g);
	
	if(price !== null && price.length > 0){
		price = price[0];
	}
	else{
		console.log("No price found");
	}

	console.log(price);

	var currency = $(".j-currency-title").text().trim();

	switch(currency)
	{
		case "Pound Sterling":
		case "£":
			currency = "GBP";
			break;

		case "US Dollar":
		case "US$":
			currency = "USD";
			break;

		case "Euro":
		case "€":
			currency = "EUR";
			break;

		case "Norwegian Krone":
		case "N.Kr":
			currency = "NOK";
			break;

		case "Australian Dollar":
		case "AU$":
			currency = "AUD";
			break;

		case "Canadian Dollar":
		case "CA$":
			currency = "CAD";
			break;

		case "Brazil Reais":
		case "R$":
			currency = "BRL";
			break;

		case "Russian Ruble":
		case "RUB":
			currency = "RUB";
			break;

		case "Mexican Peso":
		case "MXN$":
			currency = "MXN";
			break;

		default:
			console.log("Error getting currency: " + currency);
			break;
	}

	console.log(currency);

	var id = $(elementsNeeded.DOM).find("div.sku").text().trim();

	payload.itemPrice = price;
	payload.storeName = "romwe";
	payload.itemID = id;
	payload.itemName = $('title').text().trim();
	payload.itemCurrency = currency;
});

SPAPI.addStoreFunc("fnaccom", (payload, elementsNeeded) => {
	payload.storeName = "fnaccom";
	
	payload.itemID = elementsNeeded.pathname.match(/\/[a-z]{1,5}[0-9]{5,10}\//g);
	if (payload.itemID === null) {
		console.log("No price found!");
		return;
	}

	payload.itemID = payload.itemID[0];
	
	payload.itemPrice = $(elementsNeeded.DOM).find('strong.product-price').first().text().trim().replace(/€/g, '.');
	if (payload.itemPrice.endsWith('.')) {
		 payload.itemPrice = payload.itemPrice.replace(/\./g, '');
	}

	payload.itemCurrency = "EUR";
	payload.itemName = $(elementsNeeded.DOM).find('span[itemprop=name]').first().text().trim();
});

//TODO: replace with api
SPAPI.addStoreFunc("aliexpresscom", (payload, elementsNeeded) => {
	var timeout = 2000;
	var dynamic = true;

	payload.storeName = "aliexpresscom";
	payload.itemID = "";
	payload.itemCurrency = $("span.currency").text();
	payload.itemName = $("h1.product-name").text().trim();

	//Do NOT use dynamic things if there is no price range indicated by " - "
	if(!$(elementsNeeded.DOM).find(".p-price").last().text().includes(" - ")){
		console.log("There is no selector on page. Not Doing dynamic loading.");
		dynamic = false;

		payload.itemID = getLastUrlPart(elementsNeeded.pathname);
		payload.itemPrice = $(elementsNeeded.DOM).find(".p-price").last().text().replace(/,/g, ".");

		return;
	}


	//processAliexpress checks for a new item, and sends new data when item changed
	var processAliexpress = () => {
		if (payload.itemID !== getLastUrlPart(elementsNeeded.pathname)+$(elementsNeeded.DOM).find("#skuAttr").attr("value")) {
			payload.itemID = getLastUrlPart(elementsNeeded.pathname)+$(elementsNeeded.DOM).find("#skuAttr").attr("value");
			payload.itemPrice = $(elementsNeeded.DOM).find(".p-price").last().text().replace(/,/g, ".");
			payload.itemName = $(elementsNeeded.DOM).find("h1.product-name").text().trim();

			if (payload.itemPrice.includes(" - "))
				return;

			SPAPI.sendPayload(payload);
		}
	};

	if (dynamic)
	{
		setInterval(() => {
			processAliexpress();
		},
		timeout);
	}

});