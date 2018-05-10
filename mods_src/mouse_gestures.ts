/*
* Mouse Gestures Cheat Sheet (a mod for Vivaldi)
* author(s): lonm.vivaldi.net
* No Copyright Reserved
*/

(function MouseGesturesCheatSheet(){
"use strict";

/**
 * Selector for where the GUI button should be added
 */
const ADD_BUTTON_AS_CHILD = "#footer > div.status-toolbar";

/**
 * A Tree representing gestures consisting of LURD movements
 */
class GestureTree {
    public up: GestureTree;
    public right: GestureTree;
    public down: GestureTree;
    public left: GestureTree;
    public action: string;

    /**
     * Perform a depth first search and add the pairs of
     *   action name and gesture command to a list
     * @param list - don't specify this, use the default
     * @param previousGesture - don't specify this, use the default
     */
    public dfsAsList(list=[], previousGesture=""): string[][]{
        if(this.action){
            list.push([this.action, previousGesture]);
        }
        if(this.up){
            const fullGesture = previousGesture + "↑";
            this.up.dfsAsList(list, fullGesture);
        }
        if(this.right){
            const fullGesture = previousGesture + "→";
            this.right.dfsAsList(list, fullGesture);
        }
        if(this.down){
            const fullGesture = previousGesture + "↓";
            this.down.dfsAsList(list, fullGesture);
        }
        if(this.left){
            const fullGesture = previousGesture + "←";
            this.left.dfsAsList(list, fullGesture);
        }
        return list;
    }

    /**
     * Make an ascii tree-like representation of the commands and their actions
     *   separated by newlines '\n' to print to a console
     * @param depth - don't specify this, use the default
     * @param previousGesture - don't specify this, use the default
     * @param completeString - don't specify this, use the default
     */
    public printall(depth=1, previousGesture="", completeString={val:""}): string{
        let indent = Array(depth).join("│")+"├";
        if(this.up){
            const fullGesture = previousGesture + "↑";
            const actionName = this.up.action ? this.up.action+" ("+fullGesture+")" : ".";
            completeString.val += indent+"U: "+actionName+"\n";
            this.up.printall(depth+1, fullGesture, completeString);
        }
        if(this.right){
            const fullGesture = previousGesture + "→";
            const actionName = this.right.action ? this.right.action+" ("+fullGesture+")" : ".";
            completeString.val += indent+"R: "+actionName+"\n";
            this.right.printall(depth+1, fullGesture, completeString);
        }
        if(this.down){
            const fullGesture = previousGesture + "↓";
            const actionName = this.down.action ? this.down.action+" ("+fullGesture+")" : ".";
            completeString.val += indent+"D: "+actionName+"\n";
            this.down.printall(depth+1, fullGesture, completeString);
        }
        if(this.left){
            const fullGesture = previousGesture + "←";
            const actionName = this.left.action ? this.left.action+" ("+fullGesture+")" : ".";
            completeString.val += indent+"L: "+actionName+"\n";
            this.left.printall(depth+1, fullGesture, completeString);
        }
        return completeString.val;
    }

    /**
     * Add a new gesture to the tree
     * @param action The name of the gesture
     * @param gesture A gesture string consisting of integer movements
     * 6=UP, 0=RIGHT, 2=DOWN, 4=LEFT
     */
    public addGesture(action:string, gesture:string): void{
        if(gesture===""){
            this.action = action;
            return;
        }
        if(gesture[0]==="6"){
            if(!this.up) {
                this.up = new GestureTree();
            }
            this.up.addGesture(action, gesture.substr(1));
        } else if(gesture[0]==="0"){
            if(!this.right) {
                this.right = new GestureTree();
            }
            this.right.addGesture(action, gesture.substr(1));
        } else if(gesture[0]==="2"){
            if(!this.down) {
                this.down = new GestureTree();
            }
            this.down.addGesture(action, gesture.substr(1));
        } else if(gesture[0]==="4"){
            if(!this.left) {
                this.left = new GestureTree();
            }
            this.left.addGesture(action, gesture.substr(1));
        }
    }
}

/**
 * A class for drawing out a tree
 */
class GestureTreeVisualiser {
    private tree: GestureTree;

    /**
     * Instantiate a new tree visualiser
     * @param gt The tree to visualise
     */
    constructor(gt: GestureTree){
        this.tree = gt;
    }

    /**
     * Draws out a tree
     */
    public drawTree(): void{

    }


    private maxTreeDimensions(): number[]{
        let height = 1;
        let width = 1;
        return [height, width];
    }

    private static maxTreeDimensions2(tree, height, width): number[]{
        // if has north, height++
        // if has south, height++
        // if has west, width++
        //if has east, wid++

        //wont work because ou can end up looping back and writing on top of yourself
    }
}

/**
 * Create a button and add it to the vivaldi GUI.
 */
function makeGuiButton(){
    const parent = document.querySelector(ADD_BUTTON_AS_CHILD);
    const newbutton = document.createElement("span");
    /* moose pic nicked fae vivaldi*/
    newbutton.innerHTML = `
    <button title="Toggle images and animation" class="button-toolbar-small image-action animationAlways" tabindex="-1">
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 0c-3.025 0-5.5 2.314-5.5 5.143v5.714c0 2.829 2.475 5.143 5.5 5.143s5.5-2.314 5.5-5.143v-5.714c0-2.829-2.475-5.143-5.5-5.143zm-3.5 5.322c0-1.637 1.29-3.006 3-3.322v4h-3v-.678zm7 5.761c0 1.608-1.571 2.917-3.5 2.917-1.931 0-3.5-1.309-3.5-2.917v-4.083h7v4.083zm-3-5.083v-4c1.709.315 3 1.685 3 3.322v.678h-3z"></path>
  </svg>
    </button>
    `;
    newbutton.querySelector("button").addEventListener("click", guiButtonClicked);
    parent.appendChild(newbutton);
}

/**
 * Clicking the button querys the mouse gestures and displays them
 */
function guiButtonClicked(event: Event){
    chrome.storage.local.get(data => {
        const gt: GestureTree = buildGestureTree(data);
        displayVisual(gt.dfsAsList());
    });
}

/**
 * Build up the gesture tree based on the data passed in.
 * @param data as given by the chrome.storage.local.get api
 */
function buildGestureTree(data): GestureTree {
    let baseTree: GestureTree = new GestureTree();
    for(let key in data){
        if(data[key].gestures){
            for(let gesture in data[key].gestures){
                let actionName = key.substr("COMMAND_".length);
                let words = actionName.split("_");
                for(let i = 0; i < words.length; i++){
                    words[i] = words[i][0].toUpperCase() + words[i].slice(1).toLowerCase();
                }
                actionName = words.join(" ");
                baseTree.addGesture(actionName, data[key].gestures[gesture]);
            }
        }
    }
    return baseTree;
}

/**
 * Build and show the modal pop-up for the gesture cheat sheet
 *   This attempts to emulate (and re-use) the styling for the keyboard cheat sheet
 * @param listOfPairs A list of tuple-lists of strings [(action),(gesture)]
 */
function displayVisual(listOfPairs:string[][]){
    const modal = document.createElement("div");
    modal.id = "modal-bg";
    modal.className = "show-keyboard-shortcuts-modal-top float top";
    let innerHTML = `
        <div>
            <div class="keyboardShortcutsWrapper">
                <header>
                    <h1>Mouse Gestures Cheat Sheet</h1>
                    <button class="close"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
  <path d="M13.5 6l-1.4-1.4-3.1 3-3.1-3L4.5 6l3.1 3.1-3 2.9 1.5 1.4L9 10.5l2.9 2.9 1.5-1.4-3-2.9"></path>
</svg>
</button>
                </header>
                <div class="keystrokes">
                    <div data-ignore-search="true">
                        <div class="setting-single">
                            <div class="keystrokes">
                                <div class="category show">
                                    <button>All Gestures</button>
                                    <div class="list">
                                        <p>`;
    for(let i = 0; i < listOfPairs.length; i++){
        innerHTML += `<div class="keycombo">
                        <label>`+listOfPairs[i][0]+`</label>
                        <input type="button" disabled="" class="item" value="`+listOfPairs[i][1]+`">
                    </div>`;
    }
    innerHTML += `                      </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.innerHTML = innerHTML;
    modal.querySelector("button").addEventListener("click", event=>{
        modal.parentElement.removeChild(modal);
    });
    document.querySelector("#browser").appendChild(modal);
}

/**
 * Mod entry point
 */
function main():void{
    if(document.querySelector(ADD_BUTTON_AS_CHILD)){
        makeGuiButton();
    } else {
        setTimeout(main, 500);
    }
}
setTimeout(main, 500);

})();
