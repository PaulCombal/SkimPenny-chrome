$(document).ready(function() {
	//First thing to do: detect whe website we're browsing

	if(document.domain.includes("ldlc.com")){
		processLDLC();
	}
}); //End of document.ready callback

function sendToDB(storeName, productPage, price){
	console.log(storeName);
	console.log(productPage);
	console.log(price);
}

function processLDLC(){
	var price = $(document).find("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');
	sendToDB("LDLC", window.location.href, price);
}