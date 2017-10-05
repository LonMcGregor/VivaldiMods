setTimeout(function wait() {
	var foot = document.querySelector("#footer");
	var topbar = document.querySelector("#main > div.bookmark-bar");
	var topinner = document.querySelector("#main > div.inner");
	if (foot != null && topbar != null) {
		topbar.parentNode.insertBefore(foot, topbar);
	} else if (foot != null && topinner != null) {
		topinner.parentNode.insertBefore(foot, topinner);
    }
	else {
		setTimeout(wait, 300);
	}
}, 300);