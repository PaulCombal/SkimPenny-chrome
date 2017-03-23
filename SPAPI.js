/* FUNCTIONS FOR BOTH JS SCRIPTS */

function getUrlPart(url, index) {
   return url.replace(/^https?:\/\//, '').split('/')[index];
}

function getLastUrlPart(fullurl) {
	var shorturl = fullurl.substr(fullurl.lastIndexOf('/') + 1);

	var n = shorturl.indexOf('#');
	shorturl = shorturl.substring(0, n != -1 ? n : shorturl.length);

	n = shorturl.indexOf('?');
	shorturl = shorturl.substring(0, n != -1 ? n : shorturl.length);

	return shorturl;
}

/* FUNCTIONS FOR SKIMPENNY.JS */

//Sends a price record to the database.
//Parameters:
//string storeName: The store's name. Not the URL or anything, just its name
// eg: amazon.com => "amazoncom", topachat.com => "topachatcom"
//function itemName: a string that is the item's ID
//function price: a string that's the item's price
//function currency: a string that's the item's currency for the price given
function addPriceRecord(storeName, itemName, price, currency) {
	chrome.runtime.sendMessage({
		action: 'xhttp',
		storeName: storeName,
		productPage: itemName,
		price: price,
		currency: currency
	});
}

function storeDomainIs(argument) {
	return document.domain.endsWith(argument);
}

/* FUNCTIONS FOR POPUP.JS */

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

/////////////////////////////////////////////////
//Below are funcs to get data from the database//
/////////////////////////////////////////////////

//TODO REMOVE CHROME LOADING 

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
		$("#maindiv").html("Hacking didn't go so well..<br><span style=\"font-size: smaller\">Are you connected to the internet?</span>")
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

function buildSelectGraph(datadiv = "#maindiv", selector = "#chart", mini = false){
	var pricearray = $(datadiv + ' .priceentry .price').map(function(){
			return $.trim($(this).text());
			}).get();

	var datearray = $(datadiv + ' .priceentry .date').map(function(){
			return $.trim($(this).text());
			}).get();

	if (typeof pricearray !== 'undefined' && pricearray.length > 0) {
		buildGraph(pricearray, datearray, selector, mini);
	}
	else{
		$(selector).empty().append("<div>Something went wrong :( <br> If this message appears again on this product, send us an email!</div>");
	}
}

function buildGraph(pricearray, datearray, selector, mini = false){

	// Create a simple line chart

	var chart = c3.generate({
		bindto: selector,
		data: {
			x: 'x',
			columns: [
				$.merge(['x'], datearray),
				$.merge(['Price evolution'], pricearray)
			]
		},
		size: {
			height: mini ? 197 : 500,
			width: mini ? 310 : 750
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
		}
	});
}