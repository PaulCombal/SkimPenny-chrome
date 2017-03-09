let matches = [	/.*:\/\/.*ldlc.com\/fiche\/.*(\.html)$/g, 
				/.*:\/\/.*shop\.hardware\.fr\/fiche\/.*(\.html)$/g, 
				/.*:\/\/www\.amazon\.fr\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g, 
				/.*:\/\/www\.amazon\.com\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g, 
				/.*:\/\/www\.amazon\.co\.uk\/((.*\/)?dp\/|gp\/product\/)([0-9]|[A-Z]){10}\/?(.*)/g, 
				/.*:\/\/.*cdiscount\.com\/.*(\/f-[0-9]+-.*\.html((#|\?).*)?)$/g,
				/.*:\/\/.*conrad\.fr\/ce\/fr\/product\/[0-9]+\/.+/g,
				/.*\/\/store\.nike\.com\/.*\/pgid-[0-9]{8}/g,
				/.*\/\/www\.grosbill\.com\/4-.*/g,
				/.*\/\/www\.undiz\.com\/.*\/.*\/.*([0-9]\.html)$/g,
				/.*(fr|es|de)\.romwe\.com\/.*-p-[0-9]*-cat-[0-9]*\.html.*/g,
				/.*\/\/www\.zalando\.fr\/.*\.html.*/g,
				/.*\/\/www\.gearbest\.com\/.*\/pp_[0-9]{6}\.html.*/g,
				/.*\/\/www\.newegg\.com\/Product\/Product\.aspx\?(i|I)tem=.*/g];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	for (let i in matches) {
		if (tab.url.match(matches[i])){
			chrome.pageAction.show(tabId);
			break;
		}
	}
});

chrome.runtime.onMessage.addListener((request, sender, callback) => {
    if (request.action == "xhttp") {
		$.post("http://waxence.fr/skimpenny/add.php", 
			{
				store : request.storeName,
				product : request.productPage,
				price : request.price
			},
			logAddRecordResponse,
			'text')
		.fail(function(){
			console.log("Error sending request :(");
		});

        return true; // prevents the callback from being called too early on return
    }
});

function logAddRecordResponse(response){
	console.log("Scrooge answered:");
	console.log(response);
}