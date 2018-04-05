setTimeout(function wait() {
    var zoom_controls = document.querySelector("#footer > div.status-toolbar > div.zoom-control");
    if (zoom_controls != null) {
        var ext_wrap = document.querySelector('#main > div.toolbar-addressbar > span.extensions-wrapper');
        ext_wrap.appendChild(zoom_controls);
    }
    else {
        setTimeout(wait, 300);
    }
}, 300);