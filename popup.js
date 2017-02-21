$(document).ready(function() {
	//First thing to do: detect whe website we're browsing
	//also check the url from the tab, we can't use window, 
	//as it will return the popup's location
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		//shorturl aka unique ID for store
		var shorturl;
		if(getStoreFromURL(tabs[0].url) === "LDLC"){
			shorturl = processLDLC(tabs[0].url);
		}
		else if(getStoreFromURL(tabs[0].url) === "hardwarefr"){
			shorturl = processHardwarefr(tabs[0].url);
		}
		else if(getStoreFromURL(tabs[0].url) === "cdiscount"){
			shorturl = processCdiscount(tabs[0].url);
		}
		else if(getStoreFromURL(tabs[0].url) === "conradfr"){
			shorturl = processConradfr(tabs[0].url);
		}
		else{
			console.log("Warning: Unknown store for page " + tabs[0].url);
			shorturl = "Error, unknown store";
		}

		//Now let's take care of the page elements
		$("#sett_button").click(showOptionsDropMenu);
		$("#fav_button").click(function(){favoritesClicked(tabs[0].url, shorturl);});
		$("#openOptions").click(function(){chrome.runtime.openOptionsPage();});
		$("#seeMyFavorites").click(showFavorites);
		//BUG: clicking show favorites when the page is still loading does nothing
		
		//Making sure the favorite star has correct icon
		chrome.storage.sync.get(null, (data) => {
			//By default, the star-outline is used
			if (isInFavorites(data.favlist, tabs[0].url))
				$("#fav_button img").attr("src", "img/star.png");
		});

	});

}); //End of document.ready callback

function isInFavorites(favArray, fullurl) {

	if (favArray !== undefined) {
		var result = false;
		$.each(favArray, (index, favorite) =>{
			if (favorite["fullurl"] == fullurl) {
				return result = true;
			}
		 });
		return result;
	}
	return false;
}

function getStoreFromURL(fullurl){
	if (fullurl.includes("ldlc.com/fiche/")) {
		return "LDLC";
	}
	else if (fullurl.includes("shop.hardware.fr/fiche/")) {
		return "hardwarefr";
	}
	else if (fullurl.includes("cdiscount.com/")) {
		return "cdiscount";
	}
	else if (fullurl.includes("conrad.fr/ce/fr/product/")) {
		return "conradfr";
	}
	else{
		return "Unknown store";
	}
}

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
	buildGraph();
}

function buildGraph(){
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

function getLastUrlPart(fullurl) {
	var shorturl = fullurl.substr(fullurl.lastIndexOf('/') + 1);

	var n = shorturl.indexOf('#');
	shorturl = shorturl.substring(0, n != -1 ? n : shorturl.length);

	n = shorturl.indexOf('?');
	shorturl = shorturl.substring(0, n != -1 ? n : shorturl.length);

	console.log(shorturl);
	return shorturl;
}


function processLDLC(fullurl){
	//shortUrl aka unique ID for the database
	var shorturl = fullurl.slice(fullurl.indexOf("/fiche/"), fullurl.length);
	getPriceCurve("LDLC", shorturl);
	return shorturl;
}

function processHardwarefr(fullurl){
	var shorturl = fullurl.slice(fullurl.indexOf("/fiche/"), fullurl.length);
	getPriceCurve("hardwarefr", shorturl);
	return shorturl;
} 

//This func only keeps whats behind the last slash of the url and removes anchors
//and GET parameters
function processCdiscount(fullurl){
	var shorturl = getLastUrlPart(fullurl);
	getPriceCurve("cdiscount", shorturl);
	return shorturl;
}

function processConradfr(fullurl){
	var shorturl = getLastUrlPart(fullurl);
	getPriceCurve("conradfr", shorturl);
	return shorturl;
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

function favoritesClicked(fullurl, shorturl){

	//First of all, we have to figure if the page has been loaded
	//This check is done in getPriceCurve if the title can't be found,
	//The onclick event is then turned off

	//First we figure if it is not already in favorites
	chrome.storage.sync.get(null, (data) => {
		if(isInFavorites(data.favlist, fullurl)){
			//This page is already in favorites
			//We have to delete the page from the favorites

			//We know that favlist isn't empty as there is at least one favorite
			$.each(data.favlist, (index, favorite) => {
				if (favorite["fullurl"] == fullurl) {
					data.favlist.splice(index, 1);
				}

			});

			chrome.storage.sync.set({favlist: data.favlist})

			$("#fav_button img").attr("src", "img/star-outline.png");
		}
		else{
			//We have to add the current page to favorites
			var date = new Date();
			date = date.toLocaleDateString();
			var favorite = {};
			favorite["itemName"] = $("header span").text();
			favorite["dateAdded"] = date;
			favorite["fullurl"] = fullurl;
			favorite["shorturl"] = shorturl;
			favorite["store"] = getStoreFromURL(fullurl);

			//First check if this is the first favorite
			if (data.favlist === undefined) {
				chrome.storage.sync.set({favlist: [favorite]});	
			}
			else{
				chrome.storage.sync.set({favlist: $.merge(data.favlist, [favorite])});
			}

			$("#fav_button img").attr("src", "img/star.png");
		}
	});
}

function showFavorites(){

	hideOptionsDropMenu();

	$("#sett_button img").attr("src", "img/close.png");
	
	$("header").css("background", "#ffb100");

	//Doing a copy of the graph and restoring doesn't seem to work
	//I didn't do further research, so instead we will rebuild the graph from previously 
	//downloaded data
	//backupPage = $("#chart").find("*");

	//Show the list of favorites
	chrome.storage.sync.get(null, (favorites) => {

		$("#chart")
		.empty();

		if (favorites.favlist !== undefined && favorites.favlist.length > 0) {
			$.each(favorites.favlist, (index, favorite) => {
				//Is there a way to improve the following?
				$("#chart").append(
					'<div class="favorite">' +
						'<div class="favinfo">' + 
							'<a href="' + favorite["fullurl"] + '" target="_blank">' +
								favorite["itemName"] +
							'</a> <br />' + 
							'<span class="itemDate">Item added on ' + favorite["dateAdded"] + '</span>' +
						'</div>' + 
						'<div data-store="' + favorite["store"] + '" data-url="' + favorite["shorturl"] + '" id="favchart">' +
							'Click to see graph' +
						'</div>' +
					'</div>'
				);
			});
		}
		else{
			console.log("favlist is ");
			console.log(favorites.favlist);
			$("#chart").append("You have no favorites m8");
		}

		$("#sett_button")
		.off("click")
		.click(function(){exitFavoriteMode()});
	});
}

function exitFavoriteMode(){

	//Clearing the favorites shown, and restoring the original graph
	$("#chart").empty();

	//Rebuilding the graph
	buildGraph();

	//Setting back the original options button instead of the cross to close
	$("#sett_button")
	.off("click")
	.click(showOptionsDropMenu);

	$("#sett_button img").attr("src", "img/settings.png");

	$("header").css("background", "#191919");
}