/**
* Button Factory, a Mod for Vivaldi
* Make custom buttons that do stuff™ and add them to the vivaldi UI
* NO COPYRIGHT RESERVED, made by lonm.vivaldi.net
* Version 1.0.0
*/

(function buttonFactory(){
    /**
    * Dictionary of buttons.
    * They will be added to the ui in the order specified below.
    *
    * Content Script: Wheter this action should execute on the currently active tab or the browser UI
    * Script: A function(event){}, where event is the user click in the UI, or just a function to execute on the page
    * Display: The innerHTML of the toolbar button
    * Display Class: One or more classes to give the button
    * where_type: "BEFORE", "AFTER", "CHILD" of the element specified by
    * where_selector: A css selector for where to place the new button
    * additional_css: CSS text applied to the button object's css attribute
    */
    const MY_BUTTONS = {
        /*OpenSettingsPage: {
            title: "Open a new page with the chrome settings",
            content_script: false,
            script: (event) => {
                //do a thing in the browser, with access to parts of the chrome.* API and vivaldi UI
                chrome.tabs.create({"url":"chrome://settings"});
            },
            display: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
            <path d="M15 6h-4v5h-4l6 6 6-6h-4v-5zm-9 16h14v-2h-14v2z"></path>
          </svg>`,
            css_class: "preferences",
            where_type: "BEFORE",
            where_selector: "#switch > button.preferences",
            additional_css: `
                fill: blue;
            `
        },

        DifferentRefreshButton: {
            title: "Refresh the page",
            content_script: true,
            script: () => {
                //do a thing in the active tab, with access to the usual web javascript APIs
                window.location.reload();
            },
            display: `<span>RELOAD</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
            <path d="M19.3,16c-1,2.2-3.2,3.9-5.8,3.9c-3.5,0-6.4-2.9-6.4-6.4s2.9-6.4,6.4-6.4c1.8,0,3.3,0.7,4.5,1.9l-2.8,3H22V5l-2.5,2.5C18,6,15.8,5,13.5,5C8.8,5,5,8.8,5,13.5S8.8,22,13.5,22c3.8,0,7-2.6,8.1-6H19.3z"></path>
          </svg>`,
            css_class: "button-toolbar-small page-action",
            where_type: "AFTER",
            where_selector: "#footer > div.status-toolbar > span.tilingtoggle",
            additional_css: `
                font-family: "Comic Sans MS", cursive;
            `
        },*/

        TaskManager: {
            title: "Open Vivaldi Task Manager",
            content_script: false,
            script: () => {
                vivaldi.utilities.openTaskManager(() => {});
            },
            display: `<svg viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 8v2h-2v-2h-4v2h-2v-4h6v-2h-2v-4h6v4h-2v2h6v4h-2v-2h-4zm-9 2v3h4v-3h-4zm12 0v3h4v-3h-4zm-6 0v3h4v-3h-4z"></path>
          </svg>`,
            css_class: "button-toolbar-small",
            where_type: "BEFORE",
            where_selector: "#footer > div.sync-status",
            additional_css: ``
        },

        ActivateAllPanels: {
            title: "Simulate clicks to activate and load all web panels",
            content_script: false,
            script: () => {
                const webPanels = document.querySelectorAll("#switch button.webviewbtn");
                webPanels.forEach(button => {
                    button.click();
                });
                webPanels[webPanels.length-1].click();
            },
            display: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M4.5 4.5C5.4 3.6 6.6 3 8 3c2.8 0 5 2.2 5 5h2c0-3.9-3.1-7-7-7-1.9 0-3.7.8-4.9 2.1L1 1v6h6L4.5 4.5zM11.5 11.5c-.9.9-2.1 1.5-3.5 1.5-2.8 0-5-2.2-5-5H1c0 3.9 3.1 7 7 7 1.9 0 3.7-.8 4.9-2.1L15 15V9H9l2.5 2.5z"></path>
          </svg>`,
          css_class: "button-toolbar-small",
          where_type: "BEFORE",
          where_selector: "#footer > div.sync-status",
          additional_css: ``
        }
    };

    /**
     * Take a script and append it to the page, then execute it.
     * @param script function to execute on the page
     */
    function content_script(script){
        const webview = document.querySelector("#webpage-stack > div.active.visible.webpageview webview");
        const scriptText = "("+script+")()";
        webview.executeScript({code: scriptText});
    }

    /**
     * Return the DOM for a button
     * @param buttondef The definition of the button to be added
     */
    function makeButton(buttondef) {
        const newBtn = document.createElement("button");
        newBtn.className = buttondef.css_class+" lonm_custom_button";
        newBtn.innerHTML = buttondef.display;
        if(buttondef.content_script){
            newBtn.addEventListener("click", event => {content_script(buttondef.script);});
        } else {
            newBtn.addEventListener("click", buttondef.script);
        }
        newBtn.title = buttondef.title;
        newBtn.style = buttondef.additional_css;
        return newBtn;
    }

    /**
     * Add the new button into the UI
     * @param buttonDom The DOM object for the new button
     * @param existingUi The DOM object for the existing UI to attach to
     * @param how The method of choosing hwo to place the new button
     */
    function addButtonToUi(buttonDom, existingUi, how){
        switch(how){
            case "BEFORE":
            existingUi.parentNode.insertBefore(buttonDom, existingUi);
                break;
            case "AFTER":
                if(existingUi.nextSibling){
                    existingUi.parentNode.insertBefore(buttonDom, existingUi.nextSibling);
                } else {
                    existingUi.parentNode.appendChild(buttonDom);
                }
                break;
            case "CHILD":
                existingUi.appendChild(buttonDom);
                break;
            default:
                console.warn(`Bad selector type ${how}`);
        }
    }

    /**
     * Create and add a custom button to the UI
     * @param buttondef The definition of the button to be added
     */
    function createButton(buttondef){
        const existingUi = document.querySelector(buttondef.where_selector);
        if(!existingUi){
            console.warn(`Can't add button as selector ${buttondef.where_selector} is not ready`);
            return;
        }
        const button = makeButton(buttondef);
        addButtonToUi(button, existingUi, buttondef.where_type);
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
