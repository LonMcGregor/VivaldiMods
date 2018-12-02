(function buttonFactory(){
    const MY_BUTTONS = {
        TaskManager: {
            html: `<button class="button-toolbar-small" title="Open Vivaldi Task Manager">
                <svg viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 8v2h-2v-2h-4v2h-2v-4h6v-2h-2v-4h6v4h-2v2h6v4h-2v-2h-4zm-9 2v3h4v-3h-4zm12 0v3h4v-3h-4zm-6 0v3h4v-3h-4z"></path>
                </svg>
            </button>`,
            onclick: () => {
                vivaldi.utilities.openTaskManager(() => {});
            },
            placeAfter: "#footer > .sync-status"
        },

        ActivateAllPanels: {
            html: `<button class="button-toolbar-small" title="Open Vivaldi Task Manager">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path d="M4.5 4.5C5.4 3.6 6.6 3 8 3c2.8 0 5 2.2 5 5h2c0-3.9-3.1-7-7-7-1.9 0-3.7.8-4.9 2.1L1 1v6h6L4.5 4.5zM11.5 11.5c-.9.9-2.1 1.5-3.5 1.5-2.8 0-5-2.2-5-5H1c0 3.9 3.1 7 7 7 1.9 0 3.7-.8 4.9-2.1L15 15V9H9l2.5 2.5z"></path>
                </svg>
            </button>`,
            onclick: () => {
                const webPanels = document.querySelectorAll("#switch button.webviewbtn");
                webPanels.forEach(button => {
                    button.click();
                });
                webPanels[webPanels.length-1].click();
            },
            placeAfter: "#footer > .sync-status"
        },
    };
    function mb(bd){const d=document.createElement("div");d.innerHTML=bd.html;const nb=d.firstChild;nb.addEventListener("click",bd.onclick);return nb;}function cb(bd){const eui=document.querySelector(bd.placeAfter);if(!eui){console.warn(`Can't add button as selector ${bd.placeAfter} is not ready`);return;}const b=mb(bd);eui.insertAdjacentElement("afterend",b);}function mab(){for(const bk in MY_BUTTONS){cb(MY_BUTTONS[bk]);}}function i(){if(!document.querySelector("#browser")){setTimeout(i,500);return;}mab();}i();
})();
