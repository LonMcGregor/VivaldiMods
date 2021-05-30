/*
* Autosave Sessions (a mod for Vivaldi)
* Written by LonM
* V4.2: Luetage always init on setting general tab
* V4.1: Attempt to retry if settings is not ready
* v4 : Localise to current timezone, l10n
* v3 : Has own settings section & support private windows again
* v2 : Better handling of multiple windows
*/

(function autoSaveSessionsMod(){
    "use strict";

    const LANGUAGE = 'en_gb'; // en_gb or ko

    const l10n = {
        en_gb: {
            delay: 'Period (minutes)',
            restart: 'This setting requires a restart to take full effect.',
            maxoldsessions: 'Old Sessions Count',
            prefix: 'Prefix',
            prefixdesc: 'A unique prefix made up of the following characters: A-Z 0-9 _',
            saveprivate: 'Save Private Windows'
        },
    }[LANGUAGE];

    let CURRENT_SETTINGS = {};

    /**
     * Copied from bundle.js © Vivaldi - Check if a filename is valid
     * @param {string} s
     */
    function isValidName(e){
        return /^[^\\/:\*\?"<>\|]+$/.test(e) && !/^\./.test(e) && !/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i.test(e);
    }

    /**
     * Turns a date into a string that can be used in a file name
     * Locale string seems to be the best at getting the correct time for any given timezone
     * @param {Date} date object
     */
    function dateToFileSafeString(date){
        const badChars = /[\\/:\*\?"<>\|]/gi;
        return date.toLocaleString().replace(badChars, '.');
    }/*
 * Autosave Sessions (a mod for Vivaldi)
 * Written by LonM, modified by boroda74
 * No Copyright Reserved
 * 
 * V4.1: Attempt to retry if settings is not ready
 * v4 : Localise to current timezone, l10n
 * v3 : Has own settings section & support private windows again
 * v2 : Better handling of multiple windows
 * 
 * ru-RU translation by @boroda74
*/

(function autoSaveSessionsMod(){
	"use strict";
	
	var TimerId = -1;
	var AutosaveInterval = 0;
	var OldAutosaveInterval = -1;
	var AutosaveOdd = true;
	var OldAutosaveOdd = false;
	var ProcessAutosaveOdd = true;
	var ProcessAutosaveEven = false;
	var OddEvenSwitchingProcessed = true;

	var CurrentWindowIsPrivate = false;
	
	var AutosaveTimeout = 0;
	
	const NullDate = Date.parse("2000-01-01");
	var LastSaveTime = NullDate;
	
	const OneMinuteInterval = 60 * 1000; //60 sec.
	const UpdateSettingsInterval = 60 * 1000; //Default - 60 sec., but can be changed
	const PrivateWindowsNotSavedFilenamePostfix = '!';
	const PrivateWindowsOnlyFilenamePostfix = '!!';
	
	const LANGUAGES = new Array();
	
	var LANGUAGE;
	
	const l10n = {
		'en-GB': {
			language_name: 'English (UK English) \u2002\u2002', //Two Em-spaces at the end are to equalize language dropdown width with other setting fields
			mod_name: 'Autosave Sessions Mod',
			language: 'Language',
			language_description: 'Select mod language',
			autosave_interval: 'Period (minutes)', 
			autosave_interval_description: 'Set 0 to disable autosaving', 
			max_old_sessions: 'Old Sessions Count', 
			max_old_sessions_description: 'Maximum number of autosaved sessions (old sessions will be deleted)', 
			prefix: 'Prefix',
			file_prefix: 'AUTO',
			file_prefix_description: 'A unique prefix made up of the following characters: A-Z 0-9 _ - <space>',
			save_private_windows: 'Save Private Windows',
			save_private_windows_description: 'Save opened private windows to separate session'
		},
		'ru-RU': {
			language_name: 'Russian (Русский)',
			mod_name: 'Мод автосохранения сессий',
			language: 'Язык интефейса',
			language_description: 'Выберите язык мода',
			autosave_interval: 'Период (в минутах)', 
			autosave_interval_description: 'Установите 0, чтобы запретить автосохранение', 
			max_old_sessions: 'Количество хранимых сессий',
			max_old_sessions_description: 'Максимальное число автосохраняемых сессий (старые будут удаляться)',
			prefix: 'Префикс',
			file_prefix: 'АВТО',
			file_prefix_description: 'Уникальный префикс, содержащий символы: A-Z А-Я 0-9 _ - <пробел>',
			save_private_windows: 'Сохранять приватные окна',
			save_private_windows_description: 'Сохранять открытые приватные окна в отдельную сессию'
		},
	};
	
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

				if(CurrentWindowIsPrivate && !savePrivate){ //Will skip the check of 'savePrivate' later
					return;
				}

				/* Create the new session */
				chrome.windows.getAll({
					populate: true,
					windowTypes: ["normal"]
				}, openedWindows => {
					const prefix = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_PREFIX"] + ' ';
					const maxOld = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS"];
					
					let name = prefix + dateToFileSafeString(new Date());
					
					let openedWindowsCount = openedWindows.length;
					let privateWindowsCount = 0;
					
					for(let i = 0; i < openedWindows.length; i++){
						if(openedWindows[i].incognito){
							privateWindowsCount++;
						}
					}
					
					
					if(!CurrentWindowIsPrivate){
						let sessionName;
						
						if(privateWindowsCount > 0){
							if(openedWindowsCount > privateWindowsCount){
								sessionName = name + PrivateWindowsNotSavedFilenamePostfix;
							} else {
								sessionName = "";
							}
						} else {
							sessionName = name;
						}
						
						if(sessionName !== ""){
							/* Final sanity check */
							if (!isValidName(sessionName)){
								throw new Error('[Autosave Sessions] Cannot name a session as ' + sessionName);
							}
							
							vivaldi.sessionsPrivate.saveOpenTabs(sessionName, { saveOnlyWindowId: 0 }, () => {}); /* There is no way to tell if it failed */
							
							/* Delete older (not private) sessions */
							let autosavesOnly = allSessions.filter(x => x.name.indexOf(prefix) === 0).filter(x => x.name.substring(x.name.length - PrivateWindowsOnlyFilenamePostfix.length) !== PrivateWindowsOnlyFilenamePostfix);
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
					
					
					if(CurrentWindowIsPrivate){ //Have checked 'savePrivate' earlier, so will skip this check
						let sessionName = name + PrivateWindowsOnlyFilenamePostfix;
						
						/* Final sanity check */
						if (!isValidName(sessionName)){
							throw new Error('[Autosave Sessions] Cannot name a session as ""' + sessionName + '""');
						}
						
						vivaldi.sessionsPrivate.saveOpenTabs(sessionName, { saveOnlyWindowId: 0 }, () => {}); /* There is no way to tell if it failed */
						
						/* Delete older (private) sessions */
						const autosavesOnly = allSessions.filter(x => x.name.indexOf(prefix) === 0).filter(x => x.name.substring(x.name.length - PrivateWindowsOnlyFilenamePostfix.length) === PrivateWindowsOnlyFilenamePostfix);
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
		if(!CurrentWindowIsPrivate){
			lastWindowSettingName = "LONM_SESSION_AUTOSAVE_LAST_WINDOW";
			lastSaveTimeSettingName = "LONM_SESSION_AUTOSAVE_LAST_DATETIME";
		} else {
			lastWindowSettingName = "LONM_SESSION_AUTOSAVE_LAST_PRIVATE_WINDOW";
			lastSaveTimeSettingName = "LONM_SESSION_AUTOSAVE_LAST_PRIVATE_DATETIME";
		}
		
		chrome.storage.local.get([lastWindowSettingName, lastSaveTimeSettingName], lastSettings => {
			let lastSavedWindow = lastSettings[lastWindowSettingName]; //Last window id when autosaving window has been changed
			let lastSavedSaveTime = lastSettings[lastSaveTimeSettingName]; //Last datetime when autosaving window has been changed
			const now = Date.now();
			
			if(OldAutosaveInterval !== AutosaveInterval && AutosaveTimeout <= 0){ //If this function is called via setTimeout() then lets schedule periodic calls via setInterval() now
				initSwitching();
			}
			
			if(lastSavedWindow == null){
				lastSavedWindow = -1;
			};
			
			
			if(window.vivaldiWindowId === lastSavedWindow){
				/* We know this window is correct, skip the checks */
				LastSaveTime = now;

				chrome.storage.local.set({ 
					[lastSaveTimeSettingName]: LastSaveTime 
				}, () => {
					autoSaveSession();
				});
				return;
			}
			
			
			chrome.windows.getAll(openedWindows => {
				const foundLastOpen = openedWindows.find(windowItem => windowItem.id === lastSavedWindow);
				
				if(foundLastOpen){
					/* Most recent window still active, use that one instead (see code above) */
				} else {
					/* Most recent window was closed, revert to this one */
					if(lastSavedSaveTime == null){
						LastSaveTime = now;
					} else if((now - lastSavedSaveTime) > AutosaveInterval){
						LastSaveTime = now;
					} else {
						LastSaveTime = lastSavedSaveTime;
					}
					
					chrome.storage.local.set({ 
						[lastWindowSettingName]: window.vivaldiWindowId, [lastSaveTimeSettingName]: LastSaveTime 
					}, () => {
						if(LastSaveTime === now){
							autoSaveSession();
						} else { //Lets reschedule autosavings starting from new last save time 
							AutosaveTimeout = getTimeout();
							initSwitching();
						}
					});
				}
			});
		});
	}
	
	function getTimeout(){
		let now = Date.now();
		let timeout = 0;
		
		if(LastSaveTime === NullDate){
			// timeout = 0;
		} else if(now - LastSaveTime < 0){
			// timeout = 0;
		} else {
			timeout = AutosaveInterval - (now - LastSaveTime);
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
			
			let newAutosaveInterval = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_DELAY_MINUTES"] * OneMinuteInterval;
			if(AutosaveInterval !== newAutosaveInterval){
				AutosaveInterval = newAutosaveInterval;
				AutosaveTimeout = getTimeout();
				initSwitching();
			}
		});
	}
	
	function triggerAutosaveOdd(){
		if(ProcessAutosaveOdd){
			OddEvenSwitchingProcessed = true;
			triggerAutosaveHelper();
		}
	}
	
	function triggerAutosaveEven(){
		if(ProcessAutosaveEven){
			OddEvenSwitchingProcessed = true;
			triggerAutosaveHelper();
		}
	}
	
	function processSwitchOddEven(){
		if(OldAutosaveOdd !== AutosaveOdd){
			OldAutosaveOdd = AutosaveOdd;
			AutosaveOdd = !AutosaveOdd;
			
			if(TimerId !== -1){
				clearInterval(TimerId);
				TimerId = -1;
			}
			
			if(AutosaveOdd){
				ProcessAutosaveOdd = true;
				ProcessAutosaveEven = false;
				if(AutosaveTimeout > 1000){
					setTimeout(triggerAutosaveOdd, AutosaveTimeout);
					AutosaveTimeout = 0;
				} else if(AutosaveInterval > 0){
					TimerId = setInterval(triggerAutosaveOdd, AutosaveInterval);
					AutosaveTimeout = 0;
					OldAutosaveInterval = AutosaveInterval;
				} else {
					AutosaveTimeout = 0;
					OldAutosaveInterval = AutosaveInterval;
					OddEvenSwitchingProcessed = true;
					LastSaveTime = NullDate;
				}
			} else {
				ProcessAutosaveOdd = false;
				ProcessAutosaveEven = true;
				if(AutosaveTimeout > 1000){
					setTimeout(triggerAutosaveEven, AutosaveTimeout);
					AutosaveTimeout = 0;
				} else if(AutosaveInterval > 0){
					TimerId = setInterval(triggerAutosaveEven, AutosaveInterval);
					AutosaveTimeout = 0;
					OldAutosaveInterval = AutosaveInterval;
				} else {
					AutosaveTimeout = 0;
					OldAutosaveInterval = AutosaveInterval;
					OddEvenSwitchingProcessed = true;
					LastSaveTime = NullDate;
				}
			}
		}
	}
	
	function initSwitching(){
		if(OddEvenSwitchingProcessed && (OldAutosaveInterval !== AutosaveInterval || AutosaveTimeout > 0)){
			OddEvenSwitchingProcessed = false;
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
			
			let lonmAutosaveSessionsSettings = document.getElementById("lonmAutosaveSessionsSettings");
			if(lonmAutosaveSessionsSettings){
				lonmAutosaveSessionsSettings.parentNode.removeChild(lonmAutosaveSessionsSettings);
			}
			
			const settingsHTML = document.createElement("section");
			settingsHTML.className = "setting-section";
			settingsHTML.id = "lonmAutosaveSessionsSettings";
			const settingsDiv = document.createElement("div");
			settingsDiv.insertAdjacentHTML("beforeend", "<h2>" + l10n[LANGUAGE].mod_name + "</h2>");
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
	 *
	 * Don't forget to edit function initModUILocalization() if you add/remove mod settings!
	 */
	const MOD_SETTINGS = [ //Settings are not localized yet, will localize them later
		{
			id: "LONM_SESSION_AUTOSAVE_DELAY_MINUTES",
			type: Number,
			min: 0,
			max: undefined,
			default: 15,
		},
		{
			id: "LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS",
			type: Number,
			min: 1,
			max: undefined,
			default: 7,
		},
		{ //This dictionary must be 3d (#2 - 0, 1, 2) in array
			id: "LONM_SESSION_AUTOSAVE_PREFIX",
			type: String,
			pattern: "[\\wа-яА-Я_\\-]{0,20}",
			default: "AUTO",
		},
		{
			id: "LONM_SESSION_SAVE_PRIVATE_WINDOWS",
			type: Boolean,
			default: false,
		},
		{
			id: "LONM_AUTOSAVE_SESSIONS_LANGUAGE",
			type: String,
			pattern: "[\\w_\\-]{2,5}",
			default: "en-GB",
		},
	];
	
	/*
	 * Handle a change to a setting input
	 * Should be bound in a listener to the setting object
	 * @param {InputEvent} input
	 */
	function settingUpdated(input){
		let oldLanguageValue = CURRENT_SETTINGS["LONM_AUTOSAVE_SESSIONS_LANGUAGE"];
		let oldPrefixIsDefault = (CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_PREFIX"] === MOD_SETTINGS[2].default);
		
		if(input.target.type === "checkbox"){
			CURRENT_SETTINGS[this.id] = input.target.checked;
		} else {
			input.target.checkValidity();
			if(input.target.reportValidity() && input.target.value !== ""){
				CURRENT_SETTINGS[this.id] = input.target.value;
			}
		}
		
		if(this.id === "LONM_AUTOSAVE_SESSIONS_LANGUAGE" && oldLanguageValue !== CURRENT_SETTINGS[this.id]){
			initModUILocalization();
			
			if(oldPrefixIsDefault){
				CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_PREFIX"] = MOD_SETTINGS[2].default;
			}
		}
		
		chrome.storage.local.set({ [this.id]: CURRENT_SETTINGS[this.id], ["LONM_SESSION_AUTOSAVE_PREFIX"]: CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_PREFIX"] }, () => {
			if(this.id === "LONM_SESSION_AUTOSAVE_DELAY_MINUTES"){
				let newAutosaveInterval = CURRENT_SETTINGS[this.id] * OneMinuteInterval;
				if(AutosaveInterval !== newAutosaveInterval){
					AutosaveInterval = newAutosaveInterval;
					AutosaveTimeout = getTimeout();
					initSwitching();
				}
			} else if(this.id === "LONM_AUTOSAVE_SESSIONS_LANGUAGE" && oldLanguageValue !== CURRENT_SETTINGS[this.id]){
				modSettingsPage();
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
		if(modSetting.description !== ""){
			const info = document.createElement("p");
			info.className = "info";
			info.innerText = modSetting.description;
			div.appendChild(info);
		}
		
		if(modSetting.id === "LONM_AUTOSAVE_SESSIONS_LANGUAGE"){
			const select = document.createElement("select");
			select.id = "LONM_AUTOSAVE_LANGUAGE_SELECT";
			for (let [lang_id, lang_dict] of Object.entries(l10n)){
				let option = document.createElement("option");
				option.value = lang_id;
				option.text = lang_dict.language_name;
				select.appendChild(option);
			}
			select.value = currentSettingValue;
			select.addEventListener("change", settingUpdated.bind(modSetting));
			
			const label = document.createElement("label");
			label.setAttribute("for", select.id);
			label.appendChild(select);
			div.appendChild(label);
		} else {
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
		}
		
		return div;
	}
	
	/*
	 * (Re)initialize localization of mod settings 
	 */
	function initModUILocalization(){
		LANGUAGE = CURRENT_SETTINGS["LONM_AUTOSAVE_SESSIONS_LANGUAGE"];
		
		for(let i = 0; i < MOD_SETTINGS.length; i++){
			let setting = MOD_SETTINGS[i];
			
			switch (setting.id){
				case ("LONM_SESSION_AUTOSAVE_DELAY_MINUTES"): 
					setting["title"] = l10n[LANGUAGE].autosave_interval;
					setting["description"] = l10n[LANGUAGE].autosave_interval_description;
					break;
				case ("LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS"): 
					setting["title"] = l10n[LANGUAGE].max_old_sessions;
					setting["description"] = l10n[LANGUAGE].max_old_sessions_description;
					break;
				case ("LONM_SESSION_AUTOSAVE_PREFIX"): 
					setting["default"] = l10n[LANGUAGE].file_prefix;
					setting["title"] = l10n[LANGUAGE].prefix;
					setting["description"] = l10n[LANGUAGE].file_prefix_description;
					break;
				case ("LONM_SESSION_SAVE_PRIVATE_WINDOWS"): 
					setting["title"] = l10n[LANGUAGE].save_private_windows;
					setting["description"] = l10n[LANGUAGE].save_private_windows_description;
					break;
				case ("LONM_AUTOSAVE_SESSIONS_LANGUAGE"): 
					setting["title"] = l10n[LANGUAGE].language;
					setting["description"] = l10n[LANGUAGE].language_description;
					break;
				default: 
					break;
			};
		};
	}
	
	/*
	 * Init the mod, but only if we are not incognito, to maintain privacy.
	 * Save the window id in storage, and only use the most recent window to save sessions
	 */
	function init(){
		if(window.vivaldiWindowId){
			chrome.windows.getCurrent(windowItem => {
				CurrentWindowIsPrivate = windowItem.incognito;
				AutosaveInterval = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_DELAY_MINUTES"] * OneMinuteInterval;
				
				setInterval(updateSettings, UpdateSettingsInterval); //Periodically checks if settings has been changed in another window
				
				initSwitching();
				
				if(CURRENT_SETTINGS["LONM_AUTOSAVE_SESSIONS_LANGUAGE"] == null){
					CURRENT_SETTINGS["LONM_AUTOSAVE_SESSIONS_LANGUAGE"] = "en-GB";
				}
				
				for (let [lang_id, lang_dict] of Object.entries(l10n)){
					LANGUAGES.push(lang_id);
				}
				
				initModUILocalization();
				
				chrome.tabs.onCreated.addListener(modSettingsPageListener);
			});
		} else {
			setTimeout(init, 500);
		}
	}
	
	/*
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


    /**
     * Enable Autosaving sessions
     */
    function autoSaveSession(isPrivate){
        vivaldi.sessionsPrivate.getAll(allSessions => {
            const priv = isPrivate ? "PRIV" : "";
            const prefix = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_PREFIX"] + priv;
            const maxOld = CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS"];
            const now = new Date();
            const autosavesOnly = allSessions.filter(x => x.name.indexOf(prefix)===0);
            const oldestFirst = autosavesOnly.sort((a,b) => {return a.createDateJS - b.createDateJS;});

            /* create the new session */
            const name = prefix + dateToFileSafeString(now);
            /* final sanity check */
            if (!isValidName(name)){
                throw new Error("[Autosave Sessions] Cannot name a session as " + name);
            }
            const options = {
                saveOnlyWindowId: 0
            };
            vivaldi.sessionsPrivate.saveOpenTabs(name, options, () => {}); /* there is no way to tell if it failed */

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
        chrome.storage.local.get("LONM_SESSION_AUTOSAVE_LAST_WINDOW", data => {
            const lastOpenedWindow = data["LONM_SESSION_AUTOSAVE_LAST_WINDOW"];
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
                        "LONM_SESSION_AUTOSAVE_LAST_WINDOW": window.vivaldiWindowId
                    }, () => {
                        autoSaveSession();
                    });
                }
            });
        });
    }
    function triggerAutosavePrivate(){
        chrome.storage.local.get("LONM_SESSION_AUTOSAVE_LAST_PRIV_WINDOW", data => {
            const lastOpenedWindow = data["LONM_SESSION_AUTOSAVE_LAST_PRIV_WINDOW"];
            if(window.vivaldiWindowId===lastOpenedWindow){
                /* We know this window is correct, skip the checks */
                autoSaveSession(true);
                return;
            }
            chrome.windows.getAll(openWindows => {
                const foundLastOpen = openWindows.find(window => window.id===lastOpenedWindow);
                if(foundLastOpen){
                    /*Most recent window still active, use that one instead*/
                } else {
                    /*Most recent window was closed, revert to this one*/
                    chrome.storage.local.set({
                        "LONM_SESSION_AUTOSAVE_LAST_PRIV_WINDOW": window.vivaldiWindowId
                    }, () => {
                        autoSaveSession(true);
                    });
                }
            });
        });
    }

    /**
     * Mod the settings page to show settings there
     * Wait a little bit after a settings page has been opened and add settings in
     */
    const SETTINGSPAGE = "chrome-extension://mpognobbkildjkofajifpdfhcoklimli/components/settings/settings.html?path=general";
    function modSettingsPage(){
        const settingSection = document.querySelector(".vivaldi-settings .settings-content section");
        const check = document.getElementById("lonmAutosaveSessionsSettings");
        if(!settingSection){
            setTimeout(modSettingsPage, 1000);
            return;
        }
        if(!check){
            const settingsHTML = document.createElement("section");
            settingsHTML.className = "setting-section";
            settingsHTML.id = "lonmAutosaveSessionsSettings";
            const settingsDiv = document.createElement("div");
            settingsDiv.insertAdjacentHTML("beforeend", "<h2>Autosave Sessions Mod</h2>");
            MOD_SETTINGS.forEach(setting => {
                settingsDiv.appendChild(makeSettingElement(setting));
            });
            settingsHTML.appendChild(settingsDiv);
            settingSection.insertAdjacentElement("afterbegin", settingsHTML);
        }
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
            title: l10n.delay,
            description: l10n.restart
        },
        {
            id: "LONM_SESSION_AUTOSAVE_MAX_OLD_SESSIONS",
            type: Number,
            min: 1,
            max: undefined,
            default: 5,
            title: l10n.maxoldsessions
        },
        {
            id: "LONM_SESSION_AUTOSAVE_PREFIX",
            type: String,
            pattern: "[\\w_]{0,20}",
            default: "VSESAUTOSAVE_",
            title: l10n.prefix,
            description: l10n.prefixdesc
        },
        {
            id: "LONM_SESSION_SAVE_PRIVATE_WINDOWS",
            type: Boolean,
            default: false,
            title: l10n.saveprivate,
            description: l10n.restart
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

    /**
     * Init the mod, but only if we are not incognito, to maintain privacy.
     * Save the window id in storage, and only use the most recent window to save sessions
     */
    function init(){
        if(window.vivaldiWindowId){
            chrome.windows.getCurrent(window => {
                if(!window.incognito){
                    chrome.storage.local.set({
                        "LONM_SESSION_AUTOSAVE_LAST_WINDOW": window.vivaldiWindowId
                    }, () => {
                        setInterval(triggerAutosave, CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_DELAY_MINUTES"]*60*1000);
                    });
                }
                if(CURRENT_SETTINGS["LONM_SESSION_SAVE_PRIVATE_WINDOWS"] && window.incognito){
                    chrome.storage.local.set({
                        "LONM_SESSION_AUTOSAVE_LAST_PRIV_WINDOW": window.vivaldiWindowId
                    }, () => {
                        setInterval(triggerAutosavePrivate, CURRENT_SETTINGS["LONM_SESSION_AUTOSAVE_DELAY_MINUTES"]*60*1000);
                    });
                }
                chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                    if (changeInfo.url === SETTINGSPAGE) {
                        modSettingsPage();
                    }
                })
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
