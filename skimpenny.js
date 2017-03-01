$(document).ready(function() {
	
	//First thing to do: detect whe website we're browsing
	if(document.domain.endsWith("ldlc.com")){
		processLDLC();
	}
	else if (document.domain.endsWith("shop.hardware.fr")) {
		processHardwarefr();
	}
	else if (document.domain.endsWith("cdiscount.com")) {
		processCdiscount();
	}
	else if (document.domain.endsWith("conrad.fr")) {
		processConrad();
	}
	else if (document.domain.endsWith("store.nike.com")) {
		processNike();
	}
	else if (document.domain.endsWith("grosbill.com")) {
		processGrosbill();
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
	    method: 'POST',
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
	var lasturlpart = window.location.pathname;
	lasturlpart = lasturlpart.substr(lasturlpart.lastIndexOf('/') + 1);

	//The following line is completely unnecesary
	if (lasturlpart.startsWith("f-")) {
		var price = $("span.price[itemprop=price]").attr("content");
		console.log("Price then ID - " + price + " - " + lasturlpart);
		sendToDB("cdiscount", lasturlpart, price);
	}
}

function processConrad() {
	//Only triggers on product page, as described in manifest
	var lasturlpart = window.location.pathname;
	lasturlpart = lasturlpart.substr(lasturlpart.lastIndexOf('/') + 1);

	var price = $("span.price").text().trim();
	console.log("Price then ID - " + price + " - " + lasturlpart);
	sendToDB("conradfr", lasturlpart, price);
}

function processNike() {
	var urlid = window.location.pathname;
	urlid = getUrlPart(urlid, 5);

	var price = $('.exp-pdp-product-price span').last().text().replace("€", " ").replace(",", ".").trim();
	console.log("Price then ID - " + price + " - " + urlid);
	sendToDB("nike", urlid, price);
}

function processGrosbill() {
	var urlid = window.location.pathname;
	urlid = getUrlPart(urlid, 1);

	var price = $('.datasheet_price_and_strike_price_wrapper div').first().text().trim().replace("€", ".");
	console.log("Price then ID - " + price + " - " + urlid);
	sendToDB("grosbill", urlid, price);
}