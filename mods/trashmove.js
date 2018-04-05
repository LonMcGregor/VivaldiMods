 
/* apply same attribute changes to trash */
var newtabObserver = new MutationObserver(
    function(mutations, observer){
        mutations.forEach(updateTrash);
    }
);

function updateTrash(){
    /* get newtab left style & top style*/
    /* apply to trash icon */
    var trash = document.querySelector(".tab-strip button.toggle-trash");
    var newtab = document.querySelector(".tab-strip button.newtab");
    if(trash && newtab){
        var leftAttrib = newtab.style.left;
        var leftAttribValue = Number(leftAttrib.substring(0, leftAttrib.length - 2));
        trash.style.left = leftAttribValue + 30 + "px";
        trash.style.top = newtab.style.top;
        trash.style.position = "relative";
    }
}
 
/*move button beside plus with generic mover*/
setTimeout(function wait() {
    var Elements_To_Move = [
        /*["original_element", "desired_location", "child"],*/
        /*["original_element", "desired_location", "before"],*/
        /*["original_element", "desired_location", "after"],*/
        [".sync-and-trash-container button.toggle-trash", ".tab-strip button.newtab", "after"]
    ]
    /* check the final element in the vivaldi dom is loaded */
    var everything_loaded = document.querySelector("#vivaldi-tooltip");
    if(everything_loaded){
        Elements_To_Move.forEach(function(mover, index){
           if(mover.length == 3){
               /* load this move */
               var item_to_move = document.querySelector(mover[0]);
               var place_to_move_to = document.querySelector(mover[1]);
               var move_method = mover[2];
               
               /* check move possible */
               if(item_to_move && place_to_move_to){
                   /* do appropriate move */
                   if(move_method === "child"){
                       place_to_move_to.appendChild(item_to_move);
                   } else if(move_method === "before"){
                       place_to_move_to.parentNode.insertBefore(item_to_move, place_to_move_to);
                   } else if (move_method === "after") {
                       if(place_to_move_to.nextSibling){
                           place_to_move_to.parentNode.insertBefore(item_to_move, place_to_move_to.nextSibling);
                       } else {
                           place_to_move_to.parentNode.appendChild(item_to_move);
                       }
                   }
               }
           } 
        });
	} else {
        /* wait for vivaldi to fully load */
		setTimeout(wait, 300);
	}
}, 300);
 
/* observe for attribute changes to plus */
setTimeout(function engageObserver(){
    var newtab = document.querySelector(".tab-strip button.newtab");
    if (newtab != null) {
        var config = { attributes: true };
        newtabObserver.observe(newtab, config);
        updateTrash();
    } else {
        setTimeout(engageObserver, 300);
    }
}, 300)