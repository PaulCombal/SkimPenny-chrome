let matches = ["://www.ldlc.com/fiche/", "://ldlc.com/fiche/" ]

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    for (let i in matches) {
        if (tab.url.includes(matches[i])) {
            chrome.pageAction.show(tabId);
            break;
        }
    }
})