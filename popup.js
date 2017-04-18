$(document).ready(function() {
	
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {action: "getItemData"}, function(response) {
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
				$("header span").text(response.itemPayload.itemName);

				getPriceCurve(response.itemPayload.itemID, response.itemPayload.storeName);

				//Now let's take care of the page elements
				$("#sett_button").click(showOptionsDropMenu);
				$("#fav_button").click(function(){favoritesClicked(response.fullurl, response.itemPayload);});
				$("#openOptions").click(function(){chrome.runtime.openOptionsPage();});
				$("#seeMyFavorites").click(showFavorites);
				//BUG: clicking show favorites when the page is still loading does nothing

				//Making sure the favorite star has correct icon
				chrome.storage.sync.get(null, (data) => {
					//By default, the star-outline is used
					if (isInFavorites(data.favlist, response.itemPayload.itemID))
						$("#fav_button img").attr("src", "img/star.png");
				});
			}
		});
	});
});


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

function favoritesClicked(fullurl, itemPayload){

	//First of all, we have to figure if the page has been loaded
	//This check is done in getPriceCurve if the title can't be found,
	//The onclick event is then turned off

	//First we figure if it is not already in favorites
	chrome.storage.sync.get(null, (data) => {
		if(isInFavorites(data.favlist, itemPayload.itemID)){
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
			var favorite = {};

			favorite["itemName"] = itemPayload.itemName;
			favorite["dateAdded"] = date.toLocaleDateString();
			favorite["fullurl"] = fullurl;
			favorite["shorturl"] = itemPayload.itemID;
			favorite["store"] = itemPayload.storeName;
			favorite["lastUserAcknowledgedDate"] = date.toJSON();
			favorite["lastUserAcknowledgedPrice"] = itemPayload.itemPrice;
			favorite["currency"] = itemPayload.itemCurrency;

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
				var id = favorite["shorturl"].replace(/(\/|\.|#)/g, "-");
				$("#chart").append(
					`<div class="favorite">
						<div class="datadiv ` + id + `"></div>
						<div class="favinfo"> 
							<a href="` + favorite["fullurl"] + `" target="_blank">` +
								favorite["itemName"] +
							`</a> <br /> 
							<span class="itemDate">Item added on ` + favorite["dateAdded"] + `</span><br />
							<span class="itemCurrency">Currency: ` + favorite["currency"] + `</span><br />
							<span class="itemLastVisit">Last time you've seen the price: ` + favorite["lastUserAcknowledgedDate"] + `</span><br />
						</div> 
						<div class="favchart ` + id + `">
							Click to see graph
						</div>
					</div>`
				);

				$("div.favchart").last().click(()=>{
					$("div.favchart[data-url='" + favorite["shorturl"] + "']").text("Loading");

					//function getPriceCurve(storeName, productPage, datadiv = "#maindiv", selector = "#chart", mini)
					getPriceCurve(favorite["shorturl"], favorite["store"], ".datadiv." + id, ".favchart." + id, true);
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