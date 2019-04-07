(function nicerBiscuit(){

    "use strict";

    function doBiscuit(){
        document.querySelector(".toolbar-mainbar").insertBefore(document.querySelector(".biscuit-setting-version"), document.querySelector(".toolbar-extensions"));
        document.querySelector(".biscuit-setting-version").style.paddingRight = "0";
        document.querySelector(".biscuit-string").size = "20";
        document.querySelector(".biscuit-string").style = "-webkit-mask-image: -webkit-linear-gradient(180deg, transparent 0, #fff 12px);-webkit-mask-position: top right";
    }

    setTimeout(function wait() {
        const browser = document.getElementById("browser");
        if (browser) {
            doBiscuit();
        }
        else {
            setTimeout(wait, 300);
        }
    }, 300);
})();
