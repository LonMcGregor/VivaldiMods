/*
* BETTER NOTES (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
* VIVALDI MOD COMPONENT
*
* additional components used:
* https://github.com/Sporif/CustomHooks/blob/master/hooks/theme-css-variables.js
*/
(function betterNotes(){
"use strict";

const EDITOR_TOOLTIP = {
    en_GB: "Open Notes Editor",
    fr_FR: "Ouvrir l'éditeur de notes"
}.en_GB;

const EDITOR_URI = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/mods/betterNotesEditor.html";
const VIVALDI_URI = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/browser.html";
const VIVALDI_ORIGIN = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli";
let EDITOR_SOURCE;
let INIT_HANDSHAKE_COMPLETE = false;

/**
 * Handle incoming messages from the editor tab
 * @param e message event
 */
function onMessage(e){
    if(e.origin !== VIVALDI_ORIGIN){
        return;
    }
    switch(e.data.verb){
        case "INIT_YES":
            return onInit();
        case "NOTE_TEXT":
            return onNoteText(e.data.note, e.data.noteId);
        case "NOTE_TITLE":
            return onTitle(e.data.title, e.data.noteId);
        case "CLOSE":
            return onClose();
        default:
            console.error('unknown message format', e);
    }
}

/**
 * The editor tab has loaded and has connected succesfully
 */
function onInit(){
    INIT_HANDSHAKE_COMPLETE = true;
    sendThemeData();
    sendNote();
}

/**
 * The Editor has sent a new version of a note
 * @param text Updated note contents
 * @param id of note updated
 */
function onNoteText(text, id){
    vivaldi.notes.update(id, {
        content: text
    });
    if(document.querySelector("#notes-panel textarea.note.editor")){
        document.querySelector("#notes-panel textarea.note.editor").value = text;
    }
}

/**
 * The editor has sent a new title for a note
 * @param title new title of note
 * @param id of note updated
 */
function onTitle(title, id){
    vivaldi.notes.update(id, {
        title: title
    });
}

/**
 * The editor has closed. Perform necessary cleanup.
 */
function onClose(){
    EDITOR_SOURCE = undefined;
    INIT_HANDSHAKE_COMPLETE = false;
    styleForPanels();
}



/**
 * Send a message to the Editor
 * @param msg The object to send as a message. must contain a valid verb
 */
function sendMessage(msg){
    if(EDITOR_SOURCE){
        try{
            EDITOR_SOURCE.contentWindow.postMessage(msg, EDITOR_URI);
        } catch (exception) {
            if(exception.message.indexOf("postMessage")>-1){
                console.warn("Better Notes Mod: Failed to contact editor tab. Please re-open");
                onClose();
            } else {
                throw exception;
            }
        }
    }
}

/**
 * Try and make a connection between the vivaldi UI and the editor
 * @param attempts Number of connection attempts left
 */
function sendInit(attempts){
    if(INIT_HANDSHAKE_COMPLETE){return;}
    if(attempts < 1){
        console.error("Failed to init messaging to editor tab");
        return;
    }
    if(!document.querySelector(`webview[src="${EDITOR_URI}"]`)){
        console.warn("Editor tab wasn't open when connection was started");
        return;
    }
    EDITOR_SOURCE = document.querySelector(`webview[src="${EDITOR_URI}"]`);
    sendMessage({
        verb: "INIT_QRY"
    });
    setTimeout(() => {sendInit(attempts-1);}, 500);
}

/**
 * Send the currently selected note to the Editor
 */
function sendNote(){
    const selection = document.querySelector("#notes-panel div[data-selected]");
    if(!selection){
        sendEmpty();
        return;
    }
    vivaldi.notes.get(selection.getAttribute("data-id"), note => {
        const noteObject = note[0];
        sendMessage({
            verb: "NOTE",
            note: noteObject
        });
    });
    notesSearchChanged();
}

/**
 * Inform the editor that no note is selected
 */
function sendEmpty(){
    sendMessage({
        verb: "EMPTY"
    });
}

/**
 * Update the editor with the latest theme variables
 */
function sendThemeData() {
    if(!EDITOR_SOURCE){return;}
    let css = ":root {\n "+document.body.style.cssText.replace(/;/g, ';\n').replace(/:/g, ': ')+" }";
    css = css.replace(/background-.+;/g, "");
    sendMessage({
        verb: "THEME",
        theme: css
    });
}



/**
 * Start a connection to the editor
 */
function connectToNotesTab(){
    if(document.querySelector("#notes-panel textarea.note.editor")){
        document.querySelector("#notes-panel button.notes-toggle-md").click();
    }
    setTimeout(() => {sendInit(3);}, 500);
}

/**
 * Activate the editor if it exists, or open it in a new tab
 */
function getOrCreateNotesTab(){
    chrome.tabs.query({url: EDITOR_URI}, tabs => {
        if(tabs.length > 0){
            chrome.tabs.update(tabs[0].id, {active: true});
        } else {
            chrome.tabs.create({"url": EDITOR_URI}, tab => {
                connectToNotesTab();
            });
        }
    });
}

/**
 * Make sure that if not already open, the editor is active
 */
function openNotesTab(){
    chrome.tabs.getSelected(null, tab => {
        if(tab.url !== EDITOR_URI){
            getOrCreateNotesTab();
        } else {
            connectToNotesTab();
        }
        styleForFullEditor();
    });
}


/**
 * Make the attachment button a drop target
 */
function attachmentAsDropTarget(){
    const ᣞᴥᣞ = document.querySelector("#notes-panel label[for=notesFileAttachment]");
    ᣞᴥᣞ.addEventListener("drop", dropOnToAttachment);
    ᣞᴥᣞ.addEventListener("dragover", dragOverAttachment);
}

/**
 * Something dragged over attachments
 */
function dragOverAttachment(dragEvent){
    dragEvent.preventDefault();
    dragEvent.dataTransfer.dropEffect = "copy";
}

/**
 * Something dropped onto attachments
 */
function dropOnToAttachment(dropEvent){
    dropEvent.preventDefault();
    const selection = document.querySelector("#notes-panel div[data-selected]");
    if(!selection){
        console.error("BN: failed to get selected note. Is the notes panel open?");
        return;
    }
    const selectedNote = selection.getAttribute("data-id");
    if (dropEvent.dataTransfer.items) {
        for (var i = 0; i < dropEvent.dataTransfer.items.length; i++) {
            switch (dropEvent.dataTransfer.items[i].kind) {
                case "file":
                    const file = dropEvent.dataTransfer.items[i].getAsFile();
                    addBlobAttachment(selectedNote, file);
                    break;
                case "string":
                    dropEvent.dataTransfer.items[i].getAsString(item => {
                        if(item.indexOf("<img")===0){
                            const div = document.createElement("div");
                            div.innerHTML = item;
                            const src = div.firstChild.src;
                            if(src.indexOf("data:")===0){
                                addDataAttachment(selectedNote, src);
                            } else {
                                fetch(src).then(response => {
                                    if(!response.ok){
                                        console.error("BN: Failed to add image attachment, web response "+response.status);
                                        return;
                                    }
                                    response.blob().then(blob => {
                                        addBlobAttachment(selectedNote, blob);
                                    });
                                });
                            }
                        }
                    });
                    break;
                default:
                    break;
            }
        }
    }
}

/**
 * Add a new attachment from a blob
 * @param {String} noteId
 * @param {Blob} blob Image blob, from File or Response
 */
function addBlobAttachment(noteId, blob){
    const fr = new FileReader();
    fr.onload = event => {
        if(event.target.result.indexOf("data:image")===-1){
            return;
        }
        addDataAttachment(noteId, event.target.result);
    };
    fr.readAsDataURL(blob);
}

/**
 * Add a data url as an attachment
 * @param {String} noteId
 * @param {String} newAttachmentUri base64 encoded data URI
 * @remark I don't know what checksum encoding is used. I think it's then
 *   base64 encoded and the length is attached. For now, it seems to work
 *   ok if I just leave it blank.
 */
function addDataAttachment(noteId, newAttachmentUri){
    vivaldi.notes.get(noteId, notes => {
        const note = notes[0];
        const attachments = note.attachments;
        const newAttachment = {
            checksum: "|"+newAttachmentUri.length,
            content: newAttachmentUri
        };
        attachments.push(newAttachment);
        vivaldi.notes.update(noteId, {attachments: attachments}, () => {});
    });
}


/**
 * Observe for changes to the panels
 * If it is the notes panel, add a button and send info if connection exists
 */
const PANEL_CHANGE_OBSERVER = new MutationObserver(mutationrecords => {
    const panel = document.querySelector("#notes-panel");
    if(panel){
        makeEditorButton();
        document.querySelector("#notes-panel input[type=search]").addEventListener("input", notesSearchChanged);
        if(EDITOR_SOURCE){
            sendNote();
            styleForFullEditor();
        }
        attachmentAsDropTarget();
    }
});

/**
 * Begin observing the panels. If notes are already open, make a button
 */
function observePanels(){
    const panels = document.querySelector("#panels");
    PANEL_CHANGE_OBSERVER.observe(panels, {attributes: true, subtree: true});
    makeEditorButton();
}

/**
 * Create and Add the editor button to the notes panel
 */
function makeEditorButton(){
    if(document.querySelector("#betterNotesOpenEditor") || !document.querySelector("#notes-panel")){
        return;
    }
    const newBtn = document.createElement("button");
    newBtn.title = EDITOR_TOOLTIP;
    newBtn.innerHTML = `<svg viewBox="-5 -5 26 26" xmlns="http://www.w3.org/2000/svg">
    <g fill-rule="evenodd">
      <path d="M0 4h16v10H0V4zm2 2h12v6H2V6zM0 1h7v3H0z"></path>
      <path opacity=".5" d="M8 1h8v2H8z"></path>
    </g>
  </svg>`;
    newBtn.id = "betterNotesOpenEditor";
    newBtn.addEventListener("click", openNotesTab);
    document.querySelector("#notes-panel > header > div > span").appendChild(newBtn);
}

/**
 * Event for when the notes search box changes (input event)
 */
function notesSearchChanged(){
    const query = document.querySelector("#notes-panel input[type=search]").value;
    if(query || query===""){
        const webview = document.querySelector(`webview[src="${EDITOR_URI}"]`);
        if(webview){
            webview.find(query);
        }
    }
}

/**
 * Stop applying the style to the panel
 */
function styleForPanels(){
    document.querySelector("#panels-container").classList.remove("betterNotesEditorOpen");
}

/**
 * Start applying the special style to hide existing notes UI to the notes panel
 */
function styleForFullEditor(){
    document.querySelector("#panels-container").classList.add("betterNotesEditorOpen");
}



/**
 * Begin observe for changes to the browser theme style
 */
function observeThemes(){
    THEME_OBSERVER.observe(document.body, {
		attributes: true,
		attributeFilter: ['style']
	});
}

/**
 * If the browser theme style changes, inform the editor
 */
const THEME_OBSERVER = new MutationObserver(sendThemeData);



/**
 * Check that the browser is loaded up properly, and then initialise the mod
 */
function initMod(){
    if(!document.querySelector("#browser")){
        setTimeout(initMod, 500);
        return;
    }
    observePanels();
    observeThemes();
    addEventListener('message', onMessage);
}

initMod();

})();
