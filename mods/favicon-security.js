/*
* Site Security Box Favicons (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
* This mod takes the favicon from a tab and places it into the address bar site info box
* Assumes presence of both the tab bar and the address bar
*/

// Constant CSS Selectors
const SECURITY_ZONE_ICON = "div.addressfield > button.button-addressfield.addressfield-siteinfo > div > svg";
const ACTIVE_TAB = ".tab.active .favicon";
const SECURITY_ZONE = "div.addressfield > button.button-addressfield.addressfield-siteinfo > div.siteinfo-symbol";

// Selectors and config for observers
const BROWSER_STATE_INDICATOR = "#browser"
const BROWSER_STATE_INDICATOR_CONFIG = {attributes: true}
const TAB_CHANGE_INDICATOR = ".tab-strip";
const TAB_CHANGE_INDICATOR_CONFIG = {attributes: true, subtree: true}

// Observer for changes to tab and browser state
const browserStateChangeObserver = new MutationObserver(browser_state_changed)
const differentTabActivatedObserver = new MutationObserver(tab_changed);

// The browser changed state,
// May need to re-observe deleted elements
// E.g. if enter and exit of fullscreen / hide UI mode
function browser_state_changed(m, o){
    //console.log("BROWSER STATE CHANGE");
    remove_existing_cloned_favicon();
    clone_favicon_and_add_to_security();
    differentTabActivatedObserver.disconnect();
    browserStateChangeObserver.disconnect();
    load_favicon_security_mod();
}

// The tab was changed, so favicon needs changing
// this will cover changes to the .active tab AND
// cover changes to the favicon span thru subtree
function tab_changed(m, o){
    //console.log("TAB STRIP ATTRIBUTE CHANGE");
    clone_favicon_and_add_to_security();
}

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
    const browser = document.querySelector(BROWSER_STATE_INDICATOR)
    const tab_change_indicator = document.querySelector(TAB_CHANGE_INDICATOR);
    if (browser && tab_change_indicator) {
        browserStateChangeObserver.observe(browser, BROWSER_STATE_INDICATOR_CONFIG);
        differentTabActivatedObserver.observe(tab_change_indicator, TAB_CHANGE_INDICATOR_CONFIG);
        clone_favicon_and_add_to_security();
    } else {
        setTimeout(load_favicon_security_mod, 100);
    }
}

// BROWSER LOADED - entry point
setTimeout(load_favicon_security_mod, 500);
