//Open settings page to feeds and run this in console:

let opml = `<?xml version="1.0" encoding="utf-8"?>
<opml version="1.0">

	<head>
		<title>Vivaldi feeds</title>
	</head>

	<body>`;
const feedlist = document.querySelector("div.settings-content > section > div > div.setting-group.unlimited > div > div > div.master.master-layout-double > div.master-items");
Array.from(feedlist.children).forEach(feedButton => {
opml += `		<outline type="rss" text="${feedButton.querySelector(".item-title").innerText}" title="${feedButton.querySelector(".item-title").innerText}" xmlUrl="${feedButton.querySelector(".item-meta").innerText}"/>` + "\n";
});

opml+=`	</body>
</opml>`;
