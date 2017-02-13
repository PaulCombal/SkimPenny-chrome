$(document).ready(function() {
	
	//First thing to do: detect whe website we're browsing
	if(document.domain.endsWith("ldlc.com")){
		processLDLC();
	}
	else if (document.domain.endsWith("shop.hardware.fr")) {
		processHardwarefr();
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

function processLDLC(){
	var price = $("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');
	sendToDB("LDLC", window.location.pathname /*+ window.location.search*/, price);
}

function processHardwarefr(){
	var price = $("#stockPriceBlock .prix").text().replace(/€/g, '.').trim();
	sendToDB("hardwarefr", window.location.pathname /*+ window.location.search*/, price);
}