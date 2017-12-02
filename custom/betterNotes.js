"use strict";

// Observers
const panelChangeObserver = new MutationObserver(panelChanged);
const noteChangeObserver = new MutationObserver(newNoteSelected);
const noteTextChangeObserver = new MutationObserver(noteTextChanged);

// Globals
const monospaceFontDeclaration = "DejaVu Sans Mono, Courier New, monospace";
let fontState = "regular";
let wrapState = "normal";


/*************************************
* OBSERVER INITIALISERS
**************************************/
// BROWSER LOADED - entry point
// Register the observer once the browser is fully loaded
setTimeout(function observePanelChanges(){
    const panels = document.querySelector("#panels > div.panel-group > div");
    if (panels != null) {
        const config = { childList: true };
        panelChangeObserver.observe(panels, config);
        panelChanged();
    } else {
        setTimeout(observePanelChanges, 500);
    }
}, 500)

// Look for if a user selectes a new note or folder
function observeNoteChanges(){
    const notecard = document.querySelector("#notes-panel > div > div");
    const config = {childList:true};
    noteChangeObserver.observe(notecard, config);
    newNoteSelected();
}

// Look for if a user edits a note
function observeNoteTextChanges(){
    const notetext = document.querySelector("#notes-panel > div > div > textarea");
    const config = {childList:true};
    if(notetext != null){
        noteTextChangeObserver.observe(notetext, config);
        noteTextChanged();
    }
}


/**************************************
* OBSERVER REACTIONS
***************************************/
function panelChanged(m, o){
    // Clean up observers
    noteChangeObserver.disconnect();
    noteTextChangeObserver.disconnect();
    //Identify Panel
    const notes = document.querySelector("#notes-panel");
    if(notes){
        try {
            // Add DOM Elements
            addWordCountSpan();
            fontToggleAddButton();
            wrapToggleAddButton();
            // Observe note changes
            observeNoteChanges();
        } catch (e) { //panel toggled before function completed
            return;
        }
    }
}

function newNoteSelected(m, o){
    noteTextChangeObserver.disconnect();
    updateNoteFont();
    updateWrapState();
    observeNoteTextChanges();
}

function noteTextChanged(m, o){
    updateWordCount();
}


/**************************************
* GENERAL DOM GENERATOR
***************************************/
function makeButton(id, className, innerHtml, title, clickEvent){    
    const newButton = document.createElement("button");
    newButton.id = id;
    newButton.className = className;
    newButton.style.width = "28px";
    newButton.style.height = "28px";
    newButton.style.border = "1px solid var(--colorBg)";
    newButton.style.padding = "5px";
    newButton.style.borderRadius = "var(--radius)";
    newButton.style.backgroundColor = "var(--colorBg)";
    newButton.innerHTML = innerHtml;
    newButton.title = title;
    newButton.addEventListener("click", clickEvent);
    return newButton;
}

function attachButton(newButton){
    const controlwrapper = document.querySelector("#notes-panel > div > div > div.add-attachments-wrapper");
    controlwrapper.appendChild(newButton);
}


/**************************************
* FONT TOGGLER METHODS
***************************************/
// Create the font toggle dom element
function fontToggleAddButton(){
    let newButton = makeButton(
        "notes-font-toggle",
        "",
        "A",
        "Switch between monospace and regular font",
        fontToggleClicked
    );
    newButton.style.fontFamily = monospaceFontDeclaration;
    newButton.style.fontSize = "16px";
    attachButton(newButton);
}

// User clicked the font toggle button
function fontToggleClicked(){
    fontState = fontState==="regular" ? "mono" : "regular";
    updateNoteFont();
}

// Make the font match what the button state is
function updateNoteFont(){
    const noteTextArea = document.querySelector("#notes-panel > div > div > textarea");
    if(!noteTextArea){ // A folder was selected
        return;
    }
    noteTextArea.style.fontFamily = fontState==="regular" ? "" : monospaceFontDeclaration;
}


/**************************************
* WORD WRAP TOGGLER
***************************************/

// Create the font toggle dom element
function wrapToggleAddButton(){
    let newButton = makeButton(
        "notes-wrap-toggle",
        "",
        "↵",
        "Toggle the line wrapping on the note",
        wrapToggleClicked
    );
    newButton.style.fontSize = "16px";
    attachButton(newButton);
}

// User clicked the wrap toggle button
function wrapToggleClicked(){
    wrapState = wrapState==="normal" ? "pre" : "normal";
    updateWrapState()
}

// Make the wrap match what the button state is
function updateWrapState(){
    const noteTextArea = document.querySelector("#notes-panel > div > div > textarea");
    if(!noteTextArea){ // A folder was selected
        return;
    }
    noteTextArea.style.whiteSpace = wrapState;
}


/**************************************
* WORD COUNT METHODS
***************************************/
// Create the word count dom element
function addWordCountSpan(){
    const metawrapper = document.querySelector("#notes-panel > div > div > div.meta-data-wrapper");
    const wordcountwrapper = document.createElement("div");
    wordcountwrapper.className = "dateCreated";
    wordcountwrapper.id = "note-word-count-container";
    //icon from https://commons.wikimedia.org/wiki/File:Revision_of_policy.svg 
    wordcountwrapper.innerHTML = '\
        <div class="meta-icon word-count fieldset" title="Word Count">\
            <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 40 37">\
                <path fill="none" stroke="var(--colorFg)" stroke-width="3" d="m10,18 9-9 14,14-19-19-9,9 19,19 11,2-2-11-1-1m1,4-6,6 3,1 4-4"/>\
            </svg>\
        </div>\
        <span id="note-word-count" title="Word Count">Select a note to see word count</span>';
    metawrapper.appendChild(wordcountwrapper);
}

// Trigger a word count update
function updateWordCount(){
    const wordcountspan = document.querySelector("#note-word-count");
    if(wordcountspan === null){
        return;
    }
    const notetextarea = document.querySelector("#notes-panel > div > div > textarea");
    if(notetextarea===null || notetextarea.value===null || notetextarea.value.length===0){
        wordcountspan.textContent = "Chars: 0 Words: 0 Lines: 0";
        return;
    }
    const notetext = notetextarea.value;
    const characters = notetext.length;
    const wordsMatches = notetext.match(/\S+/g);
    const words = wordsMatches ? wordsMatches.length : 0;
    const lineMatches = notetext.match(/\n/g);
    const lines = lineMatches ? lineMatches.length+1 : (characters==0 ? 0 : 1);
    const message = "Chars: "+characters+" Words: "+words+" Lines: "+lines;
    wordcountspan.textContent = message;
}