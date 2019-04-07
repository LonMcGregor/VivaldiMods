/**
* Button Factory, a Mod for Vivaldi
* Make custom buttons that do stuff™ and add them to the vivaldi UI
* NO COPYRIGHT RESERVED, made by lonm.vivaldi.net
* Version 1.0.0
*/

(function buttonFactory(){
    /**
    * Add custom buttons here
    *
    * html: The HTML of a button
    * onclick: What to do when the button is clicked
    * contentScript: do something in a content script
    * placeAfter: CSS of where to place a button.
    */
    const MY_BUTTONS = {
        TaskManager: {
            html: `<button draggable="false" tabindex="-1" title="Open Vivaldi Task Manager">
                <svg viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 8v2h-2v-2h-4v2h-2v-4h6v-2h-2v-4h6v4h-2v2h6v4h-2v-2h-4zm-9 2v3h4v-3h-4zm12 0v3h4v-3h-4zm-6 0v3h4v-3h-4z"></path>
                </svg>
            </button>`,
            onclick: () => {
                vivaldi.utilities.openTaskManager(() => {});
            },
            placeAfter: "#switch button.addwebpanel"
        }
    };

    /**
     * Perform a content script activity
     * @param {function} func
     */
    function doContentScript(func){
        chrome.tabs.executeScript({
            code: `(${func})()`
        });
    }

    /**
     * Return the DOM for a button
     * @param buttondef The definition of the button to be added
     */
    function makeButton(buttondef) {
        const div = document.createElement("div");
        div.className = "button-toolbar";
        div.innerHTML = buttondef.html;
        const newBtn = div.firstChild;
        if(buttondef.onclick){
            newBtn.addEventListener("click", buttondef.onclick);
        }
        if(buttondef.contentScript){
            newBtn.addEventListener("click", () => {
                doContentScript(buttondef.contentScript);
            });
        }
        return div;
    }

    /**
     * Create and add a custom button to the UI
     * @param buttondef The definition of the button to be added
     */
    function createButton(buttondef){
        const existingUi = document.querySelector(buttondef.placeAfter);
        if(!existingUi){
            console.warn(`Can't add button as selector ${buttondef.placeAfter} is not ready`);
            return;
        }
        const button = makeButton(buttondef);
        existingUi.insertAdjacentElement("afterend", button);
    }

    /**
     * Make all the buttons defined in MY_BUTTONS
     */
    function makeAllButtons(){
        for(const buttonkey in MY_BUTTONS){
            createButton(MY_BUTTONS[buttonkey]);
        }
    }

    /**
     * Check that the browser is loaded up properly, and init the mod
     */
    function initMod(){
        if(!document.querySelector("#browser")){
            setTimeout(initMod, 500);
            return;
        }
        makeAllButtons();
    }

    initMod();
})();
