/*
* Domains Highlighted (a mod for Vivaldi)
* Written by LonM
* No Copyright Reserved
*/

(function(){

function domainsHighlighted(addressBarElement){
    "use strict";

    /* Get rid of mod when text box has focus */
    function addressBarFocused(event){
        clearMask();
    }

    /* Add the mask in again when no longer focused */
    function addressBarUnFocused(event){
        textChanged(event.target);
    }

    /* remove the mask */
    function clearMask(){
        applyMask("");
    }

    /* If text box doesn't have focus and the input changes, activate or update the mod */
    function textChanged(target){
        if(target === document.activeElement){
            return clearMask();
        }
        const newText = target.value;
        const positionData = getDomainTextPositions(newText);
        if(!positionData){
            return clearMask();
        }
        const mask = createWebkitMask(positionData[0], positionData[1]);
        applyMask(mask);
    }

    /* Find the position of the base domaina and TLD in the url
    return [start position in pixels, end position in pixels] */
    function getDomainTextPositions(text){

        /* voiski ip checkers */
        const ipv6 = /https?:\/\/((([a-fA-F0-9]{1,4}|):){1,7}([a-fA-F0-9]{1,4}|:))/g;
        const ipv4 = /https?:\/\/(((25[0-5]|2[0-4]\d|[01]?\d{1,2}|\*)\.){3}(25[0-5]|2[0-4]\d|[01]?\d{1,2}|\*))/g;

        /* generic catch-all for domains */
        const domain = /https?:\/\/([\w\.:\-]*)\/?/g;

        if(!text || text === ""){
            return;
        }

        let ipv4match = ipv4.exec(text);
        let ipv6match = ipv6.exec(text);
        let domainMatch = domain.exec(text);

        let full, important = "";

        if(ipv4match && ipv4match.length > 0){
            important = ipv4match[1];
            full = ipv4match[0];
        } else if(ipv6match && ipv6match.length > 0){
            important = ipv6match[1];
            full = ipv6match[0];
        } else if(domainMatch && domainMatch.length > 0){
            important = domainMatch[1];
            full = domainMatch[0];
        } else {
            return;
        }

        const styleOffsetStart = 0;
        const styleOffsetEnd = 6;
        const fullWidth = checkTextWidth(full);
        const importantWidth = checkTextWidth(important);
        const start = fullWidth - importantWidth + styleOffsetStart;
        const end = fullWidth + styleOffsetEnd;

        return [start, end];
    }

    /* Make a special element to check the expected width of text */
    function checkTextWidth(text){
        const dummyElement = document.createElement("div");
        dummyElement.style = "font-family: 'Segoe UI'; font-size: 13px; font-weight: 400; opacity: 0;";
        dummyElement.innerText = text;
        const dummyParent = document.getElementById("status_info");
        dummyParent.appendChild(dummyElement);
        const textWidth = dummyElement.getBoundingClientRect().width;
        dummyParent.removeChild(dummyElement);
        return textWidth;
    }

    /* Make the mask given which area to highlight */
    function createWebkitMask(darkStart, darkEnd){
        return `-webkit-mask-image: -webkit-linear-gradient(
            0deg,
            rgba(0,0,0,0.5) `+darkStart+`px,
            black `+darkStart+`px,
            black `+darkEnd+`px,
            rgba(0,0,0,0.5) `+darkEnd+`px
        );`;
    }

    /* activate or update the mask style */
    function applyMask(maskText){
        addressBarElement.style = maskText;
    }

    const addressBarTextChanged = new MutationObserver(mutationRecords => {
        if(mutationRecords[0].attributeName === "value"){
            textChanged(mutationRecords[0].target);
        }
    });

    /* Add Event Listeners */
    addressBarElement.addEventListener("focus", addressBarFocused);
    addressBarElement.addEventListener("blur", addressBarUnFocused);
    addressBarTextChanged.observe(addressBarElement, {attributes: true});

    textChanged({target:addressBarElement});
}

setTimeout(function wait(){
    "use strict";
    const addressBarElement = document.querySelector("input.url.vivaldi-addressfield");
    const vivaldiTooltip = document.getElementById("vivaldi-tooltip");
    if(addressBarElement && vivaldiTooltip){
        domainsHighlighted(addressBarElement);
    } else {
        setTimeout(wait, 500);
    }
}, 500);

}());
