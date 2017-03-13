$(document).ready(function() {
	
	//First thing to do: detect whe website we're browsing
	if(document.domain.endsWith("ldlc.com")){
		processLDLC();
	}
	else if (document.domain.endsWith("shop.hardware.fr")) {
		setTimeout(processHardwarefr, 2000);
	}
	else if (document.domain.endsWith("amazon.com")) {
		processAmazoncom();
		processAmazoncomAjaxEvents();
	}
	else if (document.domain.endsWith("amazon.fr")) {
		processAmazonfr();
		processAmazonfrAjaxEvents();
	}
	else if (document.domain.endsWith("amazon.co.uk")) {
		processAmazoncouk();
		processAmazoncoukAjaxEvents();
	}
	else if (document.domain.endsWith("cdiscount.com")) {
		processCdiscount();
	}
	else if (document.domain.endsWith("conrad.fr")) {
		processConrad();
	}
	else if (document.domain.endsWith("store.nike.com")) {
		processNike();
		processNikeAjaxEvents();
	}
	else if (document.domain.endsWith("grosbill.com")) {
		processGrosbill();
	}
	else if (document.domain.endsWith("undiz.com")) {
		processUndiz();
	}
	else if (document.domain.endsWith("caseking.de")) {
		processCasekingde();
	}
	else if (document.domain.endsWith("newegg.com")) {
		processNeweggcom();
	}
	else if (document.domain.endsWith("zalando.fr")) {
		processZalandofr();
	}
	else if (document.domain.endsWith("gearbest.com")) {
		setTimeout(processGearbestcom, 2000);
	}
	else if (document.domain.endsWith("topachat.com")) {
		processTopachatcom();
	}
	else if (document.domain.endsWith("rueducommerce.fr")) {
		processRueducommercefr();
	}
	else if (document.domain.endsWith("romwe.com") && !document.domain.startsWith("www")) { // www. -> english site
		processRomwe();
	}
});

//If the popup is opened, it will ask for the item name
//Here we answer what th item name is
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "getItemName"){
	 	if(request.store == "LDLC"){
			sendResponse({itemName: $("span.fn.designation_courte").first().text().trim()});
		}
		else if(request.store == "hardwarefr"){
			sendResponse({itemName: $("#description h1").first().text().trim()});
		}
		else if(request.store == "amazoncom"){
			sendResponse({itemName: $("span#productTitle").text().trim()});
		}
		else if(request.store == "amazonfr"){
			sendResponse({itemName: $("span#productTitle").text().trim()});
		}
		else if(request.store == "amazoncouk"){
			sendResponse({itemName: $("span#productTitle").text().trim()});
		}
		else if(request.store == "cdiscount"){
			sendResponse({itemName: $("h1[itemprop=name").text().trim()});
		}
		else if(request.store == "conradfr"){
			sendResponse({itemName: $("a.fn[name=head_detail").text().trim()});
		}
		else if(request.store == "nike"){
			sendResponse({itemName: $('h1.exp-product-title.nsg-font-family--platform').text().trim()});
		}
		else if(request.store == "grosbill"){
			sendResponse({itemName: $('h1[itemprop=name]').text().trim()});
		}
		else if(request.store == "gearbestcom"){
			sendResponse({itemName: $('h1').first().text().trim()});
		}
		else if(request.store == "undiz"){
			sendResponse({itemName: $('p.product-name').text().trim()});
		}
		else if(request.store == "zalandofr"){
			sendResponse({itemName: $(".z-vegas-ui_text.z-vegas-ui_text-vegas-detail-title").text().trim()});
		}
		else if(request.store == "romwe"){
			sendResponse({itemName: $('h1').text().trim()});
		}
		else if(request.store == "casekingde"){
			sendResponse({itemName: $('h1').clone().children().remove().end().text().trim()});
		}
		else if(request.store == "neweggcom"){
			sendResponse({itemName: $('#grpDescrip_h').text().trim()});
		}
		else if(request.store == "topachatcom"){
			sendResponse({itemName: $("h1[itemprop=name").text().trim()});
		}
		else if(request.store == "rueducommercefr"){
			sendResponse({itemName: $("h1 span[itemprop=name").text().trim()});
		}
		else{
			sendResponse({itemName: "Unknown store"});
		}
	}
	else
		sendResponse({error: "Unexpected message on skimpenny.js"});
});

//SendToDB just tells chrome to send a post request
function sendToDB(storeName, productPage, price){
	//console.log(storeName);
	//console.log(productPage);
	//console.log(price);

	//Because of security reasons, we better not send the request from the loaded page
	//We're gonna tell chrome to send the request from the background script

	chrome.runtime.sendMessage({
	    action: 'xhttp',
	    storeName: storeName,
	    productPage: productPage,
	    price: price
	});
}

////////////////////////
//STORE SPECIFIC FUNCS//
////////////////////////

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

function processLDLC(){
	//Only triggers when browsing /fiche url!!
	var price = $("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');
	sendToDB("LDLC", window.location.pathname /*+ window.location.search*/, price);
}

function processHardwarefr(){
	//Only triggers when browsing /fiche url!!
	var price = $("#stockPriceBlock .prix .new-price").text().replace(/€/g, '.').trim();
	if (price.length === 0) {
		price = $("#stockPriceBlock .prix").text().replace(/€/g, '.').trim();
	}

	sendToDB("hardwarefr", window.location.pathname, price);
}

function processCdiscount() {
	//Only triggers when last url part starts with f-, as described in manifest
	var lasturlpart = getLastUrlPart(window.location.pathname);

	//The following line is completely unnecesary
	if (lasturlpart.startsWith("f-")) {
		var price = $("span.price[itemprop=price]").attr("content");
		sendToDB("cdiscount", lasturlpart, price);
	}
	else
	{
		console.log("random error occurred");
	}
}

function processConrad() {
	//Only triggers on product page, as described in manifest
	var lasturlpart = window.location.pathname;
	lasturlpart = lasturlpart.substr(lasturlpart.lastIndexOf('/') + 1);

	var price = $("span.price").text().trim();
	sendToDB("conradfr", lasturlpart, price);
}

function processNike() {
	var urlid = window.location.pathname;
	urlid = getUrlPart(urlid, 5);

	var price = $('.exp-pdp-product-price span').last().text().replace("€", " ").replace(",", ".").trim();
	sendToDB("nike", urlid, price);
}

function processNikeAjaxEvents() {
	var DOMTimeout = null;
	$('.exp-pdp-main-pdp-content').bind('DOMNodeInserted', function() {
		if(DOMTimeout)
			clearTimeout(DOMTimeout);

		DOMTimeout = setTimeout(function() { processNike(); console.log('processNike called'); }, 200);
	});
}

function processGrosbill() {
	var urlid = getLastUrlPart(window.location.pathname);

	var price = $('.datasheet_price_and_strike_price_wrapper div').first().text().trim().replace("€", ".");
	sendToDB("grosbill", urlid, price);
}

function processUndiz() {
	var urlid = getLastUrlPart(window.location.pathname);

	var price = $('span.price-sales.wishPrice').first().text().trim().replace(/ €/g, "").replace(/,/g, ".");
	sendToDB("undiz", urlid, price);
}

function processRomwe() {
	var lasturlpart = getLastUrlPart(window.location.pathname);

	var price = $("span#spanSubTotal_").last().text().trim().replace(/€/g, "");
	//console.log("prid " + price + "  " + lasturlpart);
	sendToDB("romwe", lasturlpart, price);
}

function processAmazonfr() {
	var pathname = window.location.pathname;
	if (pathname.startsWith("/dp/"))
		pathname = getUrlPart(pathname, 2);
	else
		pathname = getUrlPart(pathname, 3);
	//This may be correct, but in some cases this is also the last part 
	//So we have to remove additional anchors/GET parameters

	var price = $('span#priceblock_dealprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
	if (price.length === 0)
		price = $('span#priceblock_saleprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
	if (price.length === 0)
		price = $('span#priceblock_ourprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");

	console.log("prid " + price + "  " + pathname);
	sendToDB("amazonfr", pathname, price);
}

function processAmazonfrAjaxEvents() {
	var pathname = window.location.pathname;
	setInterval(()=>{
		if (pathname !== window.location.pathname) {
			pathname = window.location.pathname;
			processAmazonfr();
		}
	},
	2000);
}

function processAmazoncom() {
	var pathname = window.location.pathname;
	if (pathname.startsWith("/dp/"))
		pathname = getUrlPart(pathname, 2);
	else
		pathname = getUrlPart(pathname, 3);
	//This may be correct, but in some cases this is also the last part 
	//So we have to remove additional anchors/GET parameters

	var price = $('span#priceblock_saleprice').text().trim().replace(/\$/g, "");
	if (price.length === 0)
		price = $('span#priceblock_dealprice').text().trim().replace(/\$/g, "");
	if (price.length === 0)
		price = $('span#priceblock_ourprice').text().trim().replace(/\$/g, "");

	console.log("prid " + price + "  " + pathname);
	sendToDB("amazoncom", pathname, price);
}

function processAmazoncomAjaxEvents() {
	var pathname = window.location.pathname;
	setInterval(()=>{
		if (pathname !== window.location.pathname) {
			pathname = window.location.pathname;
			processAmazoncom();
		}
	},
	2000);
}

function processAmazoncouk() {
	var pathname = window.location.pathname;
	if (pathname.startsWith("/dp/"))
		pathname = getUrlPart(pathname, 2);
	else
		pathname = getUrlPart(pathname, 3);
	//This may be correct, but in some cases this is also the last part 
	//So we have to remove additional anchors/GET parameters

	var price = $('span#priceblock_saleprice').text().trim().replace(/£/g, "");
	if (price.length === 0)
		price = $('span#priceblock_dealprice').text().trim().replace(/£/g, "");
	if (price.length === 0)
		price = $('span#priceblock_ourprice').text().trim().replace(/£/g, "");

	sendToDB("amazoncouk", pathname, price);
}

function processAmazoncoukAjaxEvents() {
	var pathname = window.location.pathname;
	setInterval(()=>{
		if (pathname !== window.location.pathname) {
			pathname = window.location.pathname;
			processAmazoncouk();
		}
	},
	2000);
}


function processZalandofr() {
	var lasturlpart = getLastUrlPart(window.location.pathname);

	var price = $("span.zvui_price_priceWrapper").last().text().trim().replace(/\s+€/g, "").replace(/,/g, ".");
	sendToDB("zalandofr", lasturlpart, price);
}

function processNeweggcom() {
	var lasturlpart = window.location.search.match(/N([A-Z]|[0-9]){14}/g);
	if(lasturlpart.length === 0){
		console.log("An error occurred getting the ID of this item, please let the devs know about it!");
		return;
	}
	lasturlpart = lasturlpart[0];

	var price = $("#landingpage-price li.price-current").last().text().trim().replace(/\$/g, "");
	sendToDB("neweggcom", lasturlpart, price);
}

function processCasekingde() {
	var lasturlpart = getLastUrlPart(window.location.pathname);

	var price = $(".article_details_price2").first().find("strong").text().trim().replace(/\s+€\*/g, "").replace(/,/g, ".");
	if (price.length === 0)
		price = $(".article_details_price").first().text().trim().replace(/\s+€\*/g, "").replace(/,/g, ".");

	sendToDB("casekingde", lasturlpart, price);
}

function processTopachatcom() {
	var lasturlpart = getLastUrlPart(window.location.pathname);
	var price = $("span.priceFinal[itemprop=price]").attr("content");

	sendToDB("topachatcom", lasturlpart, price);
}

function processRueducommercefr() {
	var lasturlpart = getLastUrlPart(window.location.pathname);
	var price = $("meta[itemprop=price]").attr("content").replace(/,/g, ".");

	console.log("prid " + price + "  " + lasturlpart);
	sendToDB("rueducommercefr", lasturlpart, price);
}

function processGearbestcom() {
	var lasturlpart = getLastUrlPart(window.location.pathname);

	var price = $("#unit_price").text().trim();
	if (price.includes("€")) {
		price = price.replace(/€/g, "");

		sendToDB("gearbestcom", lasturlpart, price);
	}
	else{
		console.log("For now, this extension only supports pricing in euros. Contact us if you desire support for another currency!");
	}
}