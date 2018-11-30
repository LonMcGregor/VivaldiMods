/*
* Inject Theme into Web Page (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
*/

(function advancedPanels(){
    "use strict";

    /* Aliases for sanity */
    const $ = document.querySelector.bind(document);

    /**
     * Array of strings of URLs matching web pages where variables are to be injected
     */
    const PAGES = [
        "chrome-extension://nnnheolekoehkioeicninoneagaimnjd/panel.html",
        "chrome-extension://jjmgbaeenpogabemadkdghpnccekgfol/theme_light.html"
    ];

    /**
     * Observe changes to theme info
     */
    const THEME_OBSERVER = new MutationObserver(updatePages);

    /**
     * Observe theme changes
     */
    function observeThemes(){
        THEME_OBSERVER.observe($("body"), {
            attributes: true,
            attributeFilter: ["style"]
        });
    }

    /**
     * Send latest theme info to all pages
     * REMARK: Add additional custom css to line 3 of this function
     */
    function updatePages(){
        let css = ":root {\n "+document.body.style.cssText.replace(/;/g, ';\n').replace(/:/g, ': ')+" }";
        css = css.replace(/background-.+;/g, "");
        css += ``;
        PAGES.forEach(page => {
            const webview = $(`webview[src="${page}"]`);
            if(!webview){return;}
            webview.executeScript({
                code: `(function(){
                    "use strict";
                    const alreadyAddedStyles = document.querySelector('style[vStyleInjected]');
                    if(alreadyAddedStyles){
                        alreadyAddedStyles.innerText = \`${css}\`;
                    } else {
                        const style = document.createElement("style");
                        style.setAttribute("vStyleInjected", "");
                        style.innerText = \`${css}\`;
                        document.body.appendChild(style);
                    }
                })();`
            });
        });
    }

    /**
     * Initialise the mod.
     */
    function initMod(){
        if($("#main")){
            observeThemes();
            updatePages();
        } else {
            setTimeout(initMod, 500);
        }
    }

    initMod();
})();
