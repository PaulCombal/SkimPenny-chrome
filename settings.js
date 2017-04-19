$(document).ready(function(){
	$("#local_storage").text(chrome.i18n.getMessage("local_storage"));
	$("#delete_local_content").text(chrome.i18n.getMessage("delete_local_content"));
	$("#clearButton").text(chrome.i18n.getMessage("button_delete_local_content"));
	$("#chart_look").text(chrome.i18n.getMessage("chart_look"));
	$("#contact_us").text(chrome.i18n.getMessage("contact_us"));
	$("#suggest_feature").text(chrome.i18n.getMessage("suggest_feature"));
	$("#our_mail").text(chrome.i18n.getMessage("our_mail"));
	$("#saveAppearance").text(chrome.i18n.getMessage("save"));
	$("option[value=line]").text(chrome.i18n.getMessage("option_line"));
	$("option[value=spline]").text(chrome.i18n.getMessage("option_spline"));
	$("option[value=step]").text(chrome.i18n.getMessage("option_step"));
	// $("#").text(chrome.i18n.getMessage(""));


	$("#clearButton").click(clearContent);
	$("#saveAppearance").click(saveStyle);
	$("#debugStorage").click(showStorage);
});

function clearContent() {
	chrome.storage.sync.clear(() => { noticeDone($("#clearButton")); });
}

function saveStyle() {
	var newStyle = $('#chartDesignSelect').val();
	chrome.storage.sync.set({chartStyle: newStyle},
		() => { noticeDone($("#saveAppearance")); });
}

function noticeDone(buttonDOM) {
	var oldtext = $(buttonDOM).text();
	$(buttonDOM).text(chrome.i18n.getMessage("done"));
	setTimeout(()=>{$(buttonDOM).text(oldtext);}, 3000);
}

function showStorage() {
	chrome.storage.sync.get(null, (data)=>{console.log(data);});
}