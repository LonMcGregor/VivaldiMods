/*
* Site Security Box Favicons (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
* This mod takes the favicon from a tab and places it into the address bar site info box
* Assumes presence of both the tab bar and the address bar
*/

(function faviconSecurity(){
    "use strict";

    // Constant CSS Selectors
    const SECURITY_ZONE_ICON = "div.addressfield > button.button-addressfield.addressfield-siteinfo > div > svg";
    const ACTIVE_TAB = ".tab.active .favicon";
    const SECURITY_ZONE = "div.addressfield > button.button-addressfield.addressfield-siteinfo > div.siteinfo-symbol";

    // Clone the favicon and add a copy to the security zone
    // also style it appropriately
    function clone_favicon_and_add_to_security(){
        // make sure everything we need to access exists
        const sz_icon = document.querySelector(SECURITY_ZONE_ICON);
        const favicon_original = document.querySelector(ACTIVE_TAB);
        const siteinfo = document.querySelector(SECURITY_ZONE);
        if(!favicon_original || !sz_icon || !siteinfo){return;}
        remove_existing_cloned_favicon();
        // copy, style and set the favicon
        // use deep clone to also copy svg icons
        const favicon = favicon_original.cloneNode(true);
        favicon.style.width = "16px";
        favicon.style.height = "16px";
        favicon.style.display = "block";
        favicon.style.margin = "3px";
        favicon.style.backgroundSize = "contain";
        siteinfo.style.display = "flex";
        sz_icon.parentNode.insertBefore(favicon, sz_icon);
    }

    // Remove any existing cloned favicon
    function remove_existing_cloned_favicon(){
        const old_sz_favicon = document.querySelector(SECURITY_ZONE+" .favicon");
        if(old_sz_favicon){
            old_sz_favicon.parentElement.removeChild(old_sz_favicon);
        }
    }

    // Load the mod
    function load_favicon_security_mod(){
        const browser = document.querySelector(".favicon");
        if (browser) {
            clone_favicon_and_add_to_security();
        } else {
            setTimeout(load_favicon_security_mod, 100);
        }
    }

    // BROWSER LOADED - entry point
    setTimeout(load_favicon_security_mod, 500);

    // The tab was changed, so favicon needs changing
    // this will cover changes to the .active tab AND
    // cover changes to the favicon span thru subtree
    chrome.tabs.onActivated.addListener(activeInfo => {
        vivaldi.windowPrivate.getCurrentId(id => {
            if(activeInfo.windowId === id){
                clone_favicon_and_add_to_security();
            }
        });
    });
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if(changeInfo.faviconUrl || changeInfo.status){
            clone_favicon_and_add_to_security();
        }
    });

})();
