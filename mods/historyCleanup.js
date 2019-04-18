/**
 * History Cleanup - A mod for vivaldi
 * lonm.vivaldi.net
 * Back up your history first!
 *
 * Vivaldi History Private API
 *
 * HistoryResultSetGrouping enum: KEEP_ALL_DUPLICATES, REMOVE_ALL_DUPLICATES, REMOVE_DUPLICATES_PER_DAY
 * transitionType: same as chrome.history.transitionType https://developer.chrome.com/extensions/history#transition_types
 * dbSearch: Advanced search, interface matches chrome.history.search https://developer.chrome.com/extensions/history#method-search
 * deleteAllSearchTermsForKeyword: Param is an int, it does ???
 * deleteVisits: Remove specific visitItems from the history, as per https://developer.chrome.com/extensions/history#type-VisitItem, unsure of interface
 * getTopUrlsPerDay: Given a number (max url results), get the top results per day. ALL OF THEM. Returns array of History items
 * getTypedHistory: string query, integer prefixKeywordId, integer max_results, function callback. Gets typed history. Keyword must refer to search engines? Unsure.
 * setKeywordSearchTermsForURL: string url, integer keywordId, string searchTerms. No clue what this does
 * visitSearch: super advanced search - can return everything if given empty query object
 *
 *
 *
 *
 */

(function historyCleanup(params) {
    "use strict";

    const VIZ = true;

    let ACTIVE_URL = "";

    let _duplicates =  [];

    let duplicates = {
        addDupe: site => {
            if(VIZ){
                const span = document.createElement("span");
                span.innerText = site;
                document.querySelector("#dupes").appendChild(span);
            }
            _duplicates.push(site);
        }
    };

    function removeDuplicates(historyItems){
        historyItems.forEach(historyItem => {
            const url = historyItem.url;
            ACTIVE_URL = url;
            const trimmedURL = url.substring(0, url.indexOf("#"));
            duplicates.addDupe(url);
            /*chrome.history.search({
                text: trimmedURL,
                startTime: 0,
                maxResults: 100000
            }, potentialDuplicates => {
                potentialDuplicates.forEach(oldUrl => {
                    if(oldUrl.url.indexOf(prefix)===0){
                        document.write(oldUrl.url + ' is dupe of ' + url.url);
                    }
                });
            });*/
        });
    }

    function getLastDaysHistory(){
        // startTime If not specified, this defaults to 24 hours in the past.
        chrome.history.search({
            text: document.querySelector("input").value, // only look for anchor tags that might be duplicates
            startTime: 0,
            maxResults: 100000
        }, removeDuplicates);
    }

    document.querySelector("#b1").addEventListener("click", getLastDaysHistory);
    /*
    if(VIZ){
        setInterval(() => {
            document.querySelector("#activeURL").innerText = ACTIVE_URL;
        }, 1000);
    }
    */

    function cleanUpForumDupeEntries(){
        vivaldi.historyPrivate.dbSearch({text:"forum.vivaldi.net/topic/", maxResults:100000, startTime:0}, entries => {
            const matchEndsWithDigits = /https:\/\/forum.vivaldi.net\/topic\/\d+\/[\d\w-]+\/\d*/;
            const dupicatedForumEntries = entries.filter(historyItem => matchEndsWithDigits.exec(historyItem.url));
            console.log(dupicatedForumEntries);
            dupicatedForumEntries.forEach(dupe => {
                chrome.history.deleteUrl({url: dupe.url});
            });
        });
    }


});
