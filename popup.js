$(document).ready(function() {
	//First thing to do: detect whe website we're browsing
	//also check the url from the tab, not extension
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		if(tabs[0].url.includes("ldlc.com/fiche/")){
			processLDLC(tabs[0].url);
		}
	});

}); //End of document.ready callback

function getPriceCurve(storeName, productPage){
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
	var data = {
	  // A labels array that can contain any sort of values
	  labels: datearray,
	  // Our series array that contains series objects or in this case series data arrays
	  series: [
	    pricearray
	  ]
	};

	// As options we currently only set a static size of 300x200 px
	var options = {
	  width: '700px',
	  height: '500px'
	};

	// In the global name space Chartist we call the Line function to initialize a line chart. As a first parameter we pass in a selector where we would like to get our chart created. Second parameter is the actual data object and as a third parameter we pass in our options
	new Chartist.Line('#chart', data, options);
}

function processLDLC(fullurl){
	//Next line is very ugly
	getPriceCurve("LDLC", fullurl.slice(fullurl.indexOf("/fiche/"), fullurl.length)); 
}