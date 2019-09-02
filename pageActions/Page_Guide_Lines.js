/*
* GUIDES for Vivaldi (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
*/
"use strict";

const COLOUR = "red";

const GUIDELINES_CSS = `
.browser-guide {
    display: block;
    background: ${COLOUR};
    position: fixed;
    user-select: none;
    z-index: 999999;
}

.browser-guide-vertical {
    height: 100vh;
    width: 3px;
    cursor: ew-resize;
    top: 0px !important;
}

.browser-guide-horizontal {
    width: 100vw;
    height: 3px;
    cursor: ns-resize;
    left: 0px !important;
}

#browser-guide-pdf-compat {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
}

#browser-guide-pdf-compat.dragging {
    pointer-events: all;
    z-index: 0;
}

#browser-guide-container {
    display: flex;
    position: fixed;
    bottom: 0px;
    right: 0px;
    opacity: 0.1;
}

#browser-guide-container:hover {
    opacity: 1;
}

#browser-guide-container button {
    width: 30px;
    height: 20px;
    background: #ccc;
    color:  #000;
    border:  1px solid #000;
}

#browser-guide-container button:hover {
    width: 30px;
    height: 20px;
    background: #fff;
    color:  #000;
    border:  1px solid #000;
}
`;

let GUIDE_COUNT = 0;
// Dragging - a guide will move with the cursor until the mouse button is let go
let CURRENTLY_DRAGGING = [];
// Following - a guide will move with the cursor until the mouse is clicked
let CURRENTLY_FOLLOWING = [];

/// start the mod
function init(){
    inject_css();
    create_buttons();
    pdf_compat();
    document.addEventListener("mousemove", browser_cursor_move);
}

// Add the "create guide" buttons to browser
function create_buttons(){
    const container = document.createElement("div");
    container.id = "browser-guide-container";

    const new_button_h = document.createElement("button");
    new_button_h.innerHTML = "—";
    new_button_h.addEventListener("click", function(e){
        new_guide_clicked(e, "browser-guide-horizontal");
    });

    const new_button_v = document.createElement("button");
    new_button_v.innerHTML = "|";
    new_button_v.addEventListener("click", function(e){
        new_guide_clicked(e, "browser-guide-vertical");
    });

    container.appendChild(new_button_h);
    container.appendChild(new_button_v);
    document.body.appendChild(container);
}

let PDF_COMPAT;
// add pdf compatibility layer
// for some reason the embedded chrome pdf viewer steals the mouse focus
function pdf_compat(){
    const pdf = document.querySelector("embed[type='application/pdf']");
    if(pdf){
        PDF_COMPAT = document.createElement("div");
        PDF_COMPAT.id = "browser-guide-pdf-compat";
        document.body.appendChild(PDF_COMPAT);
    }
}

// Inject css
function inject_css(){
    const style = document.createElement("style");
    style.innerHTML = GUIDELINES_CSS;
    document.body.appendChild(style);
}

// Create a new guide and make it follow the cursor
function new_guide_clicked(e, classname){
    const new_guide = document.createElement("div");
    new_guide.className = "browser-guide "+classname;
    new_guide.addEventListener("mousedown", guide_drag_start);
    new_guide.addEventListener("mouseup", guide_drop);
    new_guide.style.top = e.clientY + "px";
    new_guide.style.left = e.clientX + "px";
    new_guide.id = "guide-" + GUIDE_COUNT;
    GUIDE_COUNT++;
    document.body.appendChild(new_guide);
    CURRENTLY_FOLLOWING.push(new_guide.id);
}

// Clicked a guide
function guide_drag_start(e){
    const cf_index = CURRENTLY_FOLLOWING.indexOf(e.target.id);
    const cm_index = CURRENTLY_DRAGGING.indexOf(e.target.id);
    // If currently following, stop following
    if(cf_index >= 0){
        delete CURRENTLY_FOLLOWING[cf_index];
    }
    // ALT key pressed - delete this guide
    if(e.altKey){
        const selected_guide = document.querySelector("#"+e.target.id);
        selected_guide.parentElement.removeChild(selected_guide);
        // Clean up any drag references to the guide
        if(cm_index >= 0){
            delete CURRENTLY_DRAGGING[cm_index];
        }
        return;
    }
    if(e.shiftKey){
        // SHIFT key pressed - start following
        if(cf_index === -1){
            CURRENTLY_FOLLOWING.push(e.target.id);
        }
    } else {
        // Guide starts dragging
        if(cm_index === -1){
            CURRENTLY_DRAGGING.push(e.target.id);
        }
    }
}

// Moved the mouse - move any guides currently being dragged or any that are following the cursor
function browser_cursor_move(e){
    [CURRENTLY_DRAGGING,CURRENTLY_FOLLOWING].forEach(guide_list => {
        guide_list.forEach(guide => {
            const selected_guide = document.querySelector("#"+guide);
            if(!selected_guide){return;}
            selected_guide.style.left = e.clientX + "px";
            selected_guide.style.top = e.clientY + "px";
        });
    });
    if(PDF_COMPAT){ // need to count excluding empties
        const count = CURRENTLY_DRAGGING.filter(x => x).length + CURRENTLY_FOLLOWING.filter(x => x).length;
        PDF_COMPAT.className = count > 0 ? "dragging" : "";
    }
}

// Mouse let go - Any currently dragged guides should be dropped
function guide_drop(){
    CURRENTLY_DRAGGING = [];
}

init();
