$(document).ready(function() {
	
	//First thing to do: detect whe website we're browsing
	if(document.domain.endsWith("ldlc.com")){
		processLDLC();
	}
	else if (document.domain.endsWith("shop.hardware.fr")) {
		processHardwarefr();
	}
	else if (document.domain.endsWith("amazon.fr")) {
		processAmazonfr();
		processAmazonfrAjaxEvents();
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
		else if(request.store == "amazonfr"){
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
		else if(request.store == "undiz"){
			sendResponse({itemName: $('p.product-name').text().trim()});
		}
		else if(request.store == "romwe"){
			sendResponse({itemName: $('h1').text().trim()});
		}
		else{
			sendResponse({itemName: "Unknown store"});
		}
	}
	else
		sendResponse({error: "Unexpected message on scrooje.js"});
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
	var price = $("#stockPriceBlock .prix").text().replace(/€/g, '.').trim();
	sendToDB("hardwarefr", window.location.pathname /*+ window.location.search*/, price);
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
	var shorturl = getUrlPart(window.location.pathname, 3);
	//This may be correct, but in some cases this is also the last part 
	//So we have to remove additional anchors/GET parameters

	var n = shorturl.indexOf('#');
	shorturl = shorturl.substring(0, n != -1 ? n : shorturl.length);

	n = shorturl.indexOf('?');
	shorturl = shorturl.substring(0, n != -1 ? n : shorturl.length);

	var price = $('span#priceblock_ourprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".");
	//console.log("prid " + price + "  " + shorturl);
	sendToDB("amazonfr", shorturl, price);
}

function processAmazonfrAjaxEvents() {
	var title = $("input#cerberus-metrics").attr("value");
	setInterval(()=>{
		if (title !== $("input#cerberus-metrics").attr("value")) {
			title = $("input#cerberus-metrics").attr("value");
			processAmazonfr();
		}
	},
	1000);
}
