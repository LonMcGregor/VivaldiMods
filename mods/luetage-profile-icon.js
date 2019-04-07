/**
 * Profile Image
 * By luetage
 * Topic: https://forum.vivaldi.net/post/275306
 */

(function luetageProfileIcon() {

    function profileImage() {
        const image = document.querySelector('.profile-popup button');
        if (image) {
            image.innerHTML = '<svg style="height: 18px; width: 18px" width="18" height="18" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1523 1339q-22-155-87.5-257.5t-184.5-118.5q-67 74-159.5 115.5t-195.5 41.5-195.5-41.5-159.5-115.5q-119 16-184.5 118.5t-87.5 257.5q106 150 271 237.5t356 87.5 356-87.5 271-237.5zm-243-699q0-159-112.5-271.5t-271.5-112.5-271.5 112.5-112.5 271.5 112.5 271.5 271.5 112.5 271.5-112.5 112.5-271.5zm512 256q0 182-71 347.5t-190.5 286-285.5 191.5-349 71q-182 0-348-71t-286-191-191-286-71-348 71-348 191-286 286-191 348-71 348 71 286 191 191 286 71 348z"></path></svg>';
        }
    }

    setTimeout(function wait() {
        const browser = document.getElementById('browser');
        if (browser) {
            profileImage();
        }
        else {
            setTimeout(wait, 300);
        }
    }, 300);

})();
