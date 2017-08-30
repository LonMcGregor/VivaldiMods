// Observe for new tabs being made
var tabstripChangeObserver = new MutationObserver(
    function(mutations, observer){
        mutations.forEach(function(mutation){
            if(mutation.type === "childList" && mutation.addedNodes.length > 0){
                mutation.addedNodes.forEach(prepareNewTab);
            }
        });
    }
);
// Start when the tabstrip is initialized
setTimeout(function engageObserver(){
    var tabstrip = document.querySelector("#tabs-container .tab-strip");
    if (tabstrip != null) {
        var config = {childList: true};
        tabstripChangeObserver.observe(tabstrip, config);
        prepareAlreadyExistingTabs(tabstrip);
    } else {
        setTimeout(engageObserver, 500);
    }
}, 500)

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
    var faviconSpan = tab.children[0].children[1];
    setupTabDataChangeObserver(tab);
    faviconChanged(faviconSpan);
    updateTabAccent(tab);
}

// Observe tab for changes to either favicon or active state
var tabDataChangeObserver = new MutationObserver(
    function(mutations, observer){
        mutations.forEach(function(mutation){
            if(mutation.attributeName === "class" && mutation.target.className.indexOf("tab") >= 0){
                updateTabAccent(mutation.target);
            }
            if(mutation.attributeName === "style" && mutation.target.className.indexOf("favicon") >= 0){
                faviconChanged(mutation.target);
                updateTabAccent(mutation.target.parentElement.parentElement)
            }
        });
    }
)
var classAttribObsrverConfig = {attributes:true, attributeList: ["class"]}
var styleAttribObsrverConfig = {attributes:true, attributeList: ["style"]}
function setupTabDataChangeObserver(tab){
    var faviconSpan = tab.children[0].children[1];
    tabDataChangeObserver.observe(tab, classAttribObsrverConfig);
    tabDataChangeObserver.observe(faviconSpan, styleAttribObsrverConfig);
}

// favicon changed - update stored colours
function faviconChanged(faviconSpan){
    var tab = faviconSpan.parentElement.parentElement;
    var favicon = faviconSpan.style.backgroundImage;
    if(favicon===""){
        tab.dataset.hslCss = "";
        return;
    }
    //favicon = "url('data:image/png;base64,iVBO...ggg==')"
    favicon = favicon.substring(5);
    favicon = favicon.substring(0, favicon.length - 2);
    //favicon = "data:image/png;base64,iVBO...ggg=="
    var rgb = getAverageRGB(favicon);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var correctedHsl = saturateHsl(hsl);
    tab.dataset.hslCss = hslToCss(correctedHsl);
}

// Set colour based on data values
// vivaldi already sets if active so dont interfere
function updateTabAccent(tab){
    tab.style.background = tab.className.indexOf("active") == -1 ? tab.dataset.hslCss : "";
}

// Convert rgb to hsl
// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#9493060
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

// Attempt to emulate vivladi colours by upping saturation
function saturateHsl(hsl){
    hsl[1] = 0.8;
    return hsl;
}

//convert hsl triple into css format
function hslToCss(hsl){
    var hslCss = "hsl(" + hsl[0] * 360 + "," + hsl[1] * 100 + "%," + hsl[2] * 100 + "%)";
    return "linear-gradient(" + hslCss + ", hsl(0,0%,0%))";
}


// https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript#2541680
// https://stackoverflow.com/questions/8473205/convert-and-insert-base64-data-to-canvas-in-javascript#8489120
// Figure out the average colour of the icon
function getAverageRGB(faviconData) {
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
    img.src = faviconData;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

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

    return rgb;
}
