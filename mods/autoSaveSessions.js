/*
* Autosave Sessions (a mod for Vivaldi)
* Written by LonM
*/

(function autoSaveSessionsMod(){

 /*
 * Autosave Prefix must be a unique name
 *   don't use it in your mnually saved sessions!
 *   It has to be a compatible file name,
 *   so avoid space, brackets, special characters etc.
 *   also, it can't be blank!
 */
const SESSION_AUTOSAVE_PREFIX = "VSESAUTOSAVE_";
/*
 * Delay (Minutes) defines how frequently an autosave should happen
 *     delay should be greater than 0
 *     Just change the first value (the MINUTES value)
 */
const SESSION_AUTOSAVE_DELAY_MINUTES = 5;
const SESSION_AUTOSAVE_DELAY = SESSION_AUTOSAVE_DELAY_MINUTES * 1000 * 60;

/*
*  Max old sessions says how many old sessions to keep
*     Oldest sessions are deleted if there are too many
*     Set to Infinity to keep all sessions
*/
const SESSION_AUTOSAVE_MAX_OLD_SESSIONS = 5;

/**
 * Variable validations
 */
if(SESSION_AUTOSAVE_DELAY <= 0){
    console.error("Session autosave delay must be greater than 0");
    return;
}
if(SESSION_AUTOSAVE_PREFIX === ""){
    console.error("Session autosave premix must not be empty string");
    return;
}
if(SESSION_AUTOSAVE_MAX_OLD_SESSIONS <= 0){
    console.error("Session autosave must keep at least 1 old session");
    return;
}

/**
 * Enable Autosaving sessions
 */
function autoSaveSession(){
    vivaldi.sessionsPrivate.getAll(allSessions => {
        const now = new Date();
        const autosavesOnly = allSessions.filter(x => x.name.indexOf(SESSION_AUTOSAVE_PREFIX)===0);
        const oldestFirst = autosavesOnly.sort((a,b) => {return a.createDateJS - b.createDateJS;});

        /* check that the most recent session is older than the delay
        If there are multiple windows open this might happen */
        if(oldestFirst.length > 0){
            const oldest = oldestFirst[oldestFirst.length-1];
            const delay = now - oldest.createDateJS;
            if(delay < SESSION_AUTOSAVE_DELAY){
                return;
            }
        }

        /* delete older sessions */
        let numberOfSessions = oldestFirst.length + 1; /* length + 1 as we are about to add a new one */
        let oldestIndex = 0;
        while(numberOfSessions > SESSION_AUTOSAVE_MAX_OLD_SESSIONS){
            vivaldi.sessionsPrivate.delete(oldestFirst[oldestIndex].name,() => {});
            oldestIndex++;
            numberOfSessions--;
        }

        /* create the new session */
        const name = SESSION_AUTOSAVE_PREFIX + now.toISOString().replace(":",".").replace(":",".");
        const options = {
            saveOnlyWindowId: 0
        };
        vivaldi.sessionsPrivate.saveOpenTabs(name, options, () => {});
    });
}

/**
 * Init the mod, but only if we are not incognito, to maintain privacy.
 */
chrome.windows.getCurrent(window => {
    if(!window.incognito){
        setInterval(autoSaveSession, SESSION_AUTOSAVE_DELAY);
    }
});

})();
