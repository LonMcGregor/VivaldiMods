(function tabRoundMod(){
    "use strict";
    var CLIP_PATH_D = 'M 0,31 C 12.284275,31 17.311144,22.728149 18.160676,14.235439 19.010208,5.7427293 24.864826,0 34,0 v 31 z';

    setTimeout(function makeSvg(){
        var footer = document.querySelector("#footer");
        if (footer != null) {
            var span = document.createElement('span');
            span.innerHTML = '<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><defs><clipPath id="tab_rounder_clip"><path d="'+CLIP_PATH_D+'"></path></clipPath></defs></svg>';
            footer.appendChild(span);
        } else {
            setTimeout(makeSvg, 500);
        }
    }, 500)
    
})();