$(document).ready(function() {

	//First, we have to make sure this script is injected in a product page.
	//It should always be, but with the chrome manifest regex, it's not always possible
	let matches = [	/.*:\/\/.*ldlc.com\/fiche\/.*(\.html)$/g, 
				/.*:\/\/.*shop\.hardware\.fr\/fiche\/.*(\.html)$/g, 
				/.*:\/\/www\.amazon\.fr\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g, 
				/.*:\/\/www\.amazon\.com\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g, 
				/.*:\/\/www\.amazon\.co\.uk\/((.*\/)?dp\/|gp\/product\/|d\/.*\/.*\/)([0-9]|[A-Z]){10}(\/.*)?/g, 
				/.*:\/\/.*cdiscount\.com\/.*(\/f-[0-9]+-.*\.html((#|\?).*)?)$/g,
				/.*:\/\/www\.topachat\.com\/pages\/detail2_cat_.*\.html(((#|\?).*)?)$/g,
				/.*:\/\/.*conrad\.fr\/ce\/fr\/product\/[0-9]+\/.+/g,
				/.*\/\/store\.nike\.com\/.*\/pgid-[0-9]{8}/g,
				/.*\/\/www\.grosbill\.com\/4-.*/g,
				/.*\/\/www\.undiz\.com\/.*\/.*\/.*([0-9]\.html(.*)?)$/g,
				/.*(fr|es|de)\.romwe\.com\/.*-p-[0-9]*-cat-[0-9]*\.html.*/g,
				/.*\/\/www\.zalando\.fr\/.*\.html.*/g,
				/.*\/\/www\.rueducommerce\.fr\/(m\/ps\/mpid:MP-.*|.*\/.*\/.*\/.*\/.*\.htm(#.*)?)/g,
				/.*\/\/www\.gearbest\.com\/.*\/pp_[0-9]{6}\.html.*/g,
				/.*\/\/www\.newegg\.com\/Product\/Product\.aspx\?(i|I)tem=.*/g,
				/.*\/\/www\.materiel\.net\/.*\/.*[0-9]{6}\.html.*/g,
				/.*\/\/www\.caseking\.de\/.*\.html.*/g];

	for (let i in matches) {
		if (window.location.href.match(matches[i])){
			//We're definitely in a product page. Let's ask for the page action to show
			sendItemData();
			chrome.runtime.sendMessage({
				action: 'showPageAction'
			});
			break;
		}
	}
});

//payload will contain the data to send
//More details before the sendItemData declaration
//Default values are:
//timeout: milliseconds to wait before sendig the data (pretty useless i guess, unless you use it otherwise)
//executeOnLoad: whether or not the data must be sent at the end of the function
// If you need to manually send the data (to handle ajax events for exemple), you
// can use the addPriceRecord function directly, and the automatic submission will
// be skipped
var payload = {};
payload.timeout = 0;
payload.executeOnLoad = true;

//This function gathers all the data about the item, and stores in in payload.
//Payload MUST contain the following values:
// storeName: The store name
// itemID: the unique identifier of the item
// itemPrice: the price of the item (format NNN.NN)
// itemCurrency: the currency of the item ("EUR|USDOLL|TODODDODODO")
// itemName: the name to display on the popup
function sendItemData(){
	
	if(storeDomainIs("ldlc.com")){
		payload.storeName = "LDLC";
		payload.itemID = window.location.pathname;
		payload.itemPrice = $("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');
		payload.itemCurrency = "EUR";
		payload.itemName = $("span.fn.designation_courte").first().text().trim();
	}
	else if (storeDomainIs("shop.hardware.fr")) {
		payload.executeOnLoad = false; //Price and more info loaded by Ajax and not on page load
		payload.timeout = 2000;

		setTimeout(()=>{
			payload.storeName = "hardwarefr";
			payload.itemID = window.location.pathname;
			payload.itemCurrency = "EUR";
			payload.itemName = "TODODDODODO";
			
			payload.itemPrice = $("#stockPriceBlock .prix .new-price").text().replace(/€/g, '.').trim();
			if (payload.itemPrice.length === 0) {
				payload.itemPrice = $("#stockPriceBlock .prix").text().replace(/€/g, '.').trim();
			}
		},
		payload.timeout);

	}
	else if (storeDomainIs("amazon.com")) {
		//The idea here is to check every 2 seconds if the URL changed
		//We first set the URL to nothing to make it send the first record
		//as soon as the page is loaded
		//Note that it might not work with other stores as some don't update their URL

		//Set the loop/delay parameters
		var pathname = "";
		payload.executeOnLoad = false;
		payload.timeout = 2000;

		payload.storeName = "amazoncom";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;
				
				//Item is updated, got to update the payload data

				if (window.location.pathname.startsWith("/dp/"))
					payload.itemID = getUrlPart(window.location.pathname, 2);
				else if (window.location.pathname.startsWith("/d/"))
					payload.itemID =  getUrlPart(window.location.pathname, 4);
				else
					payload.itemID =  getUrlPart(window.location.pathname, 3);

				payload.itemPrice = $('span#priceblock_saleprice').text().trim().replace(/\$/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_dealprice').text().trim().replace(/\$/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_ourprice').text().trim().replace(/\$/g, "");
				
				payload.itemName = "TODODDODODO";
				payload.itemCurrency = "USDOLL";

				addPriceRecord(
					payload.storeName, 
					payload.itemID,
					payload.itemPrice,
					payload.itemCurrency
				);
			}
		},
		payload.timeout);
	}
	else if (storeDomainIs("amazon.fr")) {
		var pathname = "";
		payload.executeOnLoad = false;
		payload.timeout = 2000;

		payload.storeName = "amazonfr";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;
				
				//Item is updated, got to update the payload data

				if (window.location.pathname.startsWith("/dp/"))
					payload.itemID = getUrlPart(window.location.pathname, 2);
				else if (window.location.pathname.startsWith("/d/"))
					payload.itemID =  getUrlPart(window.location.pathname, 4);
				else
					payload.itemID =  getUrlPart(window.location.pathname, 3);

				payload.itemPrice = $('span#priceblock_dealprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_saleprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_ourprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
		
				payload.itemName = "TODODDODODO";
				payload.itemCurrency = "EUR";

				addPriceRecord(
					payload.storeName, 
					payload.itemID,
					payload.itemPrice,
					payload.itemCurrency
				);
			}
		},
		payload.timeout);
	}
	else if (storeDomainIs("amazon.co.uk")) {

		var pathname = "";
		payload.executeOnLoad = false;
		payload.timeout = 2000;

		payload.storeName = "amazoncouk";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;
				
				//Item is updated, got to update the payload data

				if (window.location.pathname.startsWith("/dp/"))
					payload.itemID = getUrlPart(window.location.pathname, 2);
				else if (window.location.pathname.startsWith("/d/"))
					payload.itemID =  getUrlPart(window.location.pathname, 4);
				else
					payload.itemID =  getUrlPart(window.location.pathname, 3);

				payload.itemPrice = $('span#priceblock_saleprice').text().trim().replace(/£/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_dealprice').text().trim().replace(/£/g, "");
				if (payload.itemPrice.length === 0)
					payload.itemPrice = $('span#priceblock_ourprice').text().trim().replace(/£/g, "");		
				
				payload.itemName = "TODODDODODO";
				payload.itemCurrency = "STERLING";

				addPriceRecord(
					payload.storeName, 
					payload.itemID,
					payload.itemPrice,
					payload.itemCurrency
				);
			}
		},
		payload.timeout);
	}
	else if (storeDomainIs("cdiscount.com")) {
		addPriceRecord("cdiscount", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $("span.price[itemprop=price]").attr("content");},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("conrad.fr")) {
		addPriceRecord("conradfr", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $("span.price").text().trim();},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("store.nike.com")) {
		var DOMTimeout = null;
		var processNike = ()=>{addPriceRecord("nike", 
			()=>{ return getUrlPart(window.location.pathname, 5);},
			()=>{ return $('.exp-pdp-product-price span').last().text().trim().replace("€", "").replace(",", ".").trim();},
			()=>{ return "EUR";})
		};

		processNike();

		$('.exp-pdp-main-pdp-content').bind('DOMNodeInserted', () => {
			if(DOMTimeout)
				clearTimeout(DOMTimeout);

			DOMTimeout = setTimeout(() => { processNike(); console.log('processNike called'); }, 200);
		});

	}
	else if (storeDomainIs("grosbill.com")) {
		addPriceRecord("grosbill", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $('.datasheet_price_and_strike_price_wrapper div').first().text().trim().replace("€", ".");},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("undiz.com")) {
		addPriceRecord("undiz", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $('span.price-sales.wishPrice').first().text().trim().replace(/ €/g, "").replace(/,/g, ".");},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("caseking.de")) {
		addPriceRecord("casekingde", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ 
				var price = $(".article_details_price2").first().find("strong").text().trim().replace(/\s+€\*/g, "").replace(/,/g, ".");
				if (price.length === 0)
					price = $(".article_details_price").first().text().trim().replace(/\s+€\*/g, "").replace(/,/g, ".");
				return price;
			},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("newegg.com")) {
		addPriceRecord("neweggcom", 
			()=>{ 
				var lasturlpart = window.location.search.match(/N([A-Z]|[0-9]){14}/g);
				if(lasturlpart.length === 0){
					console.log("An error occurred getting the ID of this item, please let the devs know about it!");
					return;
				}
				return lasturlpart[0];
			},
			()=>{ return $("#landingpage-price li.price-current").last().text().trim().replace(/\$/g, "");},
			()=>{ return "USDOLL";});
	}
	else if (storeDomainIs("zalando.fr")) {
		addPriceRecord("zalandofr", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $("span.zvui_price_priceWrapper").last().text().trim().replace(/\s+€/g, "").replace(/,/g, ".");},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("gearbest.com")) {
		setTimeout(()=>{
			addPriceRecord("gearbestcom", 
				()=>{ return getLastUrlPart(window.location.pathname);},
				()=>{ 
					var price = $("#unit_price").text().trim();
					if (price.includes("€")) {
						price = price.replace(/€/g, "");
						return price;
					}
					else{
						console.log("For now, this extension only supports pricing in euros. Contact us if you desire support for another currency!");
					}
				},
				()=>{ return "EUR";}
			);
		}, 
		2000);
	}
	else if (storeDomainIs("topachat.com")) {
		addPriceRecord("topachatcom", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $("span.priceFinal[itemprop=price]").attr("content");},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("rueducommerce.fr")) {
		addPriceRecord("rueducommercefr", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $("meta[itemprop=price]").attr("content").replace(/,/g, ".");},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("materiel.net")) {
		addPriceRecord("materielnet", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $("#ProdInfoPrice span").text().trim().replace(/€ TTC/g, "").replace(/,/g, ".").replace(/\s+/g, "");},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("romwe.com") && !document.domain.startsWith("www")) { // www. -> english site
		addPriceRecord("romwe", 
			()=>{ return getLastUrlPart(window.location.pathname);},
			()=>{ return $("span#spanSubTotal_").last().text().trim().replace(/€/g, "");},
			()=>{ return "EUR";});
	}
	else{
		console.log("Couldnt find appropriate store :(");
		return;
	}

	if(payload.executeOnLoad){
		setTimeout(()=>{addPriceRecord(
			payload.storeName,
			payload.itemID,
			payload.itemPrice,
			payload.itemCurrency);}, 
		payload.timeout);
	}
}

//If the popup is opened, it will ask for the item name
//Here we answer what th item name is
//Simply have a look to what have been done, and do the same for your store
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "getItemName"){
	 	if(request.store == "LDLC"){
			sendResponse({itemName: $("span.fn.designation_courte").first().text().trim()});
		}
		else if(request.store == "hardwarefr"){
			sendResponse({itemName: $("#description h1").first().text().trim()});
		}
		else if(request.store == "amazoncom"){
			sendResponse({itemName: $("span#productTitle").text().trim()});
		}
		else if(request.store == "amazonfr"){
			sendResponse({itemName: $("span#productTitle").text().trim()});
		}
		else if(request.store == "amazoncouk"){
			sendResponse({itemName: $("span#productTitle").text().trim()});
		}
		else if(request.store == "cdiscount"){
			sendResponse({itemName: $("h1[itemprop=name").text().trim()});
		}
		else if(request.store == "conradfr"){
			sendResponse({itemName: $("a.fn[name=head_detail").text().trim()});
		}
		else if(request.store == "nike"){
			sendResponse({itemName: $('h1.exp-product-title.nsg-font-family--platform').text().trim()});
		}
		else if(request.store == "grosbill"){
			sendResponse({itemName: $('h1[itemprop=name]').text().trim()});
		}
		else if(request.store == "gearbestcom"){
			sendResponse({itemName: $('h1').first().text().trim()});
		}
		else if(request.store == "undiz"){
			sendResponse({itemName: $('p.product-name').text().trim()});
		}
		else if(request.store == "zalandofr"){
			sendResponse({itemName: $(".z-vegas-ui_text.z-vegas-ui_text-vegas-detail-title").text().trim()});
		}
		else if(request.store == "romwe"){
			sendResponse({itemName: $('h1').text().trim()});
		}
		else if(request.store == "casekingde"){
			sendResponse({itemName: $('h1').clone().children().remove().end().text().trim()});
		}
		else if(request.store == "neweggcom"){
			sendResponse({itemName: $('#grpDescrip_h').text().trim()});
		}
		else if(request.store == "topachatcom"){
			sendResponse({itemName: $("h1[itemprop=name").text().trim()});
		}
		else if(request.store == "rueducommercefr"){
			sendResponse({itemName: $("h1 span[itemprop=name").text().trim()});
		}
		else if(request.store == "materielnet"){
			sendResponse({itemName: $("#breadcrumb li").last().text().trim()});
		}
		else{
			sendResponse({itemName: "Unknown store"});
		}
	}
	else
		sendResponse({error: "Unexpected message on skimpenny.js"});
});