$(document).ready(function() {
	//First thing to do: detect whe website we're browsing
	//also check the url from the tab, we can't use window, 
	//as it will return the popup's location
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		//shorturl aka unique ID for store
		var shorturl;
		var fullurl = tabs[0].url;
		if(getStoreFromURL(fullurl) === "LDLC"){
			shorturl = buildGraphFromStoreAndID("LDLC", ()=>{
				return fullurl.slice(fullurl.indexOf("/fiche/"), fullurl.length)
			});
		}
		else if(getStoreFromURL(fullurl) === "amazoncom"){
			shorturl = buildGraphFromStoreAndID("amazoncom", ()=>{
				var n = fullurl.indexOf('#');
				fullurl = fullurl.substring(0, n != -1 ? n : fullurl.length);

				n = fullurl.indexOf('?');
				fullurl = fullurl.substring(0, n != -1 ? n : fullurl.length);
				
				if (fullurl.includes("www.amazon.com/dp/"))
					fullurl = getUrlPart(fullurl, 2);
				else if (fullurl.includes("www.amazon.com/d/"))
					fullurl = getUrlPart(fullurl, 4);
				else
					fullurl = getUrlPart(fullurl, 3);

				return fullurl;
			});
		}
		else if(getStoreFromURL(fullurl) === "amazoncouk"){
			shorturl = buildGraphFromStoreAndID("amazoncouk", ()=>{
				var n = fullurl.indexOf('#');
				fullurl = fullurl.substring(0, n != -1 ? n : fullurl.length);

				n = fullurl.indexOf('?');
				fullurl = fullurl.substring(0, n != -1 ? n : fullurl.length);
				
				if (fullurl.includes("www.amazon.com/dp/"))
					fullurl = getUrlPart(fullurl, 2);
				else if (fullurl.includes("www.amazon.com/d/"))
					fullurl = getUrlPart(fullurl, 4);
				else
					fullurl = getUrlPart(fullurl, 3);

				return fullurl;
			});
		}
		else if(getStoreFromURL(fullurl) === "amazonfr"){
			shorturl = buildGraphFromStoreAndID("amazonfr", ()=>{
				var n = fullurl.indexOf('#');
				fullurl = fullurl.substring(0, n != -1 ? n : fullurl.length);

				n = fullurl.indexOf('?');
				fullurl = fullurl.substring(0, n != -1 ? n : fullurl.length);
				
				if (fullurl.includes("www.amazon.com/dp/"))
					fullurl = getUrlPart(fullurl, 2);
				else if (fullurl.includes("www.amazon.com/d/"))
					fullurl = getUrlPart(fullurl, 4);
				else
					fullurl = getUrlPart(fullurl, 3);

				return fullurl;
			});
		}
		else if(getStoreFromURL(fullurl) === "hardwarefr"){
			shorturl = buildGraphFromStoreAndID("hardwarefr", ()=>{
				return fullurl.slice(fullurl.indexOf("/fiche/"), fullurl.length)
			});
		}
		else if(getStoreFromURL(fullurl) === "cdiscount"){
			shorturl = buildGraphFromStoreAndID("cdiscount", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "conradfr"){
			shorturl = buildGraphFromStoreAndID("conradfr", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "nike"){
			shorturl = buildGraphFromStoreAndID("nike", ()=>{
				return getUrlPart(fullurl, 5);
			});
		}
		else if(getStoreFromURL(fullurl) === "grosbill"){
			shorturl = buildGraphFromStoreAndID("cdiscount", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "undiz"){
			shorturl = buildGraphFromStoreAndID("undiz", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "romwe"){
			shorturl = buildGraphFromStoreAndID("romwe", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "casekingde"){
			shorturl = buildGraphFromStoreAndID("casekingde", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "zalandofr"){
			shorturl = buildGraphFromStoreAndID("zalandofr", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "neweggcom"){
			shorturl = buildGraphFromStoreAndID("neweggcom", ()=>{
				var shorturl = fullurl.match(/N([A-Z]|[0-9]){14}/g);
				if(shorturl.length === 0){
					$("#chart").append("An error occurred getting the ID of this item, please let the devs know about it!");
					return;
				}
				return shorturl[0];
			});
		}
		else if(getStoreFromURL(fullurl) === "gearbestcom"){
			shorturl = buildGraphFromStoreAndID("gearbestcom", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "topachatcom"){
			shorturl = buildGraphFromStoreAndID("topachatcom", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "rueducommercefr"){
			shorturl = buildGraphFromStoreAndID("rueducommercefr", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else if(getStoreFromURL(fullurl) === "materielnet"){
			shorturl = buildGraphFromStoreAndID("materielnet", ()=>{
				return getLastUrlPart(fullurl);
			});
		}
		else{
			console.log("Warning: Unknown store for page " + tfullurl);
			shorturl = "Error, unknown store";
		}

		//Now let's take care of the page elements
		$("#sett_button").click(showOptionsDropMenu);
		$("#fav_button").click(function(){favoritesClicked(fullurl, shorturl);});
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

//getStoreFromURL
//Feed it a url, and returns the store name
function getStoreFromURL(fullurl){
	if (fullurl.includes("ldlc.com/fiche/")) {
		return "LDLC";
	}
	else if (fullurl.includes("://www.amazon.com/")) {
		return "amazoncom";
	}
	else if (fullurl.includes("://www.amazon.co.uk/")) {
		return "amazoncouk";
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
	else if (fullurl.includes("store.nike.com/")) {
		return "nike";
	}
	else if (fullurl.includes("grosbill.com/")) {
		return "grosbill";
	}
	else if (fullurl.includes("www.undiz.com/")) {
		return "undiz";
	}
	else if (fullurl.includes("romwe.com/")) {
		return "romwe";
	}
	else if (fullurl.includes("://www.amazon.fr/")) {
		return "amazonfr";
	}
	else if (fullurl.includes("://www.caseking.de/")) {
		return "casekingde";
	}
	else if (fullurl.includes("://www.zalando.fr/")) {
		return "zalandofr";
	}
	else if (fullurl.includes("://www.gearbest.com/")) {
		return "gearbestcom";
	}
	else if (fullurl.includes("://www.newegg.com/")) {
		return "neweggcom";
	}
	else if (fullurl.includes("://www.topachat.com/")) {
		return "topachatcom";
	}
	else if (fullurl.includes("://www.rueducommerce.fr/")) {
		return "rueducommercefr";
	}
	else if (fullurl.includes("://www.materiel.net/")) {
		return "materielnet";
	}
	else{
		return "Unknown store";
	}
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
		.empty()
		.css("overflow-y", "auto");

		if (favorites.favlist !== undefined && favorites.favlist.length > 0) {
			$.each(favorites.favlist, (index, favorite) => {
				//Is there a way to improve the following?
				var id = favorite["shorturl"].replace(/\//g, "-").replace(/\./g, "-");
				$("#chart").append(
					'<div class="favorite">' +
						'<div class="datadiv ' + id + '"></div>' +
						'<div class="favinfo">' + 
							'<a href="' + favorite["fullurl"] + '" target="_blank">' +
								favorite["itemName"] +
							'</a> <br />' + 
							'<span class="itemDate">Item added on ' + favorite["dateAdded"] + '</span>' +
						'</div>' + 
						'<div class="favchart ' + id + '">' +
							'Click to see graph' +
						'</div>' +
					'</div>'
				);

				$("div.favchart").last().click(()=>{
					$("div.favchart[data-url='" + favorite["shorturl"] + "']").text("Loading");
					//TODO
					//function getPriceCurve(storeName, productPage, datadiv = "#maindiv", selector = "#chart", mini)
					getPriceCurve(favorite["store"], favorite["shorturl"], ".datadiv." + id, ".favchart." + id, true);
				});
			});
		}
		else{
			console.log("favlist is ");
			console.log(favorites.favlist);
			$("#chart").append("<span id=\"nofavorites\">You don't have any favorites yet :(</span>");
		}

		$("#sett_button")
		.off("click")
		.click(function(){exitFavoriteMode()});
	});
}

function exitFavoriteMode(){

	//Clearing the favorites shown, and restoring the original graph
	$("#chart")
	.empty()
	.css("overflow-y", "hidden");

	//Rebuilding the graph
	//No parameters -> main graph
	buildSelectGraph();

	//Setting back the original options button instead of the cross to close
	$("#sett_button")
	.off("click")
	.click(showOptionsDropMenu);

	$("#sett_button img").attr("src", "img/settings.png");

	$("header").css("background", "#191919");
}