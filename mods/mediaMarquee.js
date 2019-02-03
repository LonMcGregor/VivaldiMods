/**
 * Media Marquee (a mod for Vivaldi)
 * @author lonm.vivaldi.net
 * Use a marquee in tab titles for tabs playing media
 * FR https://forum.vivaldi.net/topic/34189/marquee-scroll-for-tabs-playing-media
 */

(function mediaMarquee() {
    "use strict";

   /**
    * Update the title in the marquee of a tab
    * @param {int} tabId
    * @param {chrome.tabs.changeInfo} changeInfo
    * @param {chrome.tabs.Tab} tabInfo
    */
   function tabTitleChanged(tabId, changeInfo, tabInfo){
      if(changeInfo.title || changeInfo.audible || changeInfo.mutedInfo){
         const marquee = document.querySelector("#lonm-mediaMarquee-"+tabId);
         if(marquee){
            console.log("Updated tab " + tabId + "title: "+ tabInfo.title);
            marquee.innerText = tabInfo.title;
            marquee.start();
         } else {
            createMarquee(tabInfo);
         }
      }
   }

   /**
    * Create a marquee and add it to a tab
    * @param {chrome.tabs.Tab} tabInfo
    */
   function createMarquee(tabInfo){
      const tab = document.querySelector("#tab-"+tabInfo.id);
      const marquee = document.createElement("marquee");
      marquee.innerText = tabInfo.title;
      marquee.id = "lonm-mediaMarquee-"+tabInfo.id;
      marquee.className = "lonm-mediaMarquee";
      marquee.setAttribute("scrollamount", "4");
      marquee.setAttribute("loop", "-1");
      tab.querySelector(".tab-header").appendChild(marquee);
      console.log("Created tab" + tabInfo.id + "marquee: "+ tabInfo.title);
      marquee.start();
   }

   chrome.tabs.onUpdated.addListener(tabTitleChanged);
})()
