/**
 * Combined Sync icons (a mod for Vivaldi)
 * by LonM, No copyright reserved
 *
 * Marked portions copyright Vivaldi Technologies AS
 * Used without permission, sorry 😢
 */
(function combinedSync(){

    /**
     * BEGIN VIVALDI CODE
     */

    /** Black cloud */
    const ICON_NORM = `<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12C19 12.0568 18.9988 12.1133 18.9965 12.1695C20.1635 12.5803 21 13.6925 21 15C21 16.6569 19.6569 18 18 18H8C6.34315 18 5 16.6569 5 15C5 13.6462 5.89669 12.5019 7.12853 12.1285C7.50189 10.8967 8.64623 10 10 10C10.4917 10 10.9557 10.1183 11.3652 10.3279C11.9984 8.9538 13.3878 8 15 8C17.2091 8 19 9.79086 19 12Z"></path>
    </svg>`;
    /** White cloud */
    const ICON_OPEN = `<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M15.2222 7C13.3064 7 11.6041 8.03226 10.7673 9.58975C10.4836 9.53088 10.1896 9.5 9.88889 9.5C8.33443 9.5 6.94973 10.3278 6.25133 11.5896C4.93963 12.2253 4 13.5297 4 15.0833C4 17.3063 5.90238 19 8.11111 19H17.8889C20.0976 19 22 17.3063 22 15.0833C22 13.7239 21.2795 12.5539 20.221 11.8576C20.2218 11.8218 20.2222 11.7859 20.2222 11.75C20.2222 9.06683 17.9219 7 15.2222 7ZM12.3078 11.0947C12.6187 9.92977 13.7733 9 15.2222 9C16.9409 9 18.2222 10.291 18.2222 11.75C18.2222 11.9148 18.2065 12.0754 18.1766 12.231L18.0233 13.0279L18.7717 13.3419C19.5266 13.6587 20 14.3421 20 15.0833C20 16.0821 19.1166 17 17.8889 17H8.11111C6.8834 17 6 16.0821 6 15.0833C6 14.3101 6.51675 13.5977 7.32859 13.3027L7.74278 13.1522L7.91117 12.745C8.20096 12.0441 8.95509 11.5 9.88889 11.5C10.2579 11.5 10.6004 11.5855 10.8973 11.7327L11.9926 12.2759L12.3078 11.0947Z"></path>
    </svg>`;
    /** White cloud with dots */
    const ICON_DOTS = `<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 15C11 15.5523 10.5523 16 10 16C9.44772 16 9 15.5523 9 15C9 14.4477 9.44772 14 10 14C10.5523 14 11 14.4477 11 15Z"></path>
    <path d="M14 15C14 15.5523 13.5523 16 13 16C12.4477 16 12 15.5523 12 15C12 14.4477 12.4477 14 13 14C13.5523 14 14 14.4477 14 15Z"></path>
    <path d="M17 15C17 15.5523 16.5523 16 16 16C15.4477 16 15 15.5523 15 15C15 14.4477 15.4477 14 16 14C16.5523 14 17 14.4477 17 15Z"></path>
    <path fill-rule="evenodd" d="M15.2222 7C13.3064 7 11.6041 8.03226 10.7673 9.58975C10.4836 9.53088 10.1896 9.5 9.88889 9.5C8.33443 9.5 6.94973 10.3278 6.25133 11.5896C4.93963 12.2253 4 13.5297 4 15.0833C4 17.3063 5.90238 19 8.11111 19H17.8889C20.0976 19 22 17.3063 22 15.0833C22 13.7239 21.2795 12.5539 20.221 11.8576C20.2218 11.8218 20.2222 11.7859 20.2222 11.75C20.2222 9.06683 17.9219 7 15.2222 7ZM12.3078 11.0947C12.6187 9.92977 13.7733 9 15.2222 9C16.9409 9 18.2222 10.291 18.2222 11.75C18.2222 11.9148 18.2065 12.0754 18.1766 12.231L18.0233 13.0279L18.7717 13.3419C19.5266 13.6587 20 14.3421 20 15.0833C20 16.0821 19.1166 17 17.8889 17H8.11111C6.8834 17 6 16.0821 6 15.0833C6 14.3101 6.51675 13.5977 7.32859 13.3027L7.74278 13.1522L7.91117 12.745C8.20096 12.0441 8.95509 11.5 9.88889 11.5C10.2579 11.5 10.6004 11.5855 10.8973 11.7327L11.9926 12.2759L12.3078 11.0947Z"></path>
    </svg>`;
    /** Black cloud with strike */
    const ICON_FAIL = `<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.2132 18H18.6296C20.491 18 22 16.4965 22 14.6418C22 13.2753 21.1809 12.0994 20.0051 11.5751C20.0504 11.3248 20.0741 11.0671 20.0741 10.8038C20.0741 10.0367 19.8733 9.3163 19.5212 8.69196L10.2132 18Z"></path>
    <path d="M18.3595 7.02522C17.5821 6.38468 16.586 6 15.5 6C13.3927 6 11.6237 7.44854 11.1344 9.40423C10.6465 9.14615 10.0903 9 9.5 9C8.01292 9 6.74245 9.92742 6.23543 11.2354C4.92742 11.7425 4 13.0129 4 14.5C4 16.395 5.50607 17.9383 7.38657 17.9982L18.3595 7.02522Z"></path>
    </svg>`;

    const s = {
        download_pending: "▽",
        download_complete: "▼",
        upload_pending: "△",
        upload_complete: "▲",
        error: "⭍"
    };

    function n(e, t) {
        return s[e] + " " + t;
    }

    function formatDownload(e) {
        switch (e) {
        case "unset":
            return n("download_pending", ("Download: Idle"));
        case "syncer_ok":
            return n("download_complete", ("Download: Success"));
        case "datatype_triggered_retry":
        case "server_more_to_download":
            return n("download_pending", ("Download: In progress..."));
        case "sync_auth_error":
            return n("error", ("Download: Sync server refused your credentials"));
        case "sync_server_error":
        case "server_response_validation_failed":
        case "server_return_transient_error":
            return n("error", ("Download: Sync server encountered an error"));
        case "network_connection_unavailable":
        case "network_io_error":
            return n("error", ("Download: Network error"));
        case "cannot_do_work":
            return n("error", ("Download: Client error"));
        case "server_return_throttled":
            return n("error", ("Download: Sync server throttled the connection"));
        default:
            return n("error", (`Download: Other error (${e})`));
        }
    }

    function formatUpload(e) {
        switch (e) {
        case "unset":
            return n("upload_pending", ("Upload: Idle"));
        case "syncer_ok":
            return n("upload_complete", ("Upload: Success"));
        case "sync_auth_error":
            return n("error", ("Upload: Sync server refused your credentials"));
        case "sync_server_error":
        case "server_response_validation_failed":
        case "server_return_transient_error":
            return n("error", ("Upload: Sync server encountered an error"));
        case "network_connection_unavailable":
        case "network_io_error":
            return n("error", ("Upload: Network error"));
        case "server_return_conflict":
            return n("error", ("Upload: Conflict with another client’s data occured."));
        case "server_return_throttled":
            return n("error", ("Upload: Sync server throttled the connection"));
        default:
            return n("error", (`Upload: Error (${e})`));
        }
    }
    /**
     * END VIVALDI CODE
     */

    let ACCOUNT_INFO = undefined;

    /**
     * The previous cycle state changed - update the icon
     * @param {vivaldi.sync.cycleData} The current state of the sync engine
     * Debug with: vivaldi.sync.getLastCycleState(console.log)
     */
    function updateSyncIcon(cycleData){
        /* get the username from account info */
        if(!ACCOUNT_INFO){
            vivaldi.vivaldiAccount.getState(stateInfo => {
                ACCOUNT_INFO = stateInfo.accountInfo;
                updateSyncIcon(cycleData);
            });
            return;
        }

        /* check if there is a sync button - if not (e.g. fullscreen), don't bother */
        const syncTitle = document.querySelector(".synced-tabs-button");
        const syncIcon = document.querySelector(".synced-tabs-button button");
        if(!syncIcon || !syncTitle){
            return;
        }

        /* update tooltip */
        const lastSyncTime = new Date(cycleData.lastSyncTime).toLocaleString();
        const upload = formatUpload(cycleData.lastCommitResult);
        const download = formatDownload(cycleData.lastDownloadUpdatesResult);
        const title = `Connected to sync as ${ACCOUNT_INFO.username}
Last sync: ${lastSyncTime}
${upload}
${download}
`;
        /* need to update both icons as sometimes one is disabled */
        syncIcon.title = title;
        syncTitle.title = title;

        /* update icon according to tooltip */
        if((title.indexOf("▼") > 0 || (title.indexOf("▽") > 0 && title.indexOf("Download: Idle") > 0)) && title.indexOf("▲") > 0){
            /* everything is fine */
            syncIcon.innerHTML = ICON_NORM;
            return;
        }
        if(title.indexOf("△") > 0 || title.indexOf("▽") > 0){
            /* sync in progress */
            syncIcon.innerHTML = ICON_DOTS;
            return;
        }
        if(title.indexOf("⭍")){
            /* sync is in a failure state*/
            syncIcon.innerHTML = ICON_FAIL;
            return;
        }
        /* anything else is an unknown */
        syncIcon.innerHTML = ICON_OPEN;
    }

    /* add listeners for mod */
    vivaldi.sync.onCycleCompleted.addListener(updateSyncIcon);

    /* add listeners for debug */
    /*vivaldi.sync.onEngineStateChanged.addListener(console.log);
    vivaldi.sync.onCycleCompleted.addListener(console.log);*/

    /* update the icon for the first time */
    function initMod(){
        if(!document.querySelector("#browser")){
            setTimeout(initMod, 500);
            return;
        }
        vivaldi.sync.getLastCycleState(updateSyncIcon);
    }

    initMod();
})();
