/**
 * Confirm Quit (a mod for Vivaldi)
 * Author: lonm
 */

(function confirmQuit(){
    "use strict";

    /**
     * Prep confirm box
     */
    function prepConfirm(){
        chrome.windows.getAll(windows => {
            makeConfirm(windows.length);
        });
    }

    /**
     * Make & Show confirm quit dialog
     * @param number n the number of windows
     */
    function makeConfirm(n){
        const confirmModalBox = document.createElement("div");
        confirmModalBox.className = "lonmConfirmQuit";

        const confirmModal = document.createElement("div");
        if(n>1){
            confirmModal.innerHTML = `
                <p>Are you sure you want to quit?</p>
                <p>There are ${n} windows currently open</p>
            `;
        } else {
            confirmModal.innerHTML = `
                <p>Are you sure you want to quit?</p>
            `;
        }
        confirmModal.className = "modal";

        const quitAll = document.createElement("button");
        quitAll.addEventListener("click", () => {
            vivaldi.runtimePrivate.exit();
        });
        quitAll.innerHTML = "Quit Vivaldi";
        confirmModal.appendChild(quitAll);

        const quitThisWindow = document.createElement("button");
        quitThisWindow.addEventListener("click", () => {
            chrome.windows.getCurrent(window => {
                chrome.windows.remove(window.id);
            });
        });
        quitThisWindow.innerHTML = "Close just this window";
        confirmModal.appendChild(quitThisWindow);

        const cancel = document.createElement("button");
        cancel.addEventListener("click", (e) => {
            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
        });
        cancel.innerHTML = "Cancel";
        confirmModal.appendChild(cancel);

        const confirmModalShadow = document.createElement("div");
        confirmModalShadow.appendChild(confirmModal);
        confirmModalShadow.className = "shadow";

        confirmModalBox.appendChild(confirmModalShadow);
        confirmModalBox.appendChild(confirmModal);

        document.querySelector("#browser").appendChild(confirmModalBox);
    }

    /**
     * Destroy and recreate the normal browser close button
     */
    function replaceClose(){
        const old = document.querySelector(".window-close");
        const newclose = old.cloneNode(true);
        newclose.addEventListener("click", prepConfirm);
        const parent = old.parentElement;
        parent.removeChild(old);
        parent.appendChild(newclose);
    }

    /**
     * Check that the browser is loaded up properly, and then initialise the mod
     */
    function initMod(){
        if(!document.querySelector(".window-close")){
            setTimeout(initMod, 500);
            return;
        }
        replaceClose();
    }

    initMod();
})();
