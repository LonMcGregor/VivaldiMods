setTimeout(function makeSvg(){
    var footer = document.querySelector("#footer");
    if (footer != null) {
        var span = document.createElement('span');
        span.innerHTML = '<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><defs><clipPath id="tab_rounder_clip"><path d="m6,20c8,0 14,-12 14,-20l0,20l-14,0z"></path></clipPath></defs></svg>';
        footer.appendChild(span);
    } else {
        setTimeout(makeSvg, 500);
    }
}, 500)