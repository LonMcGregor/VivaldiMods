// Observe for changes to status info
var statusInfoChangeObserver = new MutationObserver(
    function(mutations, observer){
        mutations.forEach(function(mutation){
            handleMutation(mutation.target);
        });
    }
);

// Start when the status info is initialized
setTimeout(function engageObserver(){
    var status_info = document.querySelector("#status_info");
    if (status_info != null) {
        var config = {attributes:true, attributeFilter:["class"]};
        statusInfoChangeObserver.observe(status_info, config);
    } else {
        setTimeout(engageObserver, 500);
    }
}, 500)

function handleMutation(mutationTarget){
    var uriRegExp = new RegExp('((http)|(file)|(chrome)).*');
    if(mutationTarget.className.indexOf("visible") >= 0 &&
       uriRegExp.test(mutationTarget.innerText)){
        addMod(mutationTarget);
    } else {
        removeMod(mutationTarget);
    }
}

function removeMod(mutationTarget){
    
}

function addMod(mutationTarget){
    mutationTarget.style.position = "fixed";
    mutationTarget.style.zIndex = "5";
    mutationTarget.style.background = "#fff";
    mutationTarget.style.border = "1px solid #d8d8d8";
    mutationTarget.style.padding = "3px";
    mutationTarget.style.color = "#000";
    mutationTarget.style.width = "300px";
    mutationTarget.style.height = "26px";
    
    //var mousepos = 
    //there isn't a way to do this without event listen beforehand
    // boooooooooo
}