/**
 * Disable Extensions (a mod for vivaldi)
 * @author lonm.vivaldi.net
 */

(function disableExtensions(){
"use strict";
    /**
     * Create an extension button to show in dropdown if it is disabled
     * @param {*} extensionInfo
     * @returns DOM button
     */
    function makeCustomExtensionButton(extensionInfo){
        const span = document.createElement("span");
        const button = document.createElement("button");
        button.className = "button-hidden-popup button-toolbar browserAction-button lonm-demod";
        button.tabIndex = "-1";
        button.id = extensionInfo.id;
        button.title = extensionInfo.shortName + (extensionInfo.enabled ? "" : " (Disabled)");
        button.style.opacity = extensionInfo.enabled ? "1" : "0.5";
        button.draggable = false;
        listenToExtensionButton(button);
        const img = document.createElement("img")
        if(extensionInfo.icons && extensionInfo.icons.length > 1){
            img.src = extensionInfo.icons[0].url;
        } else {
            img.src = "chrome://favicon/chrome://extensions/";
        }
        button.appendChild(img);
        span.appendChild(button);
        return span;
    }

    /**
     * Create a separator for the extension dropdown
     * @param title string
     * @returns DOM separator
     */
    function createSeparator(title){
        const separator = document.createElement("div");
        separator.style.border = "1px solid var(--colorBorderIntense)";
        separator.style.width = "100%";
        separator.style.height = "2px";
        separator.title = title;
        return separator;
    }

    /**
     * Add a listener to a specific button
     * @param {*} button DOM
     */
    function listenToExtensionButton(button){
        button.addEventListener("click", toggleDisabled);
    }

    /**
     * Get all of the extensions that already have an icon displayed
     * @returns array of strings of extension ids
     */
    function alreadyShownExtensions(){
        const buttons = document.querySelectorAll(".button-toolbar.browserAction-button:not(.actionVisibility-hidden)");
        const arrr = [];
        buttons.forEach(button => {
            arrr.push(button.id);
        });
        return arrr;
    }

    /**
     * The observer fired, so the dropdown was added
     * so add the "disable" listener to each button
     * @param {*} mutationList
     */
    function dropdownObserverFired(mutationList){
        mutationList.forEach(mutation => {
            mutation.addedNodes.forEach(dropdown => {
                if(dropdown.classList.contains("extension-popup")){
                    dropdown.childNodes.forEach(button => {
                        listenToExtensionButton(button);
                    });
                    chrome.management.getAll(extensions => {
                        const presentInUi = alreadyShownExtensions();
                        const missingFromUi = extensions.filter(x => presentInUi.indexOf(x.id)===-1);
                        const missingFromUiAndEnabled = missingFromUi.filter(x => x.enabled);
                        const missingFromUiAndDisabled = missingFromUi.filter(x => !x.enabled);
                        dropdown.appendChild(createSeparator("▼ Extensions without a Browser Action"));
                        missingFromUiAndEnabled.forEach(extension => {
                            const newButton = makeCustomExtensionButton(extension);
                            dropdown.appendChild(newButton);
                        });
                        dropdown.appendChild(createSeparator("▼ Disabled Extensions"));
                        missingFromUiAndDisabled.forEach(extension => {
                            const newButton = makeCustomExtensionButton(extension);
                            dropdown.appendChild(newButton);
                        });
                    });
                }
            });
        });
    }

    /**
     * The observer fired, so a new extension button was added
     * add the "disable" listener to it
     * @remark new addition may be the browser action popup
     *    which is a DIV so test to make sure it is a SPAN
     * @param {*} mutationList
     */
    function buttonObserverFired(mutationList){
        mutationList.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if(node.tagName.toUpperCase()==="SPAN"){
                    listenToExtensionButton(node.querySelector("button"));
                }
            });
        });
    }

    /** Observers */
    const dropdownObserver = new MutationObserver(dropdownObserverFired);
    const buttonObserver = new MutationObserver(buttonObserverFired);
    const observerConfig = {childList: true};

    /**
     * Listen to existing buttons
     */
    function listenToExistingButtons(){
        const existingButtons = document.querySelectorAll(".toolbar-addressbar > .extensions-wrapper > span > .browserAction-button");
        existingButtons.forEach(listenToExtensionButton);
    }

    /**
     * Init the mod
     */
    function init(){
        if(!document.querySelector(".extensions-wrapper")){
            setTimeout(init, 500);
        } else {
            dropdownObserver.observe(document.querySelector(".toolbar-addressbar > .extensions-wrapper > .button-group"), observerConfig);
            buttonObserver.observe(document.querySelector(".toolbar-addressbar > .extensions-wrapper"), observerConfig);
            listenToExistingButtons();
        }
    }

    /**
     * User clicked on extension button
     * If it meets our criteria, toggle the disableness
     * @param {*} event
     */
    function toggleDisabled(event){
        if(event.ctrlKey){
            let target = event.target;
            if(event.target.tagName.toUpperCase()==="IMG"){
                target = target.parentElement;
            }
            const extensionContainer = target.parentElement.parentElement;
            chrome.management.get(target.id, extensionInfo => {
                doToggledisabled(extensionInfo, extensionContainer, target);
            });
            event.preventDefault();
        }
    }

    /**
     * We will now toggle the state of this item
     * @param {*} extensionInfo
     * @param {*} extensionContainer DOM
     * @param {*} extensionButton DOM
     */
    function doToggledisabled(extensionInfo, extensionContainer, extensionButton){
        if(!extensionInfo.mayDisable){
            return;
        }
        const newEnabledstate = !extensionInfo.enabled;
        chrome.management.setEnabled(extensionInfo.id, newEnabledstate, () => {
            extensionInfo.enabled = newEnabledstate;
            toggleCallback(extensionInfo, extensionContainer, extensionButton);
        });
    }

    /**
     * Extension was toggled.
     * Clean upp the UI afterwards
     * @param {*} extensionInfo
     * @param {*} extensionContainer DOM
     * @param {*} extensionButton DOM
     */
    function toggleCallback(extensionInfo, extensionContainer, extensionButton){
        listenToExistingButtons();
        const containerIsPopup = extensionContainer.classList.contains("extension-popup");
        if(!containerIsPopup){
            return;
        }
        const isCustomButton = extensionButton.classList.contains("lonm-demod");
        if(extensionInfo.enabled){
            extensionContainer.removeChild(extensionButton.parentElement);
            const buttonAdddToMainExtensionsArea = alreadyShownExtensions().indexOf(extensionInfo.id) > -1;
            if(isCustomButton && !buttonAdddToMainExtensionsArea){
                const newButton = makeCustomExtensionButton(extensionInfo);
                const disabledSeparator = extensionContainer.querySelector("div:nth-of-type(2)");
                extensionContainer.insertBefore(newButton, disabledSeparator);
            }
        } else {
            const newButton = makeCustomExtensionButton(extensionInfo);
            extensionContainer.appendChild(newButton);
            if(isCustomButton){
                extensionContainer.removeChild(extensionButton.parentElement);
            }
        }
    }

    setTimeout(init, 500);
})();
