/**
* Keyboard Machine, a Mod for Vivaldi
* Make custom shortcuts that do stuff™ and use them in the vivaldi UI
* Based on "button machine". NO COPYRIGHT RESERVED. lonm.vivaldi.net
* Version 1.0.0
*/

(function keyboardMachine(){
    /**
    * Add custom buttons here
    *
    * key: String of what keys to press - written in the form (CTRL+SHIFT+ALT+KEY)
    * onpress: What to do when the shortcut is pressed
    * contentScript: do something in a content script
    */
    const SHORTCUTS = {
        ClseOpenPanel: {
            key: "SHIFT+F4",
            onpress: () => {
                const btn = document.querySelector("#switch button.active");
                btn.click();
            }
        }
    };

    /**
     * Perform a content script activity
     * @param {function} func
     */
    function doContentScript(func){
        chrome.tabs.executeScript({
            code: `(${func})()`
        });
    }

    /**
     * Add a listener for a shortcut definition
     * @param {KeyboardEvent} e - a keypress
     */
    function heyListen(e){
        let expectedKey = "";
        expectedKey += e.ctrlKey ? "CTRL+" : "";
        expectedKey += e.shiftKey ? "SHIFT+" : "";
        expectedKey += e.altKey ? "ALT+" : "";
        expectedKey += e.key.toUpperCase();
        for (const name in SHORTCUTS) {
            if (SHORTCUTS.hasOwnProperty(name)) {
                const def = SHORTCUTS[name];
                if(def.key===expectedKey){
                    if(def.onpress){
                        def.onpress();
                    }
                    if(def.contentScript){
                        doContentScript(def.contentScript);
                    }
                }
            }
        }
    }

    /**
     * Check that the browser is loaded up properly, and init the mod
     */
    function initMod(){
        if(!document.querySelector("#browser")){
            setTimeout(initMod, 500);
            return;
        }
        document.addEventListener("keyup", heyListen);
    }
    initMod();
})();
