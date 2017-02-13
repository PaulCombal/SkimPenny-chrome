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
		else{
			console.log("Warning: Unknown store for page " + tabs[0].url);
		}


		//Now let's take care of the page elements
		$("#sett_button").click(showOptionsDropMenu);
		$("#fav_button").click(function(){favoritesClicked(tabs[0].url);});
		$("#openOptions").click(function(){chrome.runtime.openOptionsPage();});
		//TODO check if not in favorites already

	});

}); //End of document.ready callback

/////////////////////////////////////////////////
//Below are funcs to get data from the database//
/////////////////////////////////////////////////

function getPriceCurve(storeName, productPage){

	//This chrome message gets the item name from the loaded page
	//This message MUST be read in the script injected in the store page
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {action: "getItemName", store: storeName}, function(response) {
			if (response === undefined) {
				$("header span").text("Error loading item name");
				//We don't want undefined favorites
				$("#fav_button").off("click");
			}
			else{
				$("header span").text(response.itemName);
			}
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
		$("#maindiv").html("Hacking didn't go so well..<br><span style=\"font-size: smaller\">Are you connected to the internet?</span>")
		.css("animation", "none")
		.css("line-height", "100px");
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
	    	width: 750
	    },
	    padding: {
	    	//We add this padding to prevent labels from getting cropped
	    	right: 30
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

/* ****************************************************** */
/* All the following is only for presenting the HTML page */
/* ****************************************************** */

function showOptionsDropMenu(){
	$("#sett_button img")
	.css("animation", "rotate60 0.2s normal forwards")
	.css("animation-play-state", "running");

	$("#settDropdown")
	.css("display", "inline-block")
	.css("animation", "fadein 0.2s normal forwards")
	.css("animation-play-state", "running");

	$("#sett_button")
	.off("click")
	.click(hideOptionsDropMenu);
}

function hideOptionsDropMenu(){
	$("#sett_button img")
	.css("animation", "none");

	$("#settDropdown")
	.css("display", "none");
	$("#sett_button")
	.off("click")
	.click(showOptionsDropMenu);
}

//TODO Fix this asynchronous call doing nothing
function searchInFavorites(fullurl){

	chrome.storage.sync.get(null, (data) => {
		var allKeys = Object.keys(data);
		//returns -1 if not found
		result = $.inArray(fullurl, allKeys);
		console.log(result > 0);
	});

}

function isInFavorites(data){

}

function favoritesClicked(fullurl){

	searchInFavorites(fullurl);

	var date = new Date();
	date = date.toLocaleDateString();
	var favorite = {};
	favorite[fullurl] = [$("header span").text(), date];
	//Like this we have a unique ID for the favorite as well as many properties

	chrome.storage.sync.set(favorite); 
	//chrome.storage.sync.get(fullurl, (data) => {console.log(data);});
}