setInterval(function () {
    // Test if panels have been loaded in yet
    var panelSwitch = document.querySelector("#switch");
	if (panelSwitch != null) {
        // Check all panel buttons
        var buttons = document.getElementById("switch").children;
		for(var i = 0; i < buttons.length; i++) {
            // If they are a user added web view
            if (buttons[i].className.indexOf("webviewbtn") >= 0){
                var icon = buttons[i].children[0];
                // If they have the wrong protocol
                if (icon.src.substring(0, 24) === "http://chrome-extension/"){
                    // Replace with correct protocol
                    icon.src = "chrome-extension://" + icon.src.substring(24);
                }
            }
        }
    }
    // Repeat on sparse interval as I dont know what exactly causes the bug
}, 10000);