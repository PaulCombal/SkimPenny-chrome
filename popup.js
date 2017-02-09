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
	console.log(storeName);
	console.log(productPage);

	$.post("http://scroogealpha.esy.es/get.php", 
		{
			store : storeName,
			product : productPage,
		},
		showResults,
		'html')
	.fail(function(){
		console.log("Error sending request :(");
	});

}

function showResults(html){
	$("#maindiv").replaceWith(html);
	console.log(html);
}

function processLDLC(fullurl){
	//Next line is very ugly
	getPriceCurve("LDLC", fullurl.slice(fullurl.indexOf("/fiche/"), fullurl.length)); 
}