$(document).ready(function(){
	$("#local_storage").text(chrome.i18n.getMessage("local_storage"));
	$("#delete_local_content").text(chrome.i18n.getMessage("delete_local_content"));
	$("#clearButton").text(chrome.i18n.getMessage("button_delete_local_content"));
	$("#chart_look").text(chrome.i18n.getMessage("chart_look"));
	$("#contact_us").text(chrome.i18n.getMessage("contact_us"));
	$("#suggest_feature").text(chrome.i18n.getMessage("suggest_feature"));
	$("#our_mail").text(chrome.i18n.getMessage("our_mail"));
	// $("#").text(chrome.i18n.getMessage(""));


	$("#clearButton").click(clearContent);
});

function clearContent() {
	chrome.storage.sync.clear();
	console.log("Content cleared!");
}