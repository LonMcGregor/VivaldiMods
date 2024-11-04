// Observe for tab switches to an internal page
var webstackChangeObserver = new MutationObserver(
    function(mutations, observer){
        mutations.forEach(function(mutation){
            if(mutation.attributeName === "class"
               && mutation.target.className.indexOf("active") >= 0
               && mutation.target.className.indexOf("internal") >= 0){
                try{
                    addNewPaneButton();
                } catch (error) {
                    // Probably caused by user switching to another
                    // tab before operation could be completed
                    console.log(error);
                }
            }
        });
    }
);

// Register the observer once the browser is fully loaded
setTimeout(function engageObserver(){
    var webstack = document.querySelector("#webpage-stack");
    if (webstack != null) {
        var config = { attributes: true, subtree: true};
        webstackChangeObserver.observe(webstack, config);
    } else {
        setTimeout(engageObserver, 500);
    }
}, 500)

// Add the new button to the start page nav bar
function addNewPaneButton(){
    var newButton = document.createElement("button");
    newButton.title = "New Pane";
    newButton.tabindex = "0";
    newButton.className = "button-startpage";
    newButton.innerHTML = "New Pane";
    newButton.id = "newPaneButton";
    var navbar = document.querySelector("nav.startpage-navigation > div:nth-child(2)");
    navbar.appendChild(newButton);
    newButton.addEventListener("click", newPaneButtonClick);
    registerSwitchbackObserver();
}

// The button was clicked, act accordingly, but only
// if it is not already active
function newPaneButtonClick(e){
    console.log(e);
    if (e.target.className.indexOf("active") == -1) {
        activate(e);
    }
}

// Observe if the current pane is switched, so that
// the current one may be correctly (de-)activated
function registerSwitchbackObserver(){
    var switchbackObserver = new MutationObserver(
        function(mutations, observer){
            mutations.forEach(function(mutation){
                if(mutation.attributeName === "class"
                   && mutation.target.className.indexOf("active") >= 0
                   && mutation.target.className.indexOf("internal") >= 0){
                    try{
                        addNewPaneButton();
                    } catch (error) {
                        // Probably caused by user switching to another
                        // tab before operation could be completed
                        console.log(error);
                    }
                }
            });
        }
    );
    var target = document.querySelector("nav.startpage-navigation");
    var config = { attributes: true, subtree: true};
    switchbackObserver.observe(target, config);
}

// Activate the pane
function activate(e){
    //Make the button Active
    var otherActive = document.querySelector(".active.button-startpage");
    otherActive.className = otherActive.className.replace("active", "");
    e.target.className = "active button-startpage";
    
    // Replace the contents with the new manager - note this is borked
    var container = document.querySelector(".startpage-content > .sdwrapper");
    container.innerHTML = "<div class='newpane manager'>New Pane</div>";
}

// Deactivate the pane and restore what was there before
function deactivate(){
    
}