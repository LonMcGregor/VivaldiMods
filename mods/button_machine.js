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
            html: `<button class="button-toolbar-small" title="Open Vivaldi Task Manager">
                <svg viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 8v2h-2v-2h-4v2h-2v-4h6v-2h-2v-4h6v4h-2v2h6v4h-2v-2h-4zm-9 2v3h4v-3h-4zm12 0v3h4v-3h-4zm-6 0v3h4v-3h-4z"></path>
                </svg>
            </button>`,
            onclick: () => {
                vivaldi.utilities.openTaskManager(() => {});
            },
            placeAfter: "#footer > div > div:nth-child(1)"
        },

        ActivateAllPanels: {
            html: `<button class="button-toolbar-small" title="Open Vivaldi Task Manager">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path d="M4.5 4.5C5.4 3.6 6.6 3 8 3c2.8 0 5 2.2 5 5h2c0-3.9-3.1-7-7-7-1.9 0-3.7.8-4.9 2.1L1 1v6h6L4.5 4.5zM11.5 11.5c-.9.9-2.1 1.5-3.5 1.5-2.8 0-5-2.2-5-5H1c0 3.9 3.1 7 7 7 1.9 0 3.7-.8 4.9-2.1L15 15V9H9l2.5 2.5z"></path>
                </svg>
            </button>`,
            onclick: () => {
                const webPanels = document.querySelectorAll("#switch button.webviewbtn");
                webPanels.forEach(button => {
                    button.click();
                });
                webPanels[webPanels.length-1].click();
            },
            placeAfter: "#footer > div > div:nth-child(1)"
        },
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
        return newBtn;
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
