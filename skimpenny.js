$(document).ready(function() {
	
	//For eah different store, there is a different thing to do to 
	//find the price, currency, and item ID. Beause of that, you 
	//have to use anonymous functions to retrieve those elements, and pass
	//them in the AddPriceRecord function, which will execute them and 
	//send the data to the database
	if(storeDomainIs("ldlc.com")){
		addPriceRecord("LDLC", 
			()=>{ return window.location.pathname;},
			()=>{ return $("#productshipping meta[itemprop=price]").attr("content").replace(/,/g, '.');},
			()=>{ return "EUR";});
	}
	else if (storeDomainIs("shop.hardware.fr")) {
		setTimeout(()=>{
			addPriceRecord("hardwarefr", 
				()=>{ return window.location.pathname;},
				()=>{ 
					var price = $("#stockPriceBlock .prix .new-price").text().replace(/€/g, '.').trim();
					if (price.length === 0) {
						price = $("#stockPriceBlock .prix").text().replace(/€/g, '.').trim();
					}
					return price;
				},
				()=>{ return "EUR";}
			);
		}, 
		2000);
	}
	else if (storeDomainIs("amazon.com")) {
		//The idea here is to check every 2 seconds if the URL changed
		//We first set the URL to nothing to make it send the first record
		//as soon as the page is loaded
		//Note that it might not work with other stores as some don't update their URL

		var pathname = "";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;
				addPriceRecord("amazoncom", 
					()=>{
						if (window.location.pathname.startsWith("/dp/"))
							return getUrlPart(window.location.pathname, 2);
						else
							return getUrlPart(window.location.pathname, 3);
						//This may be correct, but in some cases this is also the last part 
						//So we have to remove additional anchors/GET parameters
					},
					()=>{
						var price = $('span#priceblock_saleprice').text().trim().replace(/\$/g, "");
						if (price.length === 0)
							price = $('span#priceblock_dealprice').text().trim().replace(/\$/g, "");
						if (price.length === 0)
							price = $('span#priceblock_ourprice').text().trim().replace(/\$/g, "");
						return price;
					},
					()=>{ return "USDOLL";}
				);
			}
		},
		2000);
	}
	else if (storeDomainIs("amazon.fr")) {
		var pathname = "";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;
				addPriceRecord("amazonfr", 
					()=>{
						if (window.location.pathname.startsWith("/dp/"))
							return getUrlPart(window.location.pathname, 2);
						else
							return getUrlPart(window.location.pathname, 3);
						//This may be correct, but in some cases this is also the last part 
						//So we have to remove additional anchors/GET parameters
					},
					()=>{
						var price = $('span#priceblock_dealprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
						if (price.length === 0)
							price = $('span#priceblock_saleprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
						if (price.length === 0)
							price = $('span#priceblock_ourprice').text().trim().replace(/EUR /g, "").replace(/,/g, ".").replace(/\s+/g, "");
						return price;
					},
					()=>{ return "EUR";}
				);
			}
		},
		2000);
	}
	else if (storeDomainIs("amazon.co.uk")) {
		var pathname = "";

		setInterval(()=>{
			if (pathname !== window.location.pathname) {
				pathname = window.location.pathname;
				addPriceRecord("amazoncouk", 
					()=>{
						if (window.location.pathname.startsWith("/dp/"))
							return getUrlPart(window.location.pathname, 2);
						else if (window.location.pathname.startsWith("/d/"))
							return getUrlPart(window.location.pathname, 4);
						else
							return getUrlPart(window.location.pathname, 3);
						//This may be correct, but in some cases this is also the last part 
						//So we have to remove additional anchors/GET parameters
					},
					()=>{
							var price = $('span#priceblock_saleprice').text().trim().replace(/£/g, "");
							if (price.length === 0)
								price = $('span#priceblock_dealprice').text().trim().replace(/£/g, "");
							if (price.length === 0)
								price = $('span#priceblock_ourprice').text().trim().replace(/£/g, "");
							return price;
					},
					()=>{ return "STERLING";}
				);
			}
		},
		2000);
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
});

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