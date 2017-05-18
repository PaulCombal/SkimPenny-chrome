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

SPAPI.addStoreFunc("cdiscount", (payload, elementsNeeded) => {
	if (elementsNeeded.isOnDocument) {
		payload.storeName = "cdiscount";
		payload.itemID = getLastUrlPart(elementsNeeded.pathname);
		payload.itemPrice = $("span.price[itemprop=price]").attr("content");
		payload.itemCurrency = "EUR";
		payload.itemName = $("h1[itemprop=name").text().trim();
	}
	else{
		//Background, let's use cdiscount API
		//TODO
	}
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
	//OK fuck this shit continuing later. How bad could this site be possibly coded?
	//payload.itemCurrency = $(elementsNeeded.DOM).find(".three.outer").attr("atr1");
	
	var price = $(elementsNeeded.DOM).find("span#spanSubTotal_").last().text().trim().match(/[0-9]{1,5}\.[0-9]{2}/g);
	
	if (price === null) {

		console.log(payload.itemCurrency);
		
		//Might be roubles, too lazy to find right regex gonna handle it manually
		if (payload.itemCurrency === "RUB") {
		
			price = $(elementsNeeded.DOM).find("span#spanSubTotal_").last().text().trim().match(/[0-9]+/g);
			
			if (price === null) {
				console.log("Couldn't find a price.");
				return;
			}
		}
		else{
			console.log("Couldn't find a price");
			return;
		}
	}

	payload.itemPrice = price[0];
	payload.storeName = "romwe";
	payload.itemID = getLastUrlPart(elementsNeeded.pathname);
	payload.itemName = $('h1').text().trim();
});