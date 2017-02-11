$(document).ready(function() {
	//First thing to do: detect whe website we're browsing

	if(document.domain.endsWith("ldlc.com")){
		processLDLC();
	}
}); //End of document.ready callback

function sendToDB(storeName, productPage, price){
	console.log(storeName);
	console.log(productPage);
	console.log(price);

	$.post("http://scroogealpha.esy.es/add.php", 
		{
			store : storeName,
			product : productPage,
			price : price
		},
		requestResult,
		'text')
	.fail(function(){
		console.log("Error sending request :(");
	});

}

function requestResult(html){
	console.log("Scrooge answered with:");
	console.log(html);
}

function processLDLC(){
	var price = $(document).find("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');
	sendToDB("LDLC", window.location.pathname /*+ window.location.search*/, price);
	//console.log("Sent to db " + window.location.pathname + " " + price);
}