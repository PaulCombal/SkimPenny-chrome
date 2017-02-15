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
		$("#seeMyFavorites").click(showFavorites);
		
		//Making sure the favorite star has correct icon
		chrome.storage.sync.get(null, (data) => {
			var allKeys = Object.keys(data);
			//returns -1 if not found
			//By default, the star-outline is used
			if($.inArray(tabs[0].url, allKeys) > -1)
				$("#fav_button img").attr("src", "img/star.png");
		});

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
				$("#fav_button")
				.off("click")
				.css("opacity", "0")
				.css("cursor", "auto")
				.find("img")
				.css("cursor", "auto");
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

function favoritesClicked(fullurl){

	//First of all, we have to figure if the page has been loaded
	//This check is done in getPriceCurve if the title can't be found,
	//The onclick event is then turned off

	//First we figure if it is not already in favorites
	chrome.storage.sync.get(null, (data) => {
		var allKeys = Object.keys(data);
		//returns -1 if not found
		if($.inArray(fullurl, allKeys) > -1){
			//This page is already in favorites
			//We have to delete the page from the favorites
			chrome.storage.sync.remove(fullurl);
			$("#fav_button img").attr("src", "img/star-outline.png");
		}
		else{
			//We have to add the current page to favorites
			var date = new Date();
			date = date.toLocaleDateString();
			var favorite = {};
			favorite[fullurl] = [$("header span").text(), date];
			//Like this we have a unique ID for the favorite as well as many properties

			chrome.storage.sync.set(favorite);
			$("#fav_button img").attr("src", "img/star.png");
		}
	});
}

function showFavorites(){

	hideOptionsDropMenu();

	$("#sett_button")
	.off("click")
	.click(exitFavoriteMode);

	$("#sett_button img").attr("src", "img/close.png");
	
	$("header").css("background", "#ffb100");
}

function exitFavoriteMode(){
	$("#sett_button")
	.off("click")
	.click(showOptionsDropMenu);

	$("#sett_button img").attr("src", "img/settings.png");

	$("header").css("background", "#191919");
}