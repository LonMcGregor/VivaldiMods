/*
* Inject Theme into Web Page (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
*/

(function injectTheme(){
    "use strict";
    /**
     * Array of strings of URLs matching web pages where variables are to be injected
     */
    const PAGES = [
        "chrome-extension://nnnheolekoehkioeicninoneagaimnjd/panel.html",
        "chrome-extension://jjmgbaeenpogabemadkdghpnccekgfol/theme_light.html",
        "chrome-extension://gnepfikbkdmdghjklhccpkplccnnjccm/panel.html"
    ];

    /**
     * Observe changes to theme info.
     * Also observe changes to main window class
     *  - makes it easier to update the theme when a webview is first created
     *  - just focus/unfocus the browser window
     */
    const THEME_OBSERVER = new MutationObserver(updatePages);
    function observeThemes(){
        THEME_OBSERVER.observe(document.querySelector("body"), {
            attributes: true,
            attributeFilter: ["style"]
        });
        THEME_OBSERVER.observe(document.querySelector("#browser"), {
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    /**
     * Send latest theme info to all pages
     * REMARK: Add additional custom css to line 3 of this function
     */
    function updatePages(){
        let css = ":root {\n "+document.body.style.cssText.replace(/;/g, ";\n").replace(/:/g, ": ")+" }";
        css = css.replace(/background-.+;/g, "");
        css += "";
        PAGES.forEach(page => {
            const webviews = Array.from(document.querySelectorAll(`webview[src="${page}"]`));
            webviews.forEach(webview => {
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
        });
    }

    /**
     * Initialise the mod.
     */
    function initMod(){
        if(document.querySelector("#main")){
            observeThemes();
            updatePages();
        } else {
            setTimeout(initMod, 500);
        }
    }

    initMod();
})();
