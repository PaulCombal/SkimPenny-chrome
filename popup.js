$(document).ready(function() {
	//First thing to do: detect whe website we're browsing
	//also check the url from the tab, we can't use window, 
	//as it will return the popup's location
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		if(tabs[0].url.includes("ldlc.com/fiche/")){
			processLDLC(tabs[0].url);
		}
		else if(tabs[0].url.includes("shop.hardware.fr/fiche/")){
			processHardwarefr(tabs[0].url);
		}
	});

	//Now let's take care of the page elements
	$("#sett_button").first().click(function(){chrome.runtime.openOptionsPage();});

}); //End of document.ready callback

function getPriceCurve(storeName, productPage){

	//This chrome message gets the item name from the loaded page
	//This message MUST be read in the script injected in the store page
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {action: "getItemName", store: storeName}, function(response) {
			console.log("The item in this page is " + response.itemName);
			$("header span").text(response.itemName);
		});
	});

	//This post request gets us the prices and dates for the item
	$.post("http://scroogealpha.esy.es/get.php", 
		{
			store : storeName,
			product : productPage,
		},
		showResults,
		'text')
	.fail(function(){
		console.log("Error sending request :(");
	});
}

function showResults(text){
	$("#maindiv").replaceWith(text);

	var pricearray = $('.priceentry .price').map(function(){
			return $.trim($(this).text());
			}).get();

	var datearray = $('.priceentry .date').map(function(){
			return $.trim($(this).text());
			}).get();

	// Create a simple line chart

	var chart = c3.generate({
	    data: {
	        x: 'x',
	        columns: [
	            $.merge(['x'], datearray),
	            $.merge(['Price evolution'], pricearray)
	        ]
	    },
	    size: {
	    	height: 500,
	    	width: 700
	    },
	    axis: {
	        x: {
	            type: 'timeseries',
	            tick: {
	                format: '%Y-%m-%d'
	            }
	        }
	    }
	});
}


function processLDLC(fullurl){
	//Next line is very ugly
	getPriceCurve("LDLC", fullurl.slice(fullurl.indexOf("/fiche/"), fullurl.length)); 
}

function processHardwarefr(fullurl){
	getPriceCurve("hardwarefr", fullurl.slice(fullurl.indexOf("/fiche/"), fullurl.length)); 	
}
