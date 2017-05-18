$(document).ready(function() {

	//First, we have to make sure this script is injected in a product page.
	//It should always be, but with the chrome manifest regex, it's not always possible
	let matches = [	
					{storeID: "LDLC", regex: /.*:\/\/.*ldlc.com\/fiche\/.*(\.html)$/g},
					{storeID: "hardwarefr", regex: /.*:\/\/.*shop\.hardware\.fr\/fiche\/.*(\.html)$/g},
					{storeID: "amazonfr", regex: /.*:\/\/www\.amazon\.fr\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g},
					{storeID: "amazoncom", regex: /.*:\/\/www\.amazon\.com\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g},
					{storeID: "amazoncouk", regex: /.*:\/\/www\.amazon\.co\.uk\/((.*\/)?dp\/|gp\/product\/|d\/.*\/.*\/)([0-9]|[A-Z]){10}(\/.*)?/g},
					{storeID: "cdiscount", regex: /.*:\/\/.*cdiscount\.com\/.*(\/f-[0-9]+-.*\.html((#|\?).*)?)$/g},
					{storeID: "topachatcom", regex: /.*:\/\/www\.topachat\.com\/pages\/detail2_cat_.*\.html(((#|\?).*)?)$/g},
					{storeID: "conradfr", regex: /.*:\/\/.*conrad\.fr\/ce\/fr\/product\/[0-9]+\/.+/g},
					{storeID: "nike", regex: /.*\/\/store\.nike\.com\/.*\/pgid-[0-9]{8}/g},
					{storeID: "grosbill", regex: /.*\/\/www\.grosbill\.com\/4-.*/g},
					{storeID: "undiz", regex: /.*\/\/www\.undiz\.com\/.*\/.*\/.*([0-9]\.html(.*)?)$/g},
					{storeID: "romwe", regex: /.*(fr|es|de)\.romwe\.com\/.*-p-[0-9]*-cat-[0-9]*\.html.*/g},
					{storeID: "zalandofr", regex: /.*\/\/www\.zalando\.fr\/.*\.html.*/g},
					{storeID: "rueducommercefr", regex: /.*\/\/www\.rueducommerce\.fr\/(m\/ps\/mpid:MP-.*|.*\/.*\/.*\/.*\/.*\.htm(#.*)?)/g},
					{storeID: "gearbestcom", regex: /.*\/\/www\.gearbest\.com\/.*\/pp_[0-9]{6}\.html.*/g},
					{storeID: "neweggcom", regex: /.*\/\/www\.newegg\.com\/Product\/Product\.aspx\?(i|I)tem=.*/g},
					{storeID: "materielnet", regex: /.*\/\/www\.materiel\.net\/.*\/.*[0-9]{6}\.html.*/g},
					{storeID: "aliexpresscom", regex: /.*\/\/.*\.aliexpress\.com\/item\/.*\/[0-9]{9,12}\.html.*/g},
					{storeID: "casekingde", regex: /.*\/\/www\.caseking\.de\/.*\.html.*/g},
					{storeID: "fnaccom", regex: /.*\/\/(livre|www|musique|jeux-video|video).*fnac\.com\/.*(a|mp)[0-9]{5,10}.*/g}
				];

	for (let i in matches) {
		if (window.location.href.match(matches[i].regex)){
			
			//We're definitely in a product page.
			var storeID = matches[i].storeID;
			var generalParameters = {storeName: storeID, updateFavorite: true, feedPopup: true};

			switch(storeID)
			{
				//=========== Typically stores that show one product per page and don't have an API ===============
				case "LDLC":
				case "hardwarefr":
				case "conradfr":
				case "grosbill":
				case "undiz":
				case "casekingde":
				case "zalandofr":
				case "topachatcom":
				case "rueducommercefr":
				case "materielnet":
					SPAPI.sendSimpleRecord(generalParameters, {DOM: document, pathname: window.location.pathname});
					break;

				case "neweggcom":
					SPAPI.sendSimpleRecord(generalParameters, {DOM: document, search: window.location.search});
					break;

				/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */

				

				//============ Typically stores that show one product per page but have an API =====================
				case "cdiscount":
					SPAPI.sendSimpleRecord(generalParameters, {isOnDocument: true, pathname: window.location.pathname});
					break;

				/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */



				
				// =========== Typically stores that change URL when another color/size is selected ================
				case "amazoncom":
				case "amazonfr":
				case "amazoncouk":
				case "nike":
					var pathname = "";
					setInterval(()=>{
						if (pathname !== window.location.pathname) {
							pathname = window.location.pathname;
					
							SPAPI.sendSimpleRecord(generalParameters, {DOM: document, pathname: window.location.pathname});
						}
					},
					2000);
					break;

				/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */


				// ================= Store that change currency/price without updating the URL =====================
				case "gearbestcom":
					var currency = "";

					setInterval(() => {
						var newCurrency = $("span.currency").text();
						if (currency !== newCurrency) {
							currency = newCurrency;
					
							SPAPI.sendSimpleRecord(generalParameters, {DOM: document, pathname: window.location.pathname});
						}
					},
					2000);
					break;

				case "romwe":
					var currency = "";

					setInterval(() => {
						var newCurrency = $(".three.outer").attr("atr1")
						if (currency !== newCurrency) {
							currency = newCurrency;
					
							SPAPI.sendSimpleRecord(generalParameters, {DOM: document, pathname: window.location.pathname});
						}
					},
					2000);
					break;

				/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */

			}

		}
	}
});


//payload will contain the data to send
//Default values are:
//timeout: milliseconds to wait before sendig the data (pretty useless i guess, unless you use it otherwise)
//executeOnLoad: if you need to wait for ajax events, or send multiple items in one page,
// you can set this to false. This will allow you to use the sendPayload function directly.
var payload = {};
payload.timeout = 0;
payload.executeOnLoad = true;


//This function gathers all the data about the item, and stores in in payload.
//Payload MUST contain the following values:
// storeName: The store name
// itemID: the unique identifier of the item
// itemPrice: the price of the item (format NNNNN.NN)
// itemCurrency: the currency of the item ("EUR|USD|GBP|AUD|CAD|CHF|HKD|NZD|JPY|RUB|BRL|CLP|NOK|DKK|SEK|KRW|ILS|COP|MXN|PEN|THB|IDR|UAH|PLN")
// itemName: the name to display on the popup
function sendItemData(){

	if(storeDomainIs("ldlc.com")){
		// payload.storeName = "LDLC";
		// payload.itemID = window.location.pathname;
		// payload.itemPrice = $("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');
		// payload.itemCurrency = "EUR";
		// payload.itemName = $("span.fn.designation_courte").first().text().trim();
	}
	else if (storeDomainIs("shop.hardware.fr")) {
		// payload.storeName = "hardwarefr";
		// payload.itemID = window.location.pathname;
		// payload.itemCurrency = "EUR";
		// payload.itemName = $("#description h1").first().text().trim();
		// payload.itemPrice = $("meta[itemprop=price]").attr("content");
	}
	else if (storeDomainIs("amazon.com")) {
		//The idea here is to check every 2 seconds if the URL changed
		//We first set the URL to nothing to make it send the first record
		//as soon as the page is loaded
		//Note that it might not work with other stores as some don't update their URL

		//Set the loop/delay parameters
		var pathname = "";
		payload.executeOnLoad = false;
		payload.timeout = 2000;

		payload.storeName = "amazoncom";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;

				//Item is updated, got to update the payload data

				if (window.location.pathname.startsWith("/dp/"))
					payload.itemID = getUrlPart(window.location.pathname, 2);
				else if (window.location.pathname.startsWith("/d/"))
					payload.itemID =  getUrlPart(window.location.pathname, 4);
				else
					payload.itemID =  getUrlPart(window.location.pathname, 3);

				payload.itemPrice = $('span#priceblock_saleprice').text().trim().replace(/(\$|,)/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_dealprice').text().trim().replace(/(\$|,)/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_ourprice').text().trim().replace(/(\$|,)/g, "");

				payload.itemName = $("span#productTitle").text().trim();
				payload.itemCurrency = "USD";

				sendPayload();
			}
		},
		payload.timeout);
	}
	else if (storeDomainIs("amazon.fr")) {
		var pathname = "";
		payload.executeOnLoad = false;
		payload.timeout = 2000;

		payload.storeName = "amazonfr";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;

				//Item is updated, got to update the payload data

				if (window.location.pathname.startsWith("/dp/"))
					payload.itemID = getUrlPart(window.location.pathname, 2);
				else if (window.location.pathname.startsWith("/d/"))
					payload.itemID =  getUrlPart(window.location.pathname, 4);
				else
					payload.itemID =  getUrlPart(window.location.pathname, 3);

				payload.itemPrice = $('span#priceblock_dealprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_saleprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_ourprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");

				payload.itemName = $("span#productTitle").text().trim();
				payload.itemCurrency = "EUR";

				sendPayload();
			}
		},
		payload.timeout);
	}
	else if (storeDomainIs("amazon.co.uk")) {

		var pathname = "";
		payload.executeOnLoad = false;
		payload.timeout = 2000;

		payload.storeName = "amazoncouk";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;

				//Item is updated, got to update the payload data

				if (window.location.pathname.startsWith("/dp/"))
					payload.itemID = getUrlPart(window.location.pathname, 2);
				else if (window.location.pathname.startsWith("/d/"))
					payload.itemID =  getUrlPart(window.location.pathname, 4);
				else
					payload.itemID =  getUrlPart(window.location.pathname, 3);

				payload.itemPrice = $('span#priceblock_saleprice').text().trim().replace(/(£|,)/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_dealprice').text().trim().replace(/(£|,)/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_ourprice').text().trim().replace(/(£|,)/g, "");

				payload.itemName = $("span#productTitle").text().trim();
				payload.itemCurrency = "GBP";

				sendPayload();
			}
		},
		payload.timeout);
	}
	else if (storeDomainIs("cdiscount.com")) {
		payload.storeName = "cdiscount";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $("span.price[itemprop=price]").attr("content");
		payload.itemCurrency = "EUR";
		payload.itemName = $("h1[itemprop=name").text().trim();
	}
	else if (storeDomainIs("conrad.fr")) {
		payload.storeName = "conradfr";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $("span.price").text().trim();
		payload.itemCurrency = "EUR";
		payload.itemName = $("a.fn[name=head_detail").text().trim();
	}
	else if (storeDomainIs("store.nike.com")) {
		var DOMTimeout = null;
		payload.storeName = "nike";
		payload.executeOnLoad = false;
		payload.timeout = 200;

		var processNike = ()=>{
			var priceString = $('.exp-pdp-product-price span').last().text().trim();
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

			payload.itemID = getUrlPart(window.location.pathname, 5);
			payload.itemName = $('h1.exp-product-title.nsg-font-family--platform').text().trim();

			sendPayload();
		};

		processNike();

		$('.exp-pdp-main-pdp-content').bind('DOMNodeInserted', () => {
			if(DOMTimeout)
				clearTimeout(DOMTimeout);

			DOMTimeout = setTimeout(() => { processNike(); console.log('processNike called'); }, payload.timeout);
		});

	}
	else if (storeDomainIs("grosbill.com")) {
		payload.storeName = "grosbill";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $('.datasheet_price_and_strike_price_wrapper div').first().text().trim().replace("€", ".");
		payload.itemCurrency = "EUR";
		payload.itemName = $('h1[itemprop=name]').text().trim();
	}
	else if (storeDomainIs("undiz.com")) {
		payload.storeName = "undiz";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $('span.price-sales.wishPrice').first().text().trim().replace(/ €/g, "").replace(/,/g, ".");
		payload.itemCurrency = "EUR";
		payload.itemName = $('p.product-name').text().trim();
	}
	else if (storeDomainIs("caseking.de")) {
		payload.storeName = "casekingde";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $(".article_details_price2").first().find("strong").text().trim().replace(/\s+€\*/g, "").replace(/,/g, ".");
		if (payload.itemPrice.length === 0)
			payload.itemPrice = $(".article_details_price").first().text().trim().replace(/\s+€\*/g, "").replace(/,/g, ".");
		payload.itemCurrency = "EUR";
		payload.itemName = $('h1').clone().children().remove().end().text().trim();
	}
	else if (storeDomainIs("newegg.com")) {
		payload.storeName = "neweggcom";
		payload.itemID = window.location.search.match(/N([A-Z]|[0-9]){14}/g);
		if(payload.itemID.length === 0){
			console.log("An error occurred getting the ID of this item, please let the devs know about it!");
			return;
		}
		payload.itemID = payload.itemID[0];
		payload.itemPrice = $("#landingpage-price li.price-current").last().text().trim().replace(/\$/g, "");
		payload.itemCurrency = "USD";
		payload.itemName = $('#grpDescrip_h').text().trim();
	}
	else if (storeDomainIs("zalando.fr")) {
		payload.storeName = "zalandofr";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $("span.zvui_price_priceWrapper").last().text().trim().replace(/\s+€/g, "").replace(/,/g, ".");
		payload.itemCurrency = "EUR";
		payload.itemName = $(".z-vegas-ui_text.z-vegas-ui_text-vegas-detail-title").text().trim();
	}
	else if (storeDomainIs("gearbest.com")) {
		payload.executeOnLoad = false;
		payload.timeout = 2000;
		payload.storeName = "gearbestcom";
		payload.itemName = $('h1').first().text().trim();
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemCurrency = "";

		//Updates price and currency, then sends data
		var processGearbest = ()=>{
			payload.itemPrice = $("#unit_price").text().trim().match(/[0-9]{0,5}(\.[0-9]{1,2})?$/g);
			if (payload.itemPrice === null) {
				console.log("No price found!");
				return;
			}
			payload.itemPrice = payload.itemPrice[0];
			payload.itemCurrency = $("span.currency").text().trim();

			sendPayload();
		};

		setInterval(()=>{
			//If currency set, or changed
			if (payload.itemCurrency != $("span.currency").text().trim()) {
				processGearbest();
			}
		},
		payload.timeout);

	}
	else if (storeDomainIs("topachat.com")) {
		payload.storeName = "topachatcom";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $("span.priceFinal[itemprop=price]").attr("content");
		payload.itemCurrency = "EUR";
		payload.itemName = $("h1[itemprop=name").text().trim();
	}
	else if (storeDomainIs("rueducommerce.fr")) {
		payload.storeName = "rueducommercefr";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $("meta[itemprop=price]").attr("content").replace(/,/g, ".");
		payload.itemCurrency = "EUR";
		payload.itemName = $("h1 span[itemprop=name").text().trim();
	}
	else if (storeDomainIs("materiel.net")) {
		payload.storeName = "materielnet";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $("#ProdInfoPrice span").text().trim().replace(/€ TTC/g, "").replace(/,/g, ".").replace(/\s+/g, "");
		payload.itemCurrency = "EUR";
		payload.itemName = $("#breadcrumb li").last().text().trim();
	}
	else if (storeDomainIs("romwe.com") && !document.domain.startsWith("www")) { // www. -> english site
		payload.storeName = "romwe";
		payload.itemID = getLastUrlPart(window.location.pathname);
		payload.itemPrice = $("span#spanSubTotal_").last().text().trim().replace(/€/g, "");
		payload.itemCurrency = "EUR";
		payload.itemName = $('h1').text().trim();
	}
	//***********FNAC STORE****************
	else if (storeDomainIs("fnac.com")) { // www. -> english site
		payload.storeName = "fnaccom";
		payload.itemID = window.location.pathname.match(/\/[a-z]{1,5}[0-9]{5,10}\//g);
		if (payload.itemID === null) {
			console.log("No price found!");
			return;
		}
		payload.itemID = payload.itemID[0];
		payload.itemPrice = $('strong.product-price').first().text().trim().replace(/€/g, '.');

		if (payload.itemPrice.endsWith('.')) {
			 payload.itemPrice = payload.itemPrice.replace(/\./g, '');
		}

		payload.itemCurrency = "EUR";
		payload.itemName = $('span[itemprop=name]').first().text().trim();
	}
	//***********ALIEXPRESS STORE***************
	else if (storeDomainIs("aliexpress.com")) {
		payload.executeOnLoad = false;
		payload.timeout = 2000;
		payload.storeName = "aliexpresscom";
		payload.itemID = "";
		payload.itemCurrency = $("span.currency").text();
		payload.itemName = $("h1.product-name").text().trim();
		payload.dynamic = true; //Only used for aliexpress

		//Do NOT use dynamic things if there is no price range indicated by " - "
		if(!$(".p-price").last().text().includes(" - ")){
			console.log("There is no selector on page. Not Doing dynamic loading.");
			payload.dynamic = false;

			payload.itemID = getLastUrlPart(window.location.pathname);
			payload.itemPrice = $(".p-price").last().text().replace(/,/g, ".");

			sendPayload();
		}


		//processAliexpress checks for a new item, and sends new data when item changed
		var processAliexpress = () => {
			if (payload.itemID !== getLastUrlPart(window.location.pathname)+$("#skuAttr").attr("value")) {
				payload.itemID = getLastUrlPart(window.location.pathname)+$("#skuAttr").attr("value");
				payload.itemPrice = $(".p-price").last().text().replace(/,/g, ".");
				payload.itemName = $("h1.product-name").text().trim();

				if (payload.itemPrice.includes(" - "))
					return;

				sendPayload();
			}
		};

		if (payload.dynamic)
		{
			setInterval(() => {
				processAliexpress();
			},
			payload.timeout);
		}

	}
	else{
		console.log("Couldnt find appropriate store :(");
		return;
	}

	if(payload.executeOnLoad){
		setTimeout(()=>{
			sendPayload();},
		payload.timeout);
	}
}


