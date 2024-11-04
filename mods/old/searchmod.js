function searchmod(){
const SEARCH_NAME_DDG = "DuckDuckGo";
const SEARCH_URL_TEMPLATE_DDG = "https://duckduckgo.com/?q=%s&t=vivaldi";
const UNIQUE_MENU_ID_DDG = "context-search-unique-id-ddg";
chrome.contextMenus.create({
    "type": "normal",
    "id": UNIQUE_MENU_ID_DDG,
    "title": "Search with "+SEARCH_NAME_DDG,
    "contexts": ["selection"]
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if(info.menuItemId===UNIQUE_MENU_ID_DDG){
        const search_url = SEARCH_URL_TEMPLATE_DDG.replace("%s", info.selectionText);
        chrome.tabs.create({"url": search_url});
    }
});
}

function waitforsearchmod(){
    if(!document.querySelector("#browser")){
        setTimeout(waitforsearchmod, 500);
    } else {
        searchmod();
    }
}
waitforsearchmod();