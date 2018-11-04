/*
* TLD Plus One Only (a mod for Vivaldi)
* LonM
*/

/** todo fix case when user entered random teext then unfocused */

(function tldPlusOneOnly(){
    "use strict";

    /* Add the mask in again when no longer focused */
    function addressBarUnFocused(event){
        textChanged(event.target);
    }

    /* If text box doesn't have focus and the input changes, activate or update the mod */
    function textChanged(target){
        const newText = target.value;
        if(newText===""){
            setTldPlusOne("");
        }
        if(!newText){
            return;
        }
        const tldText = getTldPlusOne(newText);
        if(tldText==="chrome-extension:"){
            const extensionIdPlusPath = newText.replace("chrome-extension://", "");
            const extensionIdOnly = extensionIdPlusPath.split("/")[0];
            chrome.management.get(extensionIdOnly, extInfo => {
                setTldPlusOne("chrome-extension: "+extInfo.name);
            });
            return;
        }
        setTldPlusOne(tldText);
    }

    /**
     * Get the tld plus one part of domain from the full url
     * If IP address, return it in full
     * @param {string} fullUrl
     * @returns {string} of the tld plus first part of domain
     */
    function getTldPlusOne(fullUrl){
        let noProtocol = fullUrl;
        if(fullUrl.indexOf("://") > -1 && fullUrl.indexOf("://") < 10){
            noProtocol = fullUrl.split("://")[1];
        }
        let domainOnly = noProtocol;
        if(noProtocol.indexOf("/") > -1) {
            domainOnly = noProtocol.split("/")[0];
        }

        const guffDomains = ["www", "m"];
        for (let index = 0; index < guffDomains.length; index++) {
            const guffDomain = guffDomains[index];
            if(domainOnly.indexOf(guffDomain+".")===0){
                domainOnly = domainOnly.replace(guffDomain+".", "");
            }
        }

        return domainOnly;
    }

    /**
     * Set the tldPlusOne text
     * @param {string} tldPlusOne
     */
    function setTldPlusOne(tldPlusOne){
        const form = document.querySelector("#main > div.toolbar-addressbar.search.toolbar > div.addressfield > form");
        form.setAttribute("data-url", tldPlusOne);
    }

    /**
     * Change to address bar ocurred
     */
    const addressBarTextChanged = new MutationObserver(mutationRecords => {
        if(mutationRecords[0].attributeName === "value"){
            textChanged(mutationRecords[0].target);
        }
    });

    /**
     * Initialise the mod, listen and observe for changes
     * Also set the initial values
     * @param {DomElement} addressBarElement
     */
    function init(addressBarElement){
        addressBarElement.addEventListener("blur", addressBarUnFocused);
        addressBarTextChanged.observe(addressBarElement, {attributes: true});
        textChanged({target:addressBarElement});
    }

    /**
     * Wait for browser to load
     */
    setTimeout(function wait(){
        "use strict";
        const addressBarElement = document.querySelector("input.url.vivaldi-addressfield");
        if(addressBarElement){
            init(addressBarElement);
        } else {
            setTimeout(wait, 500);
        }
    }, 500);
})();
