chrome.runtime.onMessage.addListener((request, sender, callback) => {
    if (request.action == "showPageAction") {
    	console.log("HEHEH");
    	chrome.pageAction.show(sender.tab.id);
    }
    else if (request.action == "xhttp") {
		$.post("http://waxence.fr/skimpenny/add.php", 
			{
				store : request.storeName,
				product : request.productPage,
				price : request.price
			},
			logAddRecordResponse,
			'text')
		.fail(function(){
			console.log("Error sending request :(");
		});

        return true; // prevents the callback from being called too early on return
    }
});

function logAddRecordResponse(response){
	console.log(response);
}