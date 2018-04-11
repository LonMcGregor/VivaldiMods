/*
* Panel Actions (A Mod for Vivaldi)
* LonM.vivaldi.net
* No Copyright Reserved
*/

(function panel_actions(){
    "use strict";

    /*
    Dictionary of additional actions.
    They will be added to the toolbar in the order specified below.
    Enabled: Whether the action is enabled
    Content Script: Wheter this action should execute on the web page o rin the browser
    Script: A function(){}
    Display: The innerHTML of the toolbar button
    Display Class: One or more classes to give the button
    */
    const ACTIONS = {

        zoom_out: { /* Decrease zoom*/
            enabled: true,
            content_script: false,
            script: function(){
                const webview = document.querySelector(".panel.webpanel.visible webview");
                webview.getZoom(current => {
                    webview.setZoom(current -= 0.1, update_zoom_label);
                });
            },
            display: `-`,
            display_class: `zoom-out`
        },

        zoom_reset: { /* Set zoom to 100% */
            enabled: true,
            content_script: false,
            script: function(){
                const webview = document.querySelector(".panel.webpanel.visible webview");
                webview.setZoom(1, update_zoom_label);
            },
            display: `100%`,
            display_class: `zoom-reset`
        },

        zoom_in: { /* Increase zoom*/
            enabled: true,
            content_script: false,
            script: function(){
                const webview = document.querySelector(".panel.webpanel.visible webview");
                webview.getZoom(current => {
                    webview.setZoom(current += 0.1, update_zoom_label);
                });
            },
            display: `+`,
            display_class: `zoom-in`
        },

        invert: {/* Invert the colours on the page */
            enabled: true,
            content_script: true,
            script: function(){
                const style_element = document.createElement('style');
                style_element.innerHTML = `
                    html { background-color: white;}
                    body.inverted {filter: invert(1) hue-rotate(180deg);}
                    body.inverted img,
                    body.inverted video {filter: invert(1) hue-rotate(180deg);}`;
                document.body.appendChild(style_element);
                document.body.classList.toggle("inverted");
            }, /* eye icon stolen from vivaldi */
            display: `<svg viewBox="0 -2 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 13c3.636 0 6.764-2.067 8-5-1.236-2.933-4.364-5-8-5s-6.764 2.067-8 5c1.236 3.035 4.364 5 8 5zm0-1c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm0-2c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z"></path>
            </svg>`,
            display_class: "panel-action-invert"
        },

        template: { /* */
            enabled: false,
            content_script: false,
            script: function(){

            },
            display: ``,
            display_class: ``
        },
    };

    /* Observe chages to the active panel */
    const PANEL_CHANGE_OBSERVER = new MutationObserver(mutationrecords => {
        const panelHeader = document.querySelector(".panel.webpanel.visible header");
        if(panelHeader){
            add_panel_controls(panelHeader);
        }
    });

    /* Wait until the panel is ready before activating the mod */
    function begin_observe(){
        const panels = document.querySelector("#panels");
        if(panels){
            PANEL_CHANGE_OBSERVER.observe(panels, {attributes: true, subtree: true});
        } else { setTimeout(begin_observe, 500); }
    }

    /* Update the label with the correct zoom percentage */
    function update_zoom_label(){
        const webview = document.querySelector(".panel.webpanel.visible webview");
        const panelZoom = document.querySelector(".panel.webpanel.visible .zoom-reset");
        if(!panelZoom){
            return;
        }
        webview.getZoom(current => {
            panelZoom.innerHTML = Math.floor(current * 100) + "%";
        });
    }

    /* Injects a content script onto the page */
    function content_script(scriptMethod){
        const webview = document.querySelector("div.panel.webpanel.visible webview");
        const scriptText = "("+scriptMethod+")()";
        webview.executeScript({code: scriptText});
    }

    /* Create a panel header toolbar button */
    function panel_header_button(className, event, display){
        const newBtn = document.createElement("button");
        newBtn.className = className+" button-toolbar mod-panel-action";
        newBtn.innerHTML = display;
        newBtn.addEventListener("click", event);
        return newBtn;
    }

    /* Create the control buttons for the actions and add them to the specified header */
    function add_panel_controls(panelHeader){
        const panelButtons = panelHeader.querySelector(".toolbar");
        const alreadyAdded = panelButtons.querySelector(".mod-panel-action");
        if(alreadyAdded){return;}
        for(const key in ACTIONS){
            const action = ACTIONS[key];
            if(action.enabled){
                const newButton = action.content_script ?
                    panel_header_button(action.display_class, event => {content_script(action.script);}, action.display) :
                    panel_header_button(action.display_class, action.script, action.display);
                panelButtons.appendChild(newButton);
            }
        }
    }

    /* Start 500ms after the browser is opened */
    setTimeout(begin_observe, 500);
})();
