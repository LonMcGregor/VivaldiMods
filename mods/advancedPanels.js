/*
* Advanced Panels (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
*/

(function advancedPanels(){
"use strict";

    const $ = document.querySelector.bind(document);
    const $$ = document.createElement.bind(document);

    /**
     * Key is the ID of your advanced panel. This must be UNIQUE (across the whole vivaldi UI). If in doubt, append your name to ensure it is unique
     *     You can use this ID as a #selector in the advancedPanels.css file
     * title: String, self explanatory
     * url: String, a UNIQUE (amongst web panels) vivaldi:// url that points to a non-existent page. You must add this as a web panel
     * switch: String of HTML, this will be set as the html in the panel switch button. E.g. an SVG
     * initialHTML: String of HTML, this will be used to fill in the panel with a skeleton of HTML to use
     * module: () => {onInit, onActivate} All necessary javascript should be included here.
     *     onInit: () => void. This will be called AFTER the advanced panel DOM is added, but BEFORE onActivate is called.
     *     onActivate: () => void. This will be called each time the advanced panel is opened AND IMMEDIATELY AFTER onInit.
     */
    const CUSTOM_PANELS = {
        sessions_lonm: {
            title: "Sessions",
            url: "vivaldi://sessions",
            switch: `<span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="5 0 10 10">
                        <path d="M7 2h6v1h-6v-1zm0 2h6v1h-6v-1zm0 2h6v1h-6v-1z"></path>
                    </svg>
                </span>`,
            initialHTML: `
                <div class="newSession">
                    <h2>New Session</h2>
                    <input type="text" placeholder="Session Name">
                    <input type="checkbox"><label> All Windows</label>
                    <button>Add Session</button>
                </div>
                <div class="sortselector sortselector-compact">
                    <select class="sortselector-dropdown" title="Sort by..." tabindex="-1">
                        <option value="visitTime">Sort by Date</option>
                        <option value="title">Sort by Name</option>
                    </select>
                    <button class="sortselector-button direction-descending" title="Sort Ascending" tabindex="-1">
                        <svg width="11" height="6" viewBox="0 0 11 6" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5.133l.11-.11 4.456 4.456-1.498 1.497L5.5 2.91 2.432 5.976.934 4.48 5.39.022l.11.11z"></path>
                        </svg>
                    </button>
                    <button class="sortselector-button direction-ascending selected" title="Sort Descending" tabindex="-1">
                        <svg width="11" height="6" viewBox="0 0 11 6" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5.133l.11-.11 4.456 4.456-1.498 1.497L5.5 2.91 2.432 5.976.934 4.48 5.39.022l.11.11z"></path>
                        </svg>
                    </button>
                </div>
                <section class="sessionslist">
                    <ul>
                    </ul>
                </section>
                <div class="confirm">
                    <p>Are you sure you want to delete <span class="title"></span>?</p>
                    <button class="yes">⚠ Yes, Delete</button>
                    <button class="no">No, don't.</button>
                </div>`,
            module: function(){
                /**
                 * Open a session after its corresponding list item is clicked
                 * @param e click event
                 * REMARK: Hide the confirm box if it is open, but not if the click
                 *    happened on the delete button
                 */
                function sessionClick(e){
                    const oldselect = $("#sessions_lonm li.selected");
                    if(oldselect){
                        oldselect.classList.toggle("selected");
                    }
                    e.currentTarget.classList.toggle("selected");
                    if((e.target.tagName.toLowerCase()==="button" && e.target.className==="delete") ||
                       (e.target.tagName.toLowerCase()==="svg" && e.target.parentElement.className==="delete") ){
                           return;
                    }
                    $("#sessions_lonm .confirm").classList.remove("show");
                }

                /**
                 * Add a new session
                 * @param e button click event
                 */
                function addNewSession(e){
                    const name = $('#sessions_lonm .newSession input[type="text"]').value;
                    const windows = $('#sessions_lonm .newSession input[type="checkbox"]').checked;
                    if(name===""){
                        return;
                    }
                    vivaldi.windowPrivate.getCurrentId(window => {
                        vivaldi.sessionsPrivate.saveOpenTabs(name, {
                            saveOnlyWindowId: windows ? 0 : window
                        }, ()=>{
                            $('#sessions_lonm .newSession input[type="text"]').value = "";
                            $('#sessions_lonm .newSession input[type="checkbox"]').checked = false;
                            updateSessionListing();
                        });
                    });
                }

                /**
                 * Change sort Order
                 * @param e click event
                 */
                function sortOrderChange(e){
                    document.querySelectorAll("#sessions_lonm .sortselector-button").forEach(el => {
                        el.classList.toggle("selected");
                    });
                    updateSessionListing();
                }

                /**
                 * Change sort Method
                 * @param e click event
                 */
                function sortMethodChange(e){
                    updateSessionListing();
                }

                /**
                 * User clicked remove button
                 * @param e click event
                 */
                function sessionDeleteButtonClick(e){
                    const selectedSession = $("#sessions_lonm li.selected h3").innerText;
                    $("#sessions_lonm .confirm .title").innerText = selectedSession;
                    $("#sessions_lonm .confirm").classList.add("show");
                }

                /**
                 * User confirmed remove
                 * @param e event
                 */
                function sessionDeleteConfirm(e){
                    const selectedSession = $("#sessions_lonm li.selected h3").innerText;
                    vivaldi.sessionsPrivate.delete(selectedSession, ()=>{
                        updateSessionListing();
                    });
                }

                /**
                 * User cancelled remove
                 * @param e event
                 */
                function sessionDeleteCancel(e){
                    $("#sessions_lonm .confirm").classList.remove("show");
                }

                /**
                 * User clicked open (current) button
                 * @param e click event
                 */
                function sessionOpenCurrentButtonClick(e){
                    vivaldi.sessionsPrivate.open(
                        e.currentTarget.parentElement.querySelector("h3").innerText,
                        {openInNewWindow: false}
                    );
                }

                /**
                 * User clicked open (new) button
                 * @param e click event
                 */
                function sessionOpenNewButtonClick(e){
                    vivaldi.sessionsPrivate.open(
                        e.currentTarget.parentElement.querySelector("h3").innerText,
                        {openInNewWindow: true}
                    );
                }

                /**
                 * Generate a list item for a session object
                 * @returns DOM list item
                 */
                function createSessionItem(session){
                    const el = $$("li");
                    const date = new Date(session.createDateJS);
                    el.innerHTML = `<div>
                            <h3>${session.name}</h3>
                            <span>Created ${date.toLocaleString()}</span>
                        </div>
                        <button class="open_new" title="Open in new window">
                            <svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 6h-16v14h16v-14zm-11 2h2v2h-2v-2zm-3 0h2v2h-2v-2zm12 10h-12v-7h12v7zm0-8h-6v-2h6v2z"></path>
                            </svg>
                        </button>
                        <button class="open_current" title="Open in current window">
                            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 9h16v2h-16v-2zm0-4h8v4h-8v-4z"></path>
                            <path opacity=".5" d="M9 5h7v3h-7z"></path>
                            </svg>
                        </button>
                        <button class="delete" title="Delete this session">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
                            <path d="M10.2.5l-.7-.7L5 4.3.5-.2l-.7.7L4.3 5-.2 9.5l.7.7L5 5.7l4.5 4.5.7-.7L5.7 5"></path>
                            </svg>
                        </button>`;
                    el.addEventListener("click", sessionClick);
                    el.querySelector(".open_new").addEventListener("click", sessionOpenNewButtonClick);
                    el.querySelector(".open_current").addEventListener("click", sessionOpenCurrentButtonClick);
                    el.querySelector(".delete").addEventListener("click", sessionDeleteButtonClick);
                    return el;
                }

                /**
                 * Get the list of sessions and update the pnael accordingly
                 */
                function updateSessionListing(){
                    $("#sessions_lonm .confirm").classList.remove("show");
                    const existingList = $("#sessions_lonm .sessionslist ul");
                    if(existingList){
                        existingList.parentElement.removeChild(existingList);
                    }
                    const sortRule = $("#sessions_lonm .sortselector-dropdown").value;
                    const sortDescending = $("#sessions_lonm .direction-descending.selected");
                    vivaldi.sessionsPrivate.getAll(items => {
                        const newList = $$("ul");
                        if(sortRule==="visitTime" && sortDescending){
                            items.sort((a,b) => {return a.createDateJS > b.createDateJS;});
                        } else if (sortRule==="visitTime" && !sortDescending) {
                            items.sort((a,b) => {return a.createDateJS < b.createDateJS;});
                        } else if (sortRule==="title" && sortDescending) {
                            items.sort((a,b) => {return a.name < b.name;});
                        } else if (sortRule==="title" && !sortDescending) {
                            items.sort((a,b) => {return a.name > b.name;});
                        }
                        items.forEach((session, index) => {
                            const dom = createSessionItem(session, index);
                            newList.appendChild(dom);
                        });
                        $("#sessions_lonm .sessionslist").appendChild(newList);
                    });
                }

                /**
                 * Update the session listing on activation of panel
                 */
                function onActivate(){
                    updateSessionListing();
                }

                /**
                 * Add the sort listeners on creation of panel
                 */
                function onInit(){
                    document.querySelectorAll("#sessions_lonm .sortselector-button").forEach(el => {
                        el.addEventListener("click", sortOrderChange);
                    });
                    $("#sessions_lonm .sortselector-dropdown").addEventListener("change", sortMethodChange);
                    $("#sessions_lonm .confirm .yes").addEventListener("click", sessionDeleteConfirm);
                    $("#sessions_lonm .confirm .no").addEventListener("click", sessionDeleteCancel);
                    $("#sessions_lonm .newSession button").addEventListener("click", addNewSession);
                }

                return {
                    onInit: onInit,
                    onActivate: onActivate
                };
            }
        }
    };



    /**
     * Observe for changes to the UI, e.g. if panels are hidden by going in to fullscreen mode
     * This may require the panel buttons and panels to be re-converted
     */
    const UI_STATE_OBSERVER = new MutationObserver(records => {
        convertWebPanelButtonstoAdvancedPanelButtons();
        listenForNewPanelsAndConvertIfNecessary();
    });



    /**
     * Start listening for new web panel stack children and convert any already open ones
     */
    function listenForNewPanelsAndConvertIfNecessary(){
        WEBPANEL_CREATE_OBSERVER.observe($("#panels .webpanel-stack"), {childList: true});
        const currentlyOpen = document.querySelectorAll(".webpanel-stack .panel");
        currentlyOpen.forEach(convertWebPanelToAdvancedPanel);
    }

    /**
     * Observer that should check for child additions to web panel stack
     * When a new child is added (a web panel initialised), convert it appropriately
     */
    const WEBPANEL_CREATE_OBSERVER = new MutationObserver(records => {
        records.forEach(record => {
            record.addedNodes.forEach(convertWebPanelToAdvancedPanel);
        });
    });

    /**
     * Attempt to convert a web panel to an advanced panel.
     * First check if the SRC matches a registered value.
     * If so, call the advanced Panel Created method
     * @param node DOM node representing the newly added web panel (child of .webpanel-stack)
     * REMARK: Webview.src can add a trailing "/" to URLs
     */
    function convertWebPanelToAdvancedPanel(node){
        const addedWebview = node.querySelector("webview");
        if(!addedWebview){
            return;
        }
        for(const key in CUSTOM_PANELS){
            const panel = CUSTOM_PANELS[key];
            const expectedURL = panel.url;
            if(addedWebview.src.startsWith(expectedURL)){
                advancedPanelCreated(node, panel, key);
                break;
            }
        }
    }

    /**
     * Convert a web panel into an Advanced Panel™
     * @param node the dom node added under web panel stack
     * @param panel the panel object descriptor
     * @param panelId the identifier (key) for the panel
     * REMARK: Vivaldi can instantiate some new windows with an
     *    "empty" web panel containing nothing but the webview
     * REMARK: Can't simply call node.innerHTML as otherwise the
     *    vivaldi UI will crash when attempting to hide the panel
     * REMARK: Check that the panel isn't already an advanced panel
     *    before convert as this could be called after state change
     */
    function advancedPanelCreated(node, panel, panelID){
        if(node.getAttribute("advancedPanel")){
            return;
        }
        node.setAttribute("advancedPanel", "true");
        node.querySelector("webview").terminate();
        if(node.querySelector("h1")){
            node.querySelector("h1").innerHTML = panel.title;
        }
        const newHTML = $$("div");
        newHTML.innerHTML = panel.initialHTML;
        node.appendChild(newHTML);
        node.id = panelID;
        panel.module().onInit();
        ADVANCED_PANEL_ACTIVATION.observe(node, {attributes: true, attributeFilter: ["class"]});
        advancedPanelOpened(node);
    }



    /**
     * Observe attributes of an advanced panel to see when it becomes active
     */
    const ADVANCED_PANEL_ACTIVATION = new MutationObserver(records => {
        records.forEach(record => {
            if(record.target.classList.contains("visible")){
                advancedPanelOpened(record.target);
            }
        });
    });

    /**
     * An advanced panel has been selected by the user and is now active
     * @param node DOM node of the advancedpanel activated
     * REMARK: Vivaldi may change the panel title here, it will
     *     need to be reset to the expected value each activation
     */
    function advancedPanelOpened(node){
        const panel = CUSTOM_PANELS[node.id];
        node.querySelector("h1").innerHTML = panel.title;
        panel.module().onActivate();
    }



    /**
     * Go through each advanced panel descriptor and convert the associated button
     */
    function convertWebPanelButtonstoAdvancedPanelButtons(){
        for(const key in CUSTOM_PANELS){
            const panel = CUSTOM_PANELS[key];
            let switchBtn = $(`#switch button[title~="${panel.url}"`);
            if(!switchBtn){
                switchBtn = $(`#switch button[advancedPanelSwitch="${key}"`);
                if(!switchBtn){
                    console.warn(`Failed to find button for ${panel.title}`);
                    continue;
                }
            }
            convertSingleButton(switchBtn, panel, key);
        }
    }

    /**
     * Set the appropriate values to convert a regular web panel switch into an advanced one
     * @param switchBtn DOM node for the #switch button being converted
     * @param panel The Advanced panel object description
     * @param id string id of the panel
     * REMARK: Check that the button isn't already an advanced panel button
     *    before convert as this could be called after state change
     */
    function convertSingleButton(switchBtn, panel, id){
        if(switchBtn.getAttribute("advancedPanelSwitch")){
            return;
        }
        switchBtn.title = panel.title;
        switchBtn.innerHTML = panel.switch;
        switchBtn.setAttribute("advancedPanelSwitch", id);
    }



    /**
     * Initialise the mod. Checking to make sure that the relevant panel element exists first.
     */
    function initMod(){
        if($("#panels .webpanel-stack")){
            UI_STATE_OBSERVER.observe($("#browser"), {attributes: true, attributeFilter: ["class"]});
            convertWebPanelButtonstoAdvancedPanelButtons();
            listenForNewPanelsAndConvertIfNecessary();
        } else {
            setTimeout(initMod, 500);
        }
    }

    initMod();
})();
