
/* listen for a stack interaction (dblclick? hover?) */

/* show menu */
/* generate some emoji */
/* HOW to auto-activate the emoji picker? */

/* assign stack name */
/* HOW DO THIS? */

/* shortcut to look for unnamed stacks */
/* look for common domains */

/* if stack 'named' with emoji,
switch out the favicons for that stack with emoji, but keep the titles*/

/**
 * Render an emoji as a png image
 * @param {string} e emoji character/sequence to render, can include ZJW
 * @returns {string} base64 png image
 */
function emojiToPng(e){
    const c = document.createElement("canvas");
    c.height = 16;
    c.width = 16;
    const x = c.getContext("2d");
    x.font = "16px Segoe UI Emoji";
    x.fillText(e,0,16);
    const icon = c.toDataURL();
    chrome.tabs.create({url: icon});
    return icon;
}
