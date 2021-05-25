/*
* Autosave Sessions (a mod for Vivaldi)
* Written by LonM, modified by boroda
* No Copyright Reserved
*
* V4.1: Attempt to retry if settings is not ready
* v4 : Localise to current timezone, l10n
* v3 : Has own settings section & support private windows again
* v2 : Better handling of multiple windows
*
* ru translation by @boroda
*/

(function autoSaveSessionsMod(){
    "use strict";

    var timerId = -1;
    var autosaveInterval = 0;
    var oldAutosaveInterval = -1;
    var autosaveOdd = true;
    var oldAutosaveOdd = false;
    var processAutosaveOdd = true;
    var processAutosaveEven = false;
    var switchProcessed = true;

    var currentWindowIsPrivate = false;

    var autosaveTimeout = 0;

    const nullDate = Date.parse("2000-01-01");
    var lastSaveTime = nullDate;

    const oneMinuteInterval = 60 * 1000; //60 sec.
    const updateSettingsInterval = 60 * 1000; //Default - 60 sec., but can be changed
    const privateWindowsNotSavedFilenamePostfix = '!';
    const privateWindowsOnlyFilenamePostfix = '!!';

    const LANGUAGE = 'en_gb'; //en_gb or ru

    const l10n = {
        en_gb: {
            mod_name: 'Autosave Sessions Mod',
            autosaveInterval: 'Period (minutes)',
            description: 'Set 0 to disable autosaving',
            maxoldsessions: 'Old Sessions Count',
            maxoldsessionsdesc: 'Maximum number of autosaved sessions (old sessions will be deleted)',
            prefix: 'Prefix',
            fileprefix: 'AUTO',
            fileprefixdesc: 'A unique prefix made up of the following characters: A-Z 0-9 _ - <space>',
            saveprivate: 'Save Private Windows',
            saveprivatedesc: 'Save opened private windows to separate session'
        },
        ru: {
            mod_name: 'Мод автосохранения сессий',
            autosaveInterval: 'Период (в минутах)',
            description: 'Установите 0, чтобы запретить автосохранение',
            maxoldsessions: 'Количество хранимых сессий',
            maxoldsessionsdesc: 'Максимальное число автосохраняемых сессий (старые будут удаляться)',
            prefix: 'Префикс',
            fileprefix: 'АВТО',
            fileprefixdesc: 'Уникальный префикс, содержащий символы: A-Z А-Я 0-9 _ - <пробел>',
            saveprivate: 'Сохранять приватные окна',
            saveprivatedesc: 'Сохранять открытые приватные окна в отдельную сессию'
        },
    }[LANGUAGE];

    var CURRENT_SETTINGS = {};

    /*
     * Copied from bundle.js © Vivaldi - Check if a filename is valid
     * @param {string} s
     */
    function isValidName(e){
        return /^[^\\/:\*\?"<>\|]+$/.test(e) && !/^\./.test(e) && !/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i.test(e);
    }

    /*
     * Turns a date into a string that can be used in a file name
     * Locale string seems to be the best at getting the correct time for any given timezone
     * @param {Date} date object
     */
    function dateToFileSafeString(date){
        const badChars = /[\\/:\*\?"<>\|]/gi;
        let escaped = date.toLocaleString().replace(/:/g, "`");
        escaped = escaped.substring(0, escaped.length - 3); //Remove seconds from session name
        return escaped.replace(badChars, '.');
    }

    /*
     * Enable Autosaving sessions
     */
    function autoSaveSession(){
        vivaldi.sessionsPrivate.getAll(allSessions => {
            const keys = MOD_SETTINGS.reduce((prev, current) => {
                prev[current.id] = current.default;
                return prev;
            }, {});

            chrome.storage.local.get(keys, value => {
                CURRENT_SETTINGS = value;

                if(CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_DELAY_MINUTES"] === 0){
                    return;
                }

                const savePrivate = CURRENT_SETTINGS["LONM_SESSION_SAVE_PRIVATE_WINDOWS"];

                if(currentWindowIsPrivate && !savePrivate){ //Will skip the check of 'savePrivate' later
                    return;
                }

                const prefix = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_PREFIX"] + ' ';
                const maxOld = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS"];

                /* create the new session(s) */
                let name = prefix + dateToFileSafeString(new Date());

                chrome.windows.getAll({
                    populate: true,
                    windowTypes: ["normal"]
                }, openedWindows => {
                    let openedWindowsCount = openedWindows.length;
                    let openedTabsCount = 0;

                    let privateWindows = new Array();
                    let privateWindowsCount = 0;
                    let privateTabsCount = 0;

                    for(let i = 0; i < openedWindows.length; i++){
                        openedTabsCount += openedWindows[i].tabs.length;

                        if(openedWindows[i].incognito){
                            if(currentWindowIsPrivate){
                                privateWindows.push(openedWindows[i]);
                            }
                            privateWindowsCount++;
                            privateTabsCount += openedWindows[i].tabs.length;
                        }
                    }


                    if(!currentWindowIsPrivate){
                        let sessionName;

                        if(privateWindowsCount === 0){
                            if(openedWindowsCount > 1){
                                sessionName = name + " [" + openedTabsCount + "@" + openedWindowsCount + "]";
                            } else {
                                sessionName = name + " [" + openedTabsCount + "]";
                            }
                        } else {
                            if(openedWindowsCount - privateWindowsCount > 1){
                                sessionName = name + " [" + (openedTabsCount - privateTabsCount) + "@" + (openedWindowsCount - privateWindowsCount) + "]" + privateWindowsNotSavedFilenamePostfix;
                            } else if(openedWindowsCount - privateWindowsCount > 0){
                                sessionName = name + " [" + (openedTabsCount - privateTabsCount) + "]" + privateWindowsNotSavedFilenamePostfix;
                            } else {
                                sessionName = "";
                            }
                        }

                        if(sessionName != ""){
                            /* final sanity check */
                            if (!isValidName(sessionName)){
                                throw new Error('[Autosave Sessions] Cannot name a session as ""' + sessionName + '""');
                            }

                            vivaldi.sessionsPrivate.saveOpenTabs(sessionName, { saveOnlyWindowId: 0 }, () => {}); /* there is no way to tell if it failed */

                            /* delete older (not private) sessions */
                            let autosavesOnly = allSessions.filter(x => x.name.indexOf(prefix) === 0).filter(x => x.name.substring(x.name.length - privateWindowsOnlyFilenamePostfix.length) != privateWindowsOnlyFilenamePostfix);
                            let oldestFirst = autosavesOnly.sort((a,b) => {return a.createDateJS - b.createDateJS;});

                            let numberOfSessions = oldestFirst.length + 1; /* length + 1 as we have just added a new one */
                            let oldestIndex = 0;
                            while(numberOfSessions > maxOld){
                                vivaldi.sessionsPrivate.delete(oldestFirst[oldestIndex].name,() => {});
                                oldestIndex++;
                                numberOfSessions--;
                            }
                        }
                    }


                    if(currentWindowIsPrivate){ //Have checked 'savePrivate' earlier, so will skip this check
                        let sessionName;

                        if(privateWindowsCount > 1){
                            sessionName = name + " [" + privateTabsCount + "@" + privateWindowsCount + "]" + privateWindowsOnlyFilenamePostfix;
                        } else {
                            sessionName = name + " [" + privateTabsCount + "]" + privateWindowsOnlyFilenamePostfix;
                        }

                        /* final sanity check */
                        if (!isValidName(sessionName)){
                            throw new Error('[Autosave Sessions] Cannot name a session as ""' + sessionName + '""');
                        }

                        vivaldi.sessionsPrivate.saveOpenTabs(sessionName, { saveOnlyWindowId: 0 }, () => {}); /* there is no way to tell if it failed */

                        /* delete older (private) sessions */
                        const autosavesOnly = allSessions.filter(x => x.name.indexOf(prefix) === 0).filter(x => x.name.substring(x.name.length - privateWindowsOnlyFilenamePostfix.length) === privateWindowsOnlyFilenamePostfix);
                        const oldestFirst = autosavesOnly.sort((a,b) => {return a.createDateJS - b.createDateJS;});

                        let numberOfSessions = oldestFirst.length + 1; /* length + 1 as we have just added a new one */
                        let oldestIndex = 0;
                        while(numberOfSessions > maxOld){
                            vivaldi.sessionsPrivate.delete(oldestFirst[oldestIndex].name,() => {});
                            oldestIndex++;
                            numberOfSessions--;
                        }
                    }
                });
            });
        });
    }

    /*
     * Check if this is the most recent window, and if the most recent window is still open
     * if not, then stop saving the sessions
     */
    function triggerAutosaveHelper(){
        let lastWindowSettingName;
        let lastSaveTimeSettingName;
        if(!currentWindowIsPrivate){
            lastWindowSettingName = "LONM_SESSION_AUTOSAVE_LAST_WINDOW";
            lastSaveTimeSettingName = "LONM_SESSION_AUTOSAVE_LAST_DATETIME";
        } else {
            lastWindowSettingName = "LONM_SESSION_AUTOSAVE_LAST_PRIVATE_WINDOW";
            lastSaveTimeSettingName = "LONM_SESSION_AUTOSAVE_LAST_PRIVATE_DATETIME";
        }

        chrome.storage.local.get(lastWindowSettingName, lastWindowSetting => {
            chrome.storage.local.get(lastSaveTimeSettingName, lastSaveTimeSetting => {
                let lastSavedWindow = lastWindowSetting[lastWindowSettingName]; //Last window id when autosaving window has been changed
                let lastSavedSaveTime = lastSaveTimeSetting[lastSaveTimeSettingName]; //Last datetime when autosaving window has been changed
                const now = Date.now();

                if(oldAutosaveInterval !== autosaveInterval && autosaveTimeout <= 0){ //If this function is called via setTimeout() then lets schedule periodic calls via setInterval() also
                    initSwitching();
                }

                if(lastSavedWindow == null){
                    lastSavedWindow = -1;
                };


                if(window.vivaldiWindowId === lastSavedWindow){
                    /* We know this window is correct, skip the checks */
                    lastSaveTime = now;

                    chrome.storage.local.set({
                        [lastSaveTimeSettingName]: lastSaveTime
                    }, () => {
                        autoSaveSession();
                    });
                    return;
                }


                chrome.windows.getAll(openedWindows => {
                    const foundLastOpen = openedWindows.find(windowItem => windowItem.id === lastSavedWindow);

                    if(foundLastOpen){
                        /*Most recent window still active, use that one instead (see code above)*/
                    } else {
                        /*Most recent window was closed, revert to this one*/
                        if(lastSavedSaveTime == null){
                            lastSaveTime = now;
                        } else if((now - lastSavedSaveTime) > autosaveInterval){
                            lastSaveTime = now;
                        } else {
                            lastSaveTime = lastSavedSaveTime;
                        }

                        chrome.storage.local.set({
                            [lastWindowSettingName]: window.vivaldiWindowId
                        }, () => {
                            chrome.storage.local.set({
                                [lastSaveTimeSettingName]: lastSaveTime
                            }, () => {
                                if(lastSaveTime === now){
                                    autoSaveSession();
                                } else { //Lets reschedule autosavings starting from new last save time
                                    autosaveTimeout = getTimeout();
                                    initSwitching();
                                }
                            });
                        });
                    }
                });
            });
        });
    }

    function getTimeout(){
        let now = Date.now();
        let timeout = 0;

        if(lastSaveTime === nullDate){
            // timeout = 0;
        } else if(now - lastSaveTime <= 0){
            // timeout = 0;
        } else {
            timeout = autosaveInterval - (now - lastSaveTime);
        }

        return timeout;
    }

    function updateSettings(){ //Periodically checks if settings has been changed in another window
        const keys = MOD_SETTINGS.reduce((prev, current) => {
            prev[current.id] = current.default;
            return prev;
        }, {});

        chrome.storage.local.get(keys, value => {
            CURRENT_SETTINGS = value;

            let newAutosaveInterval = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_DELAY_MINUTES"] * oneMinuteInterval;
            if(autosaveInterval != newAutosaveInterval){
                autosaveInterval = newAutosaveInterval;
                autosaveTimeout = getTimeout();
                initSwitching();
            }
        });
    }

    function triggerAutosaveOdd(){
        if(processAutosaveOdd){
            switchProcessed = true;
            triggerAutosaveHelper();
        }
    }

    function triggerAutosaveEven(){
        if(processAutosaveEven){
            switchProcessed = true;
            triggerAutosaveHelper();
        }
    }

    function processSwitchOddEven(){
        if(oldAutosaveOdd !== autosaveOdd){
            oldAutosaveOdd = autosaveOdd;
            autosaveOdd = !autosaveOdd;

            if(timerId !== -1){
                clearInterval(timerId);
                timerId = -1;
            }

            if(autosaveOdd){
                processAutosaveOdd = true;
                processAutosaveEven = false;
                if(autosaveTimeout > 1000){
                    setTimeout(triggerAutosaveOdd, autosaveTimeout);
                    autosaveTimeout = 0;
                } else if(autosaveInterval > 0){
                    timerId = setInterval(triggerAutosaveOdd, autosaveInterval);
                    autosaveTimeout = 0;
                    oldAutosaveInterval = autosaveInterval;
                } else {
                    autosaveTimeout = 0;
                    oldAutosaveInterval = autosaveInterval;
                    switchProcessed = true;
                    lastSaveTime = nullDate;
                }
            } else {
                processAutosaveOdd = false;
                processAutosaveEven = true;
                if(autosaveTimeout > 1000){
                    setTimeout(triggerAutosaveEven, autosaveTimeout);
                    autosaveTimeout = 0;
                } else if(autosaveInterval > 0){
                    timerId = setInterval(triggerAutosaveEven, autosaveInterval);
                    autosaveTimeout = 0;
                    oldAutosaveInterval = autosaveInterval;
                } else {
                    autosaveTimeout = 0;
                    oldAutosaveInterval = autosaveInterval;
                    switchProcessed = true;
                    lastSaveTime = nullDate;
                }
            }
        }
    }

    function initSwitching(){
        if(switchProcessed && (oldAutosaveInterval !== autosaveInterval || autosaveTimeout > 0)){
            switchProcessed = false;
            processSwitchOddEven();
        }
    }

    /*
     * Mod the settings page to show settings there
     * Wait a little bit after a settings page has been opened and add settings in
     */
    const SETTINGSPAGE = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html?path=general";

    function modSettingsPageListener(newTab){
        if(newTab.url === SETTINGSPAGE || newTab.pendingUrl === SETTINGSPAGE){
            setTimeout(modSettingsPage, 500);
        }
    }

    function modSettingsPage(){
        const keys = MOD_SETTINGS.reduce((prev, current) => {
            prev[current.id] = current.default;
            return prev;
        }, {});

        chrome.storage.local.get(keys, value => {
            CURRENT_SETTINGS = value;

            const settingSection = document.querySelector(".vivaldi-settings .settings-content section");
            if(!settingSection){
                setTimeout(modSettingsPage, 1000);
                return;
            }
            const settingsHTML = document.createElement("section");
            settingsHTML.className = "setting-section";
            settingsHTML.id = "lonmAutosaveSessionsSettings";
            const settingsDiv = document.createElement("div");
            settingsDiv.insertAdjacentHTML("beforeend", "<h2>" + l10n.mod_name + "</h2>");
            MOD_SETTINGS.forEach(setting => {
                settingsDiv.appendChild(makeSettingElement(setting));
            });
            settingsHTML.appendChild(settingsDiv);
            settingSection.insertAdjacentElement("afterbegin", settingsHTML);
        });
    }

    /*
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
            min: 0,
            max: undefined,
            default: 5,
            title: l10n.autosaveInterval,
            description: l10n.description
        },
        {
            id: "LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS",
            type: Number,
            min: 1,
            max: undefined,
            default: 5,
            title: l10n.maxoldsessions,
            description: l10n.maxoldsessionsdesc
        },
        {
            id: "LONM_SESSION_AUTOSAVE_PREFIX",
            type: String,
            pattern: "[\\w_\\-]{0,20}",
            default: l10n.fileprefix,
            title: l10n.prefix,
            description: l10n.fileprefixdesc
        },
        {
            id: "LONM_SESSION_SAVE_PRIVATE_WINDOWS",
            type: Boolean,
            default: false,
            title: l10n.saveprivate,
            description: l10n.saveprivatedesc
        }
    ];

    /*
     * Handle a change to a setting input
     *Should be bound in a listener to the setting object
     * @param {InputEvent} input
     */
    function settingUpdated(input){
        if(input.target.type === "checkbox"){
            CURRENT_SETTINGS[this.id] = input.target.checked;
        } else {
            input.target.checkValidity();
            if(input.target.reportValidity() && input.target.value != ""){
                CURRENT_SETTINGS[this.id] = input.target.value;
            }
        }

        chrome.storage.local.set({ [this.id]: CURRENT_SETTINGS[this.id] }, () => {
            if(this.id === "LONM_SESSION_AUTOSAVE_DELAY_MINUTES"){
                let newAutosaveInterval = CURRENT_SETTINGS[this.id] * oneMinuteInterval;
                if(autosaveInterval != newAutosaveInterval){
                    autosaveInterval = newAutosaveInterval;
                    autosaveTimeout = getTimeout();
                    initSwitching();
                }
            }
        });
    }

    /*
     * Create an element for the current setting
     * @param modSetting
     */
    function makeSettingElement(modSetting){
        const currentSettingValue = CURRENT_SETTINGS[modSetting.id];
        const div = document.createElement("div");
        div.className = "setting-single";
        const title = document.createElement("h3");
        title.innerText = modSetting.title;
        div.appendChild(title);
        if(modSetting.description != ""){
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
        switch (modSetting.type){
        case Number:
            input.type = "number";
            break;
        case String:
            input.type = "text";
            break;
        case Boolean:
            input.type = "checkbox";
            if(currentSettingValue){input.checked = "checked";}
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

    /*
     * Init the mod, but only if we are not incognito, to maintain privacy.
     * Save the window id in storage, and only use the most recent window to save sessions
     */
    function init(){
        if(window.vivaldiWindowId){
            chrome.windows.getCurrent(windowItem => {
                currentWindowIsPrivate = windowItem.incognito;
                autosaveInterval = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_DELAY_MINUTES"] * oneMinuteInterval;

                setInterval(updateSettings, updateSettingsInterval); //Periodically checks if settings has been changed in another window

                initSwitching();

                chrome.tabs.onCreated.addListener(modSettingsPageListener);
            });
        } else {
            setTimeout(init, 500);
        }
    }

    /*
     * Load the settings and call the initialiser function
     */
    function loadSettingsAndInit() {
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
