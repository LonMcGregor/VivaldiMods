"use strict";

// Observe for panel switches
const panelChangeObserver = new MutationObserver(testActivePanel);

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
    const notes = document.querySelector("#notes-panel");
    const wordcountspan = document.querySelector("#note-word-count");
    if(notes != null && wordcountspan === null){
        try {
            addWordCountSpan();
        } catch (e) { //panel toggled before function completed
            return;
        }
    }
}

// Create the word count dom element
function addWordCountSpan(){
    const metawrapper = document.querySelector("#notes-panel > div > div > div.meta-data-wrapper > div.dateCreated");
    const wordcountspan = document.createElement("span");
    wordcountspan.textContent = "(check word count)";
    wordcountspan.id = "note-word-count";
    wordcountspan.style.paddingLeft = "2em";
    wordcountspan.addEventListener("click", updateWordCount);
    metawrapper.appendChild(wordcountspan);
}

// Trigger a word count update, if a note is selected
function updateWordCount(){
    const wordcountspan = document.querySelector("#note-word-count");
    const notetextarea = document.querySelector("#notes-panel > div > div > textarea");
    if(wordcountspan === null || notetextarea===null){
        wordcountspan.textContent = "(check word count)";
        return;
    }
    const notetext = notetextarea.value;
    const characters = notetext.length;
    const words = notetext.match(/ /g).length + 1;
    const lines = notetext.match(/\n/g).length + 1;
    const message = "C: "+characters+" W: "+words+" L: "+lines;
    wordcountspan.textContent = message;
}