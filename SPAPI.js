//Sends a price record to the database.
//string storeName: The store's name. Not the URL or anything, just its name
// eg: amazon.com => "amazoncom", topachat.com => "topachatcom"
//function itemName: a function that will return the item's ID
//function price: a function that will return the item's price
//function currency: a function that will return the item's currency for the price given
function addPriceRecord(storeName, itemName, price, currency) {
	chrome.runtime.sendMessage({
		action: 'xhttp',
		storeName: storeName,
		productPage: itemName(),
		price: price(),
		currency: currency()
	});
}

function storeDomainIs(argument) {
	return document.domain.endsWith(argument);
}

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