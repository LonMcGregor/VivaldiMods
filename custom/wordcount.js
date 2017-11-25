"use strict";

// Observers
const panelChangeObserver = new MutationObserver(testActivePanel);
const noteChangeObserver = new MutationObserver(testNewNote);
const noteTextChangeObserver = new MutationObserver(updateWordCount);

// Register the observer once the browser is fully loaded
setTimeout(function engageObserver(){
    const panels = document.querySelector("#panels > div.panel-group > div");
    if (panels != null) {
        const config = { childList: true };
        panelChangeObserver.observe(panels, config);
        testActivePanel();
    } else {
        setTimeout(engageObserver, 500);
    }
}, 500)

//See if currently active panel is the notes one, and if so, add the word count
function testActivePanel(m, o){
    noteChangeObserver.disconnect();
    noteTextChangeObserver.disconnect();
    const notes = document.querySelector("#notes-panel");
    const wordcountspan = document.querySelector("#note-word-count");
    if(notes != null && wordcountspan === null){
        try {
            addWordCountSpan();
            observeNoteChanges();
            observeNoteTextChanges();
        } catch (e) { //panel toggled before function completed
            return;
        }
    }
}

// A different note has been selected
function testNewNote(m, o){
    noteTextChangeObserver.disconnect();
    observeNoteTextChanges();
}


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
                <path fill="none" stroke="#321" stroke-width="3" d="m10,18 9-9 14,14-19-19-9,9 19,19 11,2-2-11-1-1m1,4-6,6 3,1 4-4"/>\
            </svg>\
        </div>\
        <span id="note-word-count" title="Word Count">Select a note to see word count</span>';
    metawrapper.appendChild(wordcountwrapper);
}

// Observe for note changes
function observeNoteChanges(){
    const notecard = document.querySelector("#notes-panel > div > div");
    const config = {childList:true};
    noteChangeObserver.observe(notecard, config);
}

//Observe for note text changes
function observeNoteTextChanges(){
    const notetext = document.querySelector("#notes-panel > div > div > textarea");
    const config = {childList:true};
    if(notetext != null){
        noteTextChangeObserver.observe(notetext, config);
        updateWordCount();
    }
}

// Trigger a word count update, if a note is selected
function updateWordCount(m, o){
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
    const lines = lineMatches ? lineMatches.length : 0;
    const message = "Chars: "+characters+" Words: "+words+" Lines: "+lines;
    wordcountspan.textContent = message;
}