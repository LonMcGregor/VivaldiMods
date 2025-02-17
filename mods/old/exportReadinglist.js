vivaldi.readingListPrivate.getAll(items => {
    let FORM = "HTML";
    //FORM = "CSV";
    let listitems,head,tail;
    if(FORM==="HTML"){
        listitems = items.map(item => "<a class='" + (item.read ? "read" : "unread") + "' href='" + item.url + "' data-time='"+item.lastUpdate+"'>"+item.title+"</a><br>");
        head = `<!doctype HTML><html><head><title>Exported Reading List</title></head><body>`;
        tail = `</body></html>`;
        filename = `exported_readinglist.html`;
    } else {
        // wrap the title in quotes if it has a comma, so that CSV works
        listitems = items.map(item => [item.url,item.title.indexOf(",")>=0 ? '"'+item.title+'"' : item.title,item.read,item.lastUpdate].join(","));
        head = `url,title,read,update`;
        tail = ``;
        filename = `exported_readinglist.csv`;
    }
    const textfile = new File([[head,listitems.join("\n"),tail].join("\n")], filename, {type: "text/plain"});
    const dl = document.createElement("a");
    dl.download = filename;
    dl.setAttribute("href", window.URL.createObjectURL(textfile));
    dl.click();
});
