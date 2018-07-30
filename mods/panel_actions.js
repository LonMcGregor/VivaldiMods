/*
* Panel Actions (A Mod for Vivaldi)
* LonM.vivaldi.net
* No Copyright Reserved
*/

(function panel_actions(){
    "use strict";

    const ZOOM_STEP = 0.1; /*Step amount. 0.1 is 10%*/

    /*
    Dictionary of panel actions.
    They will be added to the toolbar in the order specified below.
    key must be unique
    title: string for tooltip
    script: (target, webview) => {}: void. target is button that was clicked. webview is the webview attached to the button
        for content scripts, Call doContentScript with the webview and a () => {}: void
    display: string of html - The innerHTML of the toolbar button
    display_class: string - One or more classes to give the button
    */
    const ACTIONS = {

        zoom_out: {
            title: "Decrease zoom",
            script: function(target, webview){
                webview.getZoom(current => {
                    changeZoom(webview, current -= ZOOM_STEP);
                });
            },
            display: `-`,
            display_class: `zoom-out`
        },

        zoom_reset: {
            title: "Set zoom to 100%",
            script: function(target, webview){
                changeZoom(webview, 1);
            },
            display: `100%`,
            display_class: `zoom-reset`
        },

        zoom_in: {
            title: "Increase zoom",
            script: function(target, webview){
                webview.getZoom(current => {
                    changeZoom(webview, current += ZOOM_STEP);
                });
            },
            display: `+`,
            display_class: `zoom-in`
        },

        invert: {
            title: "Invert the colours on the page",
            script: function(target, webview){
                doContentScript(webview, () => {
                    const style_element = document.createElement('style');
                    style_element.innerHTML = `
                        html { background-color: white;}
                        body.inverted {filter: invert(1) hue-rotate(180deg);}
                        body.inverted img,
                        body.inverted video {filter: invert(1) hue-rotate(180deg);}`;
                    document.body.appendChild(style_element);
                    document.body.classList.toggle("inverted");
                });
            },
            display: `<svg viewBox="-4 -4 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 7.984375 0 A 7.9850645 7.9850645 0 0 0 0 7.984375 A 7.9850645 7.9850645 0 0 0 7.984375 15.970703 A 7.9850645 7.9850645 0 0 0 15.970703 7.984375 A 7.9850645 7.9850645 0 0 0 7.984375 0 z M 7.9960938 0.74804688 L 7.9960938 7.984375 L 7.9960938 15.222656 A 7.2378569 7.2378569 0 0 1 1.7265625 11.603516 A 7.2378569 7.2378569 0 0 1 1.7265625 4.3652344 A 7.2378569 7.2378569 0 0 1 7.9960938 0.74804688 z " fill=""></path>
            </svg>`,
            display_class: "panel-action-invert"
        },

        terminate: {
            title: "Kills the panel to free memory",
            script: function(target, webview){
                webview.terminate();
            },
            display: `x`,
            display_class: `panel-action-terminate`
        },

        mute: {
            title: "Toggle mute state",
            script: function(target, webview){
                webview.isAudioMuted(mute => {
                    webview.setAudioMuted(!mute);
                    target.innerHTML = mute ? `<svg viewBox="-4 -4 20 20" xmlns="http://www.w3.org/2000/svg"><path d="m 10.425781,0 -5.5410155,4.96094 h -4.234375 v 4.74805 h 4.1074219 l 5.6679686,5.23047 z m 1.767579,1.50782 v 0.59961 c 0.628524,0 1.262682,0.52233 1.751953,1.49023 0.489269,0.96789 0.804686,2.34168 0.804686,3.86133 0,1.51964 -0.315417,2.89148 -0.804686,3.85937 -0.489271,0.9679 -1.123429,1.49219 -1.751953,1.49219 v 0.59961 c 0.949262,0 1.742407,-0.74276 2.287109,-1.82031 0.544702,-1.07756 0.869141,-2.52926 0.869141,-4.13086 0,-1.60161 -0.324439,-3.05525 -0.869141,-4.13281 -0.544702,-1.07755 -1.337847,-1.81836 -2.287109,-1.81836 z m -0.921875,1.97851 v 0.59961 c 0.378754,0 0.787693,0.3227 1.113281,0.9668 0.325586,0.64409 0.539061,1.57016 0.539061,2.5957 1e-6,1.02554 -0.213475,1.95161 -0.539061,2.5957 -0.325588,0.64409 -0.734527,0.9668 -1.113281,0.9668 v 0.59961 c 0.699491,0 1.267416,-0.54311 1.648436,-1.29687 0.381021,-0.75375 0.603517,-1.75774 0.603517,-2.86524 0,-1.1075 -0.222496,-2.11344 -0.603517,-2.86719 -0.38102,-0.75375 -0.948945,-1.29492 -1.648436,-1.29492 z"></path></svg>`
                        : `<svg viewBox="-4 -4 20 20" xmlns="http://www.w3.org/2000/svg"><path d="m 10.425781,-0.1412354 -5.5410155,4.96094 H 0.6503908 v 4.75 h 4.1074217 l 5.6679685,5.2285204 z m 0.853516,4.1211 -0.707031,0.70703 1.917969,1.91797 -1.917969,1.91992 0.707031,0.70703 1.917969,-1.91992 1.919922,1.91992 0.707031,-0.70703 -1.919922,-1.91992 1.919922,-1.91797 -0.707031,-0.70703 -1.919922,1.91796 z"></path></svg>`;
                });
            },
            display: `<svg viewBox="-4 -4 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="m 10.425781,0 -5.5410155,4.96094 h -4.234375 v 4.74805 h 4.1074219 l 5.6679686,5.23047 z m 1.767579,1.50782 v 0.59961 c 0.628524,0 1.262682,0.52233 1.751953,1.49023 0.489269,0.96789 0.804686,2.34168 0.804686,3.86133 0,1.51964 -0.315417,2.89148 -0.804686,3.85937 -0.489271,0.9679 -1.123429,1.49219 -1.751953,1.49219 v 0.59961 c 0.949262,0 1.742407,-0.74276 2.287109,-1.82031 0.544702,-1.07756 0.869141,-2.52926 0.869141,-4.13086 0,-1.60161 -0.324439,-3.05525 -0.869141,-4.13281 -0.544702,-1.07755 -1.337847,-1.81836 -2.287109,-1.81836 z m -0.921875,1.97851 v 0.59961 c 0.378754,0 0.787693,0.3227 1.113281,0.9668 0.325586,0.64409 0.539061,1.57016 0.539061,2.5957 1e-6,1.02554 -0.213475,1.95161 -0.539061,2.5957 -0.325588,0.64409 -0.734527,0.9668 -1.113281,0.9668 v 0.59961 c 0.699491,0 1.267416,-0.54311 1.648436,-1.29687 0.381021,-0.75375 0.603517,-1.75774 0.603517,-2.86524 0,-1.1075 -0.222496,-2.11344 -0.603517,-2.86719 -0.38102,-0.75375 -0.948945,-1.29492 -1.648436,-1.29492 z"></path>
            </svg>`,
            display_class: `panel-action-mute`
        }/*,

        template: {
            title: "",
            script: function(event, webview){

            },
            display: ``,
            display_class: ``
        },*/
    };

    /**
     * Change the zoom
     * @param webview to update
     * @param zoom new zoom factor
     */
    function changeZoom(webview, zoom){
        webview.setZoom(zoom, () => {
            updateZoomLabel(webview);
        });
    }

    /**
     * Update the zoom label
     * @param webview to get zoom value from
     */
    function updateZoomLabel(webview){
        const panelZoom = webview.parentElement.parentElement.querySelector(".zoom-reset");
        if(!panelZoom){
            console.error("[lonm-panel-actions] Panel Zoom Label Missing");
            return;
        }
        webview.getZoom(current => {
            const newValue = Math.floor(current * 100);
            panelZoom.innerHTML = newValue + "%";
        });
    }

    /**
     * Inject a script as a content script
     * @param webview to use
     * @param scriptMethod Method to inject
     */
    function doContentScript(webview, scriptMethod){
        const scriptText = "("+scriptMethod+")()";
        webview.executeScript({code: scriptText});
    }

    /**
     * Create a panel action button
     * REMARK: For some reason the button click currentTarget is not always the button
     * @param action object
     * @param webview dom object button will attach to
     * @returns dom object
     */
    function createActionButton(action, webview){
        const newBtn = document.createElement("button");
        newBtn.className = action.display_class+" button-toolbar-small mod-panel-action";
        newBtn.innerHTML = action.display;
        newBtn.addEventListener("click", event => {
            let eventSource = event.target;
            while(eventSource.tagName.toLowerCase()!== "button"){
                eventSource = eventSource.parentElement;
            }
            action.script(eventSource, webview);
        });
        newBtn.title = action.title;
        return newBtn;
    }

    /**
     * Add the panel action controls
     * @param panel dom node
     */
    function addPanelControls(panel){
        const alreadyAdded = panel.querySelector("footer");
        if(alreadyAdded){return;}
        const footer = document.createElement("footer");
        const webview = panel.querySelector("webview");
        for(const key in ACTIONS){
            const action = ACTIONS[key];
            const newButton = createActionButton(action, webview);
            footer.appendChild(newButton);
        }
        panel.appendChild(footer);
    }

    /**
     * upgrade a web panel by adding controls, listeners, etc.
     * @param panel dom node
     */
    function upgradePanel(panel){
        addPanelControls(panel);
        const webview = panel.querySelector("webview");
        webview.addEventListener("zoomchange", () => {
            updateZoomLabel(webview);
        });
        webview.addEventListener("loadcommit", () => {
            updateZoomLabel(webview);
        });
    }

    /**
     * Observe changes to the panels
     * Remark: This will either be to upgrade a panel when it is first created
     *    or to re-add the panel controls if removed after a panel was toggled
     */
    const PANEL_CHANGE_OBSERVER = new MutationObserver(records => {
        records.forEach(record => {
            if(record.type==="attributes"){
                const targetClasses = record.target.classList;
                if(targetClasses.contains("visible") && targetClasses.contains("webpanel")){
                    addPanelControls(record.target);
                }
            } else if (record.type==="childList") {
                record.addedNodes.forEach(node => {
                    if(node.classList && node.classList.contains("webpanel")){
                        upgradePanel(node);
                    }
                });
            }
        });
    });

    /**
     * Begin observing the changes to panels
     * @param webPanelStack The web panel stack div
     */
    function beginObservation(webPanelStack){
        PANEL_CHANGE_OBSERVER.observe(webPanelStack, {
            attributes: true,
            attributeFilter: ["class"],
            childList: true,
            subtree: true
        });
    }

    /**
     * Initialise the mod
     */
    function initMod(){
        const webPanels = document.querySelector("#panels");
        if(webPanels){
            beginObservation(webPanels);
            const alreadyOpenPanel = document.querySelector(".panel.webpanel.visible");
            if(alreadyOpenPanel){
                upgradePanel(alreadyOpenPanel);
            }
        } else { setTimeout(initMod, 500); }
    }

    /* Start 500ms after the browser is opened */
    setTimeout(initMod, 500);
})();
