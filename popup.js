$(document).ready(function() {
	
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {action: "getItemData"}, function(response) {
			if (response.itemPayload === undefined) {
				$("header span").text(chrome.i18n.getMessage("error_loading_item"));
				//We don't want undefined favorites
				$("#fav_button")
				.off("click")
				.css("opacity", "0")
				.css("cursor", "auto")
				.find("img")
				.css("cursor", "auto");
			}
			else{
				//This should never happen anymore now, but hey why not leave that anyway
				if (response.itemPayload.itemID === undefined) {
					$("header span").text("TOO QUICK! Please try again!");
					return;
				}
				$("header span").text(response.itemPayload.itemName);
				$("#openOptions").text(chrome.i18n.getMessage("options"));
				$("#seeMyFavorites").text(chrome.i18n.getMessage("my_favorites"));
				$("#maindiv").text(chrome.i18n.getMessage("loading_prices"));


				getPriceCurve(response.itemPayload.itemID, response.itemPayload.storeName);

				//Now let's take care of the page dynamic elements
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

			deleteFavorite(data.favlist, itemPayload.itemID);
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
							<span class="itemDate">` + chrome.i18n.getMessage("item_added_on") + " " + favorite["dateAdded"] + `</span><br />
							<span class="itemCurrency">` + chrome.i18n.getMessage("currency") + ": " + favorite["currency"] + `</span><br />
							<span class="itemLastVisit">` + chrome.i18n.getMessage("last_time_seen") + ": " + favorite["lastUserAcknowledgedDate"] + `</span><br />
							<span class="deleteFav"><a style="cursor: pointer">` + chrome.i18n.getMessage("delete_favorite") + `</a></span>
						</div> 
						<div class="favchart ` + id + `">
							` + chrome.i18n.getMessage("click_to_see_graph") +`
						</div>
					</div>`
				);

				$("div.favchart").last().click(()=>{
					$("div.favchart[data-url='" + favorite["shorturl"] + "']").text("Loading");

					//Get the current price, and send it to the server
					//We're doing it in the background, so we have to use the event page
					addRecordBackground(favorite);

					//function getPriceCurve(storeName, productPage, datadiv = "#maindiv", selector = "#chart", mini)
					getPriceCurve(favorite["shorturl"], favorite["store"], ".datadiv." + id, ".favchart." + id, true);
				});

				$("span.deleteFav").last().click(()=>{
					deleteFavorite(favorites.favlist, id);
				});
			});
		}
		else{
			console.log("favlist is ");
			console.log(favorites.favlist);
			$("#chart").append("<span id=\"nofavorites\">" + chrome.i18n.getMessage("no_favorites") + "</span>");
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

function isInFavorites(favArray, itemID) {
	return favArray === undefined ? false : favArray.map((a)=>{return a.shorturl}).indexOf(itemID) != -1;
}

function deleteFavorite(favArray, favoriteId) {
	if(favArray === undefined)
		return false;
	else{
		var favIndex = favArray.map((a)=>{return a.shorturl}).indexOf(favoriteId);
		if(favIndex > -1)
			favArray.splice(favIndex, 1);
		else
			return false;


		chrome.storage.sync.set({favlist: favArray});

		console.log($(".datadiv." + favoriteId));
		console.log($(".datadiv." + favoriteId).parent());
		$(".datadiv." + favoriteId).parent().css("display", "none").empty();
	}
}

//Gets the current price of a favorite, and sends it to the database in the background
//Ususally called when user clicks the "Show graph" button when viewing the favorite list
function addRecordBackground(favorite) {
	chrome.runtime.sendMessage({action: "updatefav", fav: favorite});
}

/////////////////////////////////////////////////
//Below are funcs to get data from the database//
/////////////////////////////////////////////////

//builds a graph from an itemID and the storeName
function getPriceCurve(itemID, storeName, datadiv = "#maindiv", selector = "#chart", mini = false){

	$.post("http://waxence.fr/skimpenny/get.php", 
		{
			store : storeName,
			product : itemID,
		},
		(data) => {showResults(data, datadiv, selector, mini);},
		'text')
	.fail(function(xhr, status, error){
		$("#maindiv").html(chrome.i18n.getMessage("error_getting_prices"))
		.css("animation", "none")
		.css("line-height", "100px");

		console.log("Error codes:");
		console.log(status);
		console.log(error);
	});
		
}

/*text: the data retrieved from the server
  datadiv: where to write the data on the page. The css will force it to not be displayed
  selector: in what block to build the graph*/
function showResults(text, datadiv, selector, mini = false){
	$(datadiv).empty().append(text).css("display", "none");
	buildSelectGraph(datadiv, selector, mini);
}

//This function needs A LOT of optimization, there are many loops, and I guess there
//is a more clever way to implement this.
function buildSelectGraph(datadiv = "#maindiv", selector = "#chart", mini = false){
	//STEP ONE: Find all different currencies
	var datearray = [];
	var pricearray = [];
	var recordCurrency;
	var recordDate;
	var recordDate;

	//Fills the array containing the dates
	//Fills the array containing the array with currencies
	$(datadiv + " .priceentry").each((i, element)=>{
		recordCurrency = $(element).find(".currency").text();
		recordDate = $(element).find(".date").text();

		//Avoid having date duplicates
		if (datearray.indexOf(recordDate) === -1) {
			datearray.push(recordDate);
		}

		//pelem = array for one currency
		var currencyInArray = false;
		$(pricearray).each((pi, pelem)=>{
			if(pelem[0] === recordCurrency){
				currencyInArray = true;
				return;
			}
		});
		if (!currencyInArray) {
			pricearray.push([recordCurrency]);
		}
	});
	
	//STEP TWO: Fill an array with adequate size of null values
	//Fills the price arrays with null values
	$(pricearray).each((i, e)=>{
		$.merge(e, new Array(datearray.length).fill(null));
	});

	//STEP THREE: for each record, add the price in the right index
	//For each date, we check each record to see if there is the date matches, and then adds the record
	$(datearray).each((dateIndex, date)=>{
		$(datadiv + " .priceentry").each((recordNumber, element)=>{
			recordCurrency = $(element).find(".currency").text();
			recordDate = $(element).find(".date").text();
			recordPrice = $(element).find(".price").text();

			if (recordDate === date) {
				$(pricearray).each((currencyIndex, currencyArray)=>{
					if (currencyArray[0] === recordCurrency) {
						currencyArray[dateIndex + 1] = recordPrice;
					}
				});
			}
		});
	});

	if (pricearray !== undefined && pricearray.length > 0) {
		buildGraph(pricearray, datearray, selector, mini);
	}
	else{
		$(selector)
		.empty()
		.append(chrome.i18n.getMessage("error_empty_pricelist") + $(datadiv + " #errorDiv").text())
		.css("display", "block")
		.css("font-size", "x-large")
		.css("text-align", "center")
		.css("width", "100%");
	}
}

function buildGraph(pricearray, datearray, selector, mini = false){

	// Create a simple line chart
	var columns = [$.merge(['x'], datearray)];
	$(pricearray).each((i, currencyColumn)=>{
		columns.push(currencyColumn);
	});

	chrome.storage.sync.get({chartStyle: "line"}, (data) =>{
		var chart = c3.generate({
			bindto: selector,
			data: {
				x: 'x',
				columns: columns,
				type: data.chartStyle
			},
			size: {
				height: mini ? 197 : 500,
				width: mini ? 310 : 770
			},
			padding: {
				//We add this padding to prevent labels from getting cropped
				right: 30
			},
			axis: {
				x: {
					type: 'timeseries',
					show: !mini,
					tick: {
						format: '%d/%m/%Y'
					}
				},
				y: {
					show: !mini
				}
			},
			interaction: {
				enabled: !mini
			},
			line: {
				connectNull: true
			}
		});
	});
}