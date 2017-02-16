$(document).ready(function(){
	$("#clearButton").click(clearContent);
});

function clearContent() {
	chrome.storage.sync.clear();
	console.log("Content cleared!");
}