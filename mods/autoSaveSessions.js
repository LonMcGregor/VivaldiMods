/*
* Autosave Sessions (a mod for Vivaldi)
* Written by LonM
* v3 : Has own settings section
* v2 : Better handling of multiple windows
*/

(function autoSaveSessionsMod(){
    "use strict";

    let CURRENT_SETTINGS = {};

    /**
     * Enable Autosaving sessions
     */
    function autoSaveSession(){
        vivaldi.sessionsPrivate.getAll(allSessions => {
            const prefix = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_PREFIX"];
            const maxOld = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS"];
            const now = new Date();
            const autosavesOnly = allSessions.filter(x => x.name.indexOf(prefix)===0);
            const oldestFirst = autosavesOnly.sort((a,b) => {return a.createDateJS - b.createDateJS;});

            /* create the new session */
            const name = prefix + now.toISOString().replace(":",".").replace(":",".");
            const options = {
                saveOnlyWindowId: 0
            };
            vivaldi.sessionsPrivate.saveOpenTabs(name, options, () => {});

            /* delete older sessions */
            let numberOfSessions = oldestFirst.length + 1; /* length + 1 as we have just added a new one */
            let oldestIndex = 0;
            while(numberOfSessions > maxOld){
                vivaldi.sessionsPrivate.delete(oldestFirst[oldestIndex].name,() => {});
                oldestIndex++;
                numberOfSessions--;
            }
        });
    }

    /**
     * Check if this is the most recent window, and if the most recent window is still open
     * if not, then stop saving the sessions
     */
    function triggerAutosave(){
        chrome.storage.local.get("lonm.autosave.lastOpenedWindow", data => {
            const lastOpenedWindow = data["lonm.autosave.lastOpenedWindow"];
            if(window.vivaldiWindowId===lastOpenedWindow){
                /* We know this window is correct, skip the checks */
                autoSaveSession();
                return;
            }
            chrome.windows.getAll(openWindows => {
                const foundLastOpen = openWindows.find(window => window.id===lastOpenedWindow);
                if(foundLastOpen){
                    /*Most recent window still active, use that one instead*/
                } else {
                    /*Most recent window was closed, revert to this one*/
                    chrome.storage.local.set({
                        "lonm.autosave.lastOpenedWindow": window.vivaldiWindowId
                    }, () => {
                        autoSaveSession();
                    });
                }
            });
        });
    }

    /**
     * Mod the settings page to show settings there
     * Wait a little bit after a settings page has been opened and add settings in
     */
    function modSettingsPageListener(newTab){
        if(newTab.url==="chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html?path=general"){
            setTimeout(modSettingsPage, 1000);
        }
    }
    function modSettingsPage(){
        const settingsHTML = document.createElement("section");
        settingsHTML.className = "setting-section";
        settingsHTML.id = "lonmAutosaveSessionsSettings";
        const settingsDiv = document.createElement("div");
        settingsDiv.insertAdjacentHTML("beforeend", "<h2>Autosave Sessions Mod</h2>");
        MOD_SETTINGS.forEach(setting => {
            settingsDiv.appendChild(makeSettingElement(setting));
        });
        settingsHTML.appendChild(settingsDiv);
        document.querySelector(".vivaldi-settings .settings-content section").insertAdjacentElement("afterbegin", settingsHTML);
    }

    /**
     * For a mod setting you need:
     *
     * A) Load it when the mod starts
     * B) Make an option for it when settings is opened
     * C) Change the saved and current state with new value when setting is changed
     *
     * Mod setting has:
     * Key: string
     * Default Value: string|int
     * Description: string
     */
    const MOD_SETTINGS = [
        {
            id: "LONM_SESSION_AUTOSAVE_DELAY_MINUTES",
            type: Number,
            min: 1,
            max: undefined,
            default: 5,
            title: "Period (minutes)",
            description: "This setting requires a restart to take full effect."
        },
        {
            id: "LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS",
            type: Number,
            min: 1,
            max: undefined,
            default: 5,
            title: "Old Sessions Count"
        },
        {
            id: "LONM_SESSION_AUTOSAVE_PREFIX",
            type: String,
            pattern: "[\\w_]{0,20}",
            default: "VSESAUTOSAVE_",
            title: "Prefix",
            description: "A unique prefix made up of the following characters: A-Z 0-9 _"
        }
    ];

    /**
     * Handle a change to a setting input
     *   Should be bound in a listener to the setting object
     * @param {InputEvent} input
     */
    function settingUpdated(input){
        if(input.target.type === "checkbox"){
            CURRENT_SETTINGS[this.id] = input.target.checked;
        } else {
        input.target.checkValidity();
        if(input.target.reportValidity() && input.target.value !== ""){
            CURRENT_SETTINGS[this.id] = input.target.value;
            }
        }
            chrome.storage.local.set(CURRENT_SETTINGS);
        }
    }

    /**
     * Create an element for the current setting
     * @param modSetting
     */
    function makeSettingElement(modSetting) {
        const currentSettingValue = CURRENT_SETTINGS[modSetting.id];
        const div = document.createElement("div");
        div.className = "setting-single";
        const title = document.createElement("h3");
        title.innerText = modSetting.title;
        div.appendChild(title);
        if(modSetting.description){
            const info = document.createElement("p");
            info.className = "info";
            info.innerText = modSetting.description;
            div.appendChild(info);
        }
        const input = document.createElement("input");
        input.id = modSetting.id;
        input.value = currentSettingValue;
        input.autocomplete = "off";
        input.autocapitalize = "off";
        input.autocorrect = "off";
        input.spellcheck = "off";
        switch (modSetting.type) {
        case Number:
            input.type = "number";
            break;
        case String:
            input.type = "text";
            break;
        case Boolean:
            input.type = "checkbox";
            break;
        default:
            throw Error("Unknown setting type!");
        }
        if(modSetting.max){input.max = modSetting.max;}
        if(modSetting.min){input.min = modSetting.min;}
        if(modSetting.pattern){input.pattern = modSetting.pattern;}
        input.addEventListener("input", settingUpdated.bind(modSetting));
        div.appendChild(input);
        return div;
    }

    /**
     * Init the mod, but only if we are not incognito, to maintain privacy.
     * Save the window id in storage, and only use the most recent window to save sessions
     */
    function init(){
        if(window.vivaldiWindowId){
            chrome.windows.getCurrent(window => {
                if(!window.incognito){
                    chrome.storage.local.set({
                        "lonm.autosave.lastOpenedWindow": window.vivaldiWindowId
                    }, () => {
                        setInterval(triggerAutosave, CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_DELAY_MINUTES"]*60*1000);
                        chrome.tabs.onCreated.addListener(modSettingsPageListener);
                    });
                }
            });
        } else {
            setTimeout(init, 500);
        }
    }

    /**
     * Load the settings and call the initialiser function
     */
    function loadSettingsAndInit(){
        const keys = MOD_SETTINGS.reduce((prev, current) => {
            prev[current.id] = current.default;
            return prev;
        }, {});
        chrome.storage.local.get(keys, value => {
            CURRENT_SETTINGS = value;
            setTimeout(init, 500);
        });
    }

    loadSettingsAndInit();
})();
