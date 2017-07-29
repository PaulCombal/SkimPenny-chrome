$(document).ready(function() {

	//First, we have to make sure this script is injected in a product page.
	//It should always be, but with the chrome manifest regex, it's not always possible
	let matches = [	
					{storeID: "LDLC", regex: /.*:\/\/.*ldlc.com\/fiche\/.*(\.html)$/g},
					{storeID: "hardwarefr", regex: /.*:\/\/.*shop\.hardware\.fr\/fiche\/.*(\.html)$/g},
					{storeID: "amazonfr", regex: /.*:\/\/www\.amazon\.fr\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g},
					{storeID: "amazoncom", regex: /.*:\/\/www\.amazon\.com\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g},
					{storeID: "amazoncouk", regex: /.*:\/\/www\.amazon\.co\.uk\/((.*\/)?dp\/|gp\/product\/|d\/.*\/.*\/)([0-9]|[A-Z]){10}(\/.*)?/g},
					{storeID: "cdiscount", regex: /.*:\/\/.*cdiscount\.com\/.*(\/f-[0-9]+-.*\.html((#|\?).*)?)$/g},
					{storeID: "topachatcom", regex: /.*:\/\/www\.topachat\.com\/pages\/detail2_cat_.*\.html(((#|\?).*)?)$/g},
					{storeID: "conradfr", regex: /.*:\/\/.*conrad\.fr\/ce\/fr\/product\/[0-9]+\/.+/g},
					{storeID: "nike", regex: /.*\/\/store\.nike\.com\/.*\/pgid-[0-9]{8}/g},
					{storeID: "grosbill", regex: /.*\/\/www\.grosbill\.com\/4-.*/g},
					{storeID: "undiz", regex: /.*\/\/www\.undiz\.com\/.*\/.*\/.*([0-9]\.html(.*)?)$/g},
					{storeID: "romwe", regex: /.*(fr|es|de)\.romwe\.com\/.*-p-[0-9]*-cat-[0-9]*\.html.*/g},
					{storeID: "zalandofr", regex: /.*\/\/www\.zalando\.fr\/.*\.html.*/g},
					{storeID: "rueducommercefr", regex: /.*\/\/www\.rueducommerce\.fr\/produit\/.*-[0-9]{5,10}/g},
					{storeID: "gearbestcom", regex: /.*\/\/www\.gearbest\.com\/.*\/pp_[0-9]{6}\.html.*/g},
					{storeID: "neweggcom", regex: /.*\/\/www\.newegg\.com\/Product\/(Product\.aspx\?(i|I)tem=.*|ComboBundleDetails\.aspx\?(i|I)temList=Combo\.[0-9]*.*)/g},
					{storeID: "materielnet", regex: /.*\/\/www\.materiel\.net\/.*\/.*[0-9]{6}\.html.*/g},
					{storeID: "aliexpresscom", regex: /.*\/\/.*\.aliexpress\.com\/item\/.*\/[0-9]{9,12}\.html.*/g},
					{storeID: "casekingde", regex: /.*\/\/www\.caseking\.de\/.*\.html.*/g},
					{storeID: "fnaccom", regex: /.*\/\/(livre|www|musique|jeux-video|video).*fnac\.com\/.*(a|mp)[0-9]{5,10}.*/g}
				];

	for (let i in matches) {
		if (window.location.href.match(matches[i].regex)){
			
			//We're definitely in a product page.
			var storeID = matches[i].storeID;
			var generalParameters = {storeName: storeID, updateFavorite: true, feedPopup: true};
			var generalElementsNeededPathname = {DOM: document, pathname: window.location.pathname, fullurl: window.location.href, onPage: true};
			var generalElementsNeededSearch   = {DOM: document, search: window.location.search, fullurl: window.location.href, onPage: true};

			switch(storeID)
			{
				//=========== Typically stores that show one product per page and don't have an API ===============
				case "LDLC":
				case "hardwarefr":
				case "conradfr":
				case "grosbill":
				case "undiz":
				case "casekingde":
				case "zalandofr":
				case "topachatcom":
				case "rueducommercefr":
				case "materielnet":
				case "romwe":
				case "fnaccom":
				case "cdiscount": //No api for you
				case "aliexpresscom": //TODO api
					SPAPI.sendSimpleRecord(generalParameters, generalElementsNeededPathname);
					break;

				case "neweggcom":
					SPAPI.sendSimpleRecord(generalParameters, generalElementsNeededSearch);
					break;

				/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */

				

				//============ Typically stores that show one product per page but have an API =====================

				//TODO aliexpress

				/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */



				
				// =========== Typically stores that change URL when another color/size is selected ================
				case "amazoncom":
				case "amazonfr":
				case "amazoncouk":
				case "nike":
					var pathname = "";
					setInterval(()=>{
						if (pathname !== window.location.pathname) {
							pathname = window.location.pathname;
							generalElementsNeededPathname.pathname = pathname;

							SPAPI.sendSimpleRecord(generalParameters, generalElementsNeededPathname);
						}
					},
					2000);
					break;

				/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */


				// ================= Store that change currency/price without updating the URL =====================
				case "gearbestcom":
					var currency = "";

					setInterval(() => {
						var newCurrency = $("span.currency").text();
						if (currency !== newCurrency) {
							currency = newCurrency;
					
							SPAPI.sendSimpleRecord(generalParameters, generalElementsNeededPathname);
						}
					},
					2000);
					break;

				/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */

			}

		}
	}
});