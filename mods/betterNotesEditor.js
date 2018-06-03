/*
* BETTER NOTES (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
* EDITOR COMPONENT
*/
(function betterNotesEditor(){
"use strict";

const EDITOR_URI = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/user_modfiles/betterNotesEditor.html";
const VIVALDI_ORIGIN = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli";
let VIVALDI_SOURCE;
let THEME_COLOURS;

function sendMessage(msg){
    if(VIVALDI_SOURCE){
        VIVALDI_SOURCE.postMessage(msg, VIVALDI_ORIGIN);
    } else {
        error("Tried to message but origin was lost");
    }
}

function onMessage(e){
    if(e.origin !== VIVALDI_ORIGIN){
        error("Bad message incoming. There may be a threat actor afoot");
        return;
    }
    switch(e.data.verb){
        case "INIT_QRY":
            return onInitQuery(e.source);
        case "NOTE":
            return onNote(e.data.note, e.data.preview);
        case "EMPTY":
            return onEmpty();
        case "THEME":
            return onTheme(e.data.theme);
        default:
            error('unknown message format', e);
    }
}

function onInitQuery(source){
    VIVALDI_SOURCE = source;
    sendMessage({
        verb: "INIT_YES"
    });
    document.querySelector("#preview").innerHTML = "<h1>Select a note to continue</h1>";
}

function onNote(note, preview){
    document.querySelector("textarea").value = note.content;
    document.querySelector("#title").value = note.title;
    document.querySelector("#noteId").value = note.id;
    document.querySelector("#preview").innerHTML = preview;
}

function onEmpty(){
    document.querySelector("textarea").value = "";
    document.querySelector("#title").value = "Vivaldi Notes";
    document.querySelector("#noteId").value = "";
    document.querySelector("#preview").innerHTML = "<h1>Select a note to start</h1>";
}

function onTheme(theme){
    if(!THEME_COLOURS){
        THEME_COLOURS = document.createElement('style');
        THEME_COLOURS.setAttribute("description", "Current theme's css variables, added by theme-css-variables.js");
        document.head.appendChild(THEME_COLOURS);
    }
    THEME_COLOURS.textContent = theme;
}

function sendInitResponse(){
    sendMessage({
        verb: "INIT_YES"
    });
}

function sendNoteText(event){
    const noteText = document.querySelector("textarea").value;
    const id = document.querySelector("#noteId").value;
    if(id===""){
        return;
    }
    sendMessage({
        verb: "NOTE_TEXT",
        note: noteText,
        noteId: id
    });
}

function sendNoteTitle(){
    const noteTitle = document.querySelector("#title").value;
    const id = document.querySelector("#noteId").value;
    if(id===""){
        return;
    }
    sendMessage({
        verb: "NOTE_TITLE",
        title: noteTitle,
        noteId: id
    });
}

function init(){
    addEventListener('message', onMessage);
    document.querySelector("textarea").addEventListener("input", sendNoteText);
    document.querySelector("#title").addEventListener("input", sendNoteTitle);
}

if(window.location.href===EDITOR_URI){
    init();
}


function error(message){
    console.error(message);
    new Notification("Better Notes Error", {
        body: message,
    });
}

function info(message){
    console.log(message);
    new Notification("Better Notes Message", {
        body: message,
    });
}

})();
