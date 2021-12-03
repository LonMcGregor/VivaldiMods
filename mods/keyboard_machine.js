/**
* Keyboard Machine, a Mod for Vivaldi
* Make custom shortcuts that do stuff™ and use them in the vivaldi UI
* Based on "button machine". NO COPYRIGHT RESERVED. lonm.vivaldi.net
* Version 1.0.0
*/

(function keyboardMachine(){
    /**
    * Add custom commands here
    * key: String of what keys to press - written in the form (Ctrl+Shift+Alt+Key)
    * value: A function describing what to do when the key is pressed
    */
    const SHORTCUTS = {
        "Shift+F4": () => { /* close the active panel */
            const btn = document.querySelector("#switch button.active");
            if(btn){
                btn.click();
                lastActivePanel = btn;
            } else if(lastActivePanel){
                lastActivePanel.click();
            }
        },
        "Ctrl+Shift+F4": () => { /* load all the web panels */
            const webPanels = document.querySelectorAll("#switch button.webviewbtn");
            webPanels.forEach(button => {
                button.click();
            });
            webPanels[webPanels.length-1].click();
        },
        "Ctrl+Shift+V": () => { /* paste and go into a new tab */
            /*navigator.clipboard.readText()
            .then(text => {
                console.log('Pasted content: ', text);
            })
            .catch(err => {
                console.error('Failed to read clipboard contents: ', err);
            });*/ /* The "proper" clipboard API does't work, so
            hack it by simulating relevant actions */
            chrome.tabs.create({}, () => {
                document.querySelector("input.url.vivaldi-addressfield").focus();
                document.execCommand("paste");
                document.querySelector("button.addressfield-siteinfo").click();
            });
        }
    };

    /* remember last active panel */
    let lastActivePanel;

    /**
     * Handle a potential keyboard shortcut
     * @param {int} sourceWindow Id of the browser window this keyboard event originates from.
     * @param {String} combination written in the form (CTRL+SHIFT+ALT+KEY)
     * @param {bool} autoRepeat True if the shortcut is generated as a result of automatic keyboard repeat
     */
    function keyCombo(sourceWindow, combination, autoRepeat){
        const customShortcut = SHORTCUTS[combination];
        if(sourceWindow!=vivaldiWindowId || autoRepeat){
            return;
        }
        if(customShortcut){
            customShortcut();
        }
    }

    /**
     * Check that the browser is loaded up properly, and init the mod
     */
    function initMod(){
        if(document.querySelector("#browser")){
            vivaldi.tabsPrivate.onKeyboardShortcut.addListener(keyCombo);
        } else {
            setTimeout(initMod, 500);
        }
    }
    initMod();
})();
