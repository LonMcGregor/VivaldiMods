/**
 * Markdown
 * some stuff from https://github.com/Sporif/CustomHooks/blob/master/hooks/theme-css-variables.js
 */
(function markdown(){
    "use strict";

    const MOD_URI = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/user_modfiles/markdown.html";
    const VIVALDI_URI = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/browser.html";
    let ACTIVE_NOTES_WINDOW;

function createEditorZone(){
    chrome.tabs.getSelected(null, tab => {
        if(tab.url !== MOD_URI){
            console.log("Creating notes tab");
            chrome.tabs.create({"url": MOD_URI}, tab => {
                setTimeout(() => {initMessaging(3);}, 500);
            });
        } else if (ACTIVE_NOTES_WINDOW === undefined || ACTIVE_NOTES_WINDOW === null) {
            console.log("notes tab exists, setting ref");
            initMessaging(3);
        }
    });

}

function sendMessage(msg){
    if(ACTIVE_NOTES_WINDOW){
        ACTIVE_NOTES_WINDOW.contentWindow.postMessage(msg, MOD_URI);
    } else {
        console.warn("tried to message before notes window was ready");
    }
}

function initMessaging(tries){
    if(tries < 1){
        console.log("Failed to init messaging");
        return;
    }
    if(!document.querySelector(`webview[src="${MOD_URI}"]`)){
        setTimeout(() => {initMessaging(tries-1);}, 500);
        return;
    }
    ACTIVE_NOTES_WINDOW = document.querySelector(`webview[src="${MOD_URI}"]`);
    addEventListener('message', onMessage);
    sendMessage("0");
}

function onMessage(e){
    if (ACTIVE_NOTES_WINDOW === undefined) return;
    if (e.source != ACTIVE_NOTES_WINDOW.contentWindow) return;
    if(e.data==="1"){
        sendThemeData();
        noteSelection();
    }
    console.log(e);
}

function noteSelection(){
    const selection = document.querySelector("#notes-panel div[data-selected]");
    if(!selection){return;}
    vivaldi.notes.get(selection.getAttribute("data-id"), note => {
        sendMessage({"text":note[0]});
    });
    const preview = document.querySelector("#notes-panel  div.md.note");
    if(preview){
        sendMessage({"preview":preview.innerHTML});
    } else {
        sendMessage({"preview":"<h1>Enable markdown generator in panel</h1>"});
    }

}

function noteSave(){

}

function noteEdit(){

}

const PANEL_CHANGE_OBSERVER = new MutationObserver(mutationrecords => {
    const panel = document.querySelector("#notes-panel");
    if(panel){
        noteSelection();
    }
});


/* Wait until the panel is ready before activating the mod */
function begin_observe(){
    const panels = document.querySelector("#panels");
    if(panels){
        PANEL_CHANGE_OBSERVER.observe(panels, {attributes: true, subtree: true});
    } else { setTimeout(begin_observe, 500); }
}


/**
 * Check that the browser is loaded up properly, and init the mod
 */
function initMod(){
    if(!document.querySelector("#browser")){
        setTimeout(initMod, 500);
        return;
    }
    begin_observe();
    theme_observe();
    const newBtn = document.createElement("button");
    newBtn.innerHTML = "<span>notething</span>";
    newBtn.addEventListener("click", createEditorZone);
    document.querySelector("#footer > div.status-toolbar").appendChild(newBtn);
}

function theme_observe(){
    THEME_OBSERVER.observe(document.body, {
		attributes: true,
		attributeFilter: ['style']
	});
}
const THEME_OBSERVER = new MutationObserver(sendThemeData);

function sendThemeData() {
    if(!ACTIVE_NOTES_WINDOW){return;}
    var css = ":root {\n "+document.body.style.cssText.replace(/;/g, ';\n').replace(/:/g, ': ')+" }";
    var addCss = `if(!colors){
        var colors = document.createElement('style');
        colors.setAttribute("description", "Current theme's css variables, added by theme-css-variables.js");
    }
    colors.textContent = \`${css}\`;
    document.head.appendChild(colors);`;
    ACTIVE_NOTES_WINDOW.executeScript({code: addCss, allFrames: true});
}


function initEditorPageScript(){
    var messageSource, messageOrigin;
        addEventListener('message', function(e) {
            if (!messageSource) {

                /*
                 * Once we have a messageSource, we should not allow anybody to change
                 * messageSource again
                 */

                if (e.data == "0") {

                    /*
                     * If possible, you should validate the `e.origin` value here. It could
                     * possibly come from somewhere else. However, this is quite safe as it
                     * stands, since there only is a very narrow time window where the app
                     * is open willing to accept the "hello, webpage!" message.
                     *
                     * Another way of validating, is by having the app wait for the
                     * "hello, host!" message. If that response is not received within a second
                     * the app host could simply reload the app.
                     */

                    messageSource = e.source;
                    messageOrigin = e.origin;
                    messageSource.postMessage("1", messageOrigin);
                }
            } else {
                // Handle messages however you like. This will simply respond to every message:
                if(e.data.text){
                    document.querySelector("textarea").value = e.data.text.content;
                    document.querySelector("h1").innerText = e.data.text.title;
                    return;
                } else if (e.data.preview){
                    document.querySelector("#preview").innerHTML = e.data.preview;
                    return;
                }
                messageSource.postMessage('unknown message format', messageOrigin);
            }
        });
}

if(window.location.href===VIVALDI_URI){
    initMod();
} else if (window.location.href===MOD_URI){
    initEditorPageScript();
}
})();
