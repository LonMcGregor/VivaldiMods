(function nicerBiscuit(){

    "use strict";

    function doBiscuit(){
        const biscuit = document.querySelector(".biscuit-string");
        const biscuitContainer = document.querySelector(".biscuit-setting-version");
        const biscuitLogo = document.querySelector(".application-icon-biscuit");
        document.querySelector(".toolbar-mainbar").insertBefore(biscuitContainer, document.querySelector(".toolbar-extensions"));
        biscuitContainer.style.paddingRight = "0";
        biscuit.size = "13";
        biscuitLogo.addEventListener("click", () => {
            document.querySelector(".biscuit-string").select();
            document.execCommand("copy");
        });
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
