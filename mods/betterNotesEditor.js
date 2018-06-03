/*
* BETTER NOTES (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
* EDITOR COMPONENT
*/

"use strict";

const VIVALDI_ORIGIN = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli";
let VIVALDI_SOURCE;
let THEME_COLOURS;

function sendMessage(msg){
    if(VIVALDI_SOURCE){
        VIVALDI_SOURCE.postMessage(msg, VIVALDI_ORIGIN);
    } else {
        console.error("Tried to message but origin was lost");
    }
}

function onMessage(e){
    if(e.origin !== VIVALDI_ORIGIN){
        console.error("Bad message incoming. There may be a threat actor afoot");
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
            console.error('unknown message format', e);
    }
}

function onInitQuery(source){
    VIVALDI_SOURCE = source;
    VIVALDI_SOURCE.postMessage("1", VIVALDI_ORIGIN);
}

function onNote(note, preview){
    document.querySelector("textarea").value = note.content;
    document.querySelector("h1").innerText = note.title;
    document.querySelector("#preview").innerHTML = preview;
}

function onEmpty(){
    document.querySelector("textarea").value = "";
    document.querySelector("h1").innerText = "Vivaldi Notes";
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

function sendNoteText(){

}

function sendNoteTitle(){

}

addEventListener('message', onMessage);
