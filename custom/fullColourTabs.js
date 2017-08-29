// Observe for tab switches to an internal page
var webstackChangeObserver = new MutationObserver(
    function(mutations, observer){
        mutations.forEach(function(mutation){
            if(mutation.type === "childList" && mutation.addedNodes.length > 0){
                mutation.addedNodes.forEach(prepareNewTab);
            }
        });
    }
);

// Add listeners to all tabs already in window
function prepareAlreadyExistingTabs(tabstrip){
    for(var i = 0; i < tabstrip.children.length; i++){
        if(tabstrip.children[i].tagName.toUpperCase() === "SPAN"){
            prepareNewTab(tabstrip.children[i]);
        }
    }
}

// Get the actual tab node and set up observer for changes
function prepareNewTab(tabSpan){
    var tab = tabSpan.children[0].children[0];
    setupTabDataChangeObserver(tab);
    tabStateChanged(tab);
}

// Observe tab for changes to either favicon or active state
var tabDataChangeObserver = new MutationObserver(
    function(mutations, observer){
        mutations.forEach(function(mutation){
            if(mutation.type === "attributes"){
                // We only care if the tab active state changed or the favicon changed
                if(mutation.attributeName === "class" && mutation.target.className.indexOf("tab") >= 0){
                    tabStateChanged(mutation.target);
                    return;
                } else if(mutation.attributeName === "style" && mutation.target.className.indexOf("favicon") >= 0){
                    faviconChanged(mutation.target);
                }
            }
        });
    }
)
var tabDataChangeObserverConfig = {subtree:true, attributes:true}
function setupTabDataChangeObserver(tab){
    tabDataChangeObserver.observe(tab, tabDataChangeObserverConfig);
}

// Tab active state changed
function tabStateChanged(tab){
    var tabHeader = tab.children[0];
    var favicon = "";
    for (var i = 0; i < tabHeader.children.length; i++){
        if(tabHeader.children[i].className.indexOf("favicon") >= 0){
            favicon = tabHeader.children[i].style.backgroundImage;
            break;
        }
    }
    determineTabAccent(tab, favicon);
}

// favicon changed
function faviconChanged(faviconSpan){
    var tab = faviconSpan.parentElement.parentElement;
    determineTabAccent(tab, faviconSpan.style.backgroundImage);
}

// Check favicon and update colour
function determineTabAccent(tab, favicon){
    if(tab.className.indexOf("active") >= 0){
        // vivaldi already sets if active so dont interfere
        tab.style.backgroundColor = "";
        return;
    }
    if(favicon===""){
        return;
    }
    //favicon = "url('data:image/png;base64,iVBO...ggg==')"
    favicon = favicon.substring(5);
    favicon = favicon.substring(0, favicon.length - 2);
    //favicon = "data:image/png;base64,iVBO...ggg=="
    getAverageRGB(tab, favicon, updateTabAccent);
}

// Set colour in callback
function updateTabAccent(tab, rgbAccent){
    tab.style.backgroundColor = rgbToCss(rgbAccent);
}

//convert rgb triple into css format
function rgbToCss(rgb){
    return "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
}

// https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript#2541680
// https://stackoverflow.com/questions/8473205/convert-and-insert-base64-data-to-canvas-in-javascript#8489120
// Figure out the average colour of the icon
function getAverageRGB(tab, faviconData, callback) {
    var canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;
    
    canvas.width = 18;
    canvas.height = 18;
    var img = new Image();
    img.onload = function() {
        context.drawImage(this, 0, 0, canvas.width, canvas.height);
    
        data = context.getImageData(0, 0, canvas.width, canvas.height);
        length = data.data.length;

        while ( (i += 4) < length ) {
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i+1];
            rgb.b += data.data[i+2];
        }

        // ~~ used to floor values
        rgb.r = ~~(rgb.r/count);
        rgb.g = ~~(rgb.g/count);
        rgb.b = ~~(rgb.b/count);

        callback(tab, rgb);
    }
    img.src = faviconData;
}


// Register the observer once the browser is fully loaded
setTimeout(function engageObserver(){
    var tabstrip = document.querySelector("#tabs-container .tab-strip");
    if (tabstrip != null) {
        var config = {childList: true};
        webstackChangeObserver.observe(tabstrip, config);
        prepareAlreadyExistingTabs(tabstrip);
    } else {
        setTimeout(engageObserver, 500);
    }
}, 500)
