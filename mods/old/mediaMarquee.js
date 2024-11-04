/**
 * Media Marquee (a mod for Vivaldi)
 * @author lonm.vivaldi.net
 * Use a marquee in tab titles for tabs playing media
 * FR https://forum.vivaldi.net/topic/34189/marquee-scroll-for-tabs-playing-media
 */

(function mediaMarquee() {
   "use strict";

   /**
    * Change the marquee speed
    *    Lower is faster
    *    Default: 1
    */
   const MARQUEE_SPEED = 0.75;

   /**
    * Update the title in the marquee of a tab
    * Need to check type of audible, as if it is false,
    *    if() will be false, but we still want to update
    * @param {int} tabId
    * @param {chrome.tabs.changeInfo} changeInfo
    * @param {chrome.tabs.Tab} tabInfo
    */
   function tabTitleChanged(tabId, changeInfo, tabInfo){
      if(changeInfo.title || typeof(changeInfo.audible)===typeof(true) || changeInfo.mutedInfo){
         const marquee = document.querySelector("#lonm-mediaMarquee-"+tabId);
         if(marquee){
            setMarqueeContent(tabInfo);
         } else if(tabInfo.audible) {
            createMarquee(tabInfo);
         }
      }
   }

   /**
    * Update the style and text of a marquee for a specific tab
    *    ASSUME that the marquee for a tab has already been added
    * @param {chrome.tabs.Tab} tabInfo
    */
   function setMarqueeContent(tabInfo){
      const marquee = document.querySelector("#lonm-mediaMarquee-"+tabInfo.id);
      const speed = (tabInfo.title.length * MARQUEE_SPEED) + "s";
      marquee.innerText = tabInfo.title;
      marquee.style.animationDuration = speed;
      console.log("Updated tab " + tabInfo.id + " title: "+ tabInfo.title + " at speed " + speed);
   }

   /**
    * Create a marquee and add it to a tab
    * @param {chrome.tabs.Tab} tabInfo
    */
   function createMarquee(tabInfo){
      const tab = document.querySelector("#tab-"+tabInfo.id);
      const marqueeOuter = document.createElement("span");
      marqueeOuter.className = "lonm-mediaMarqueeOuter";
      const marquee = document.createElement("span");
      marquee.id = "lonm-mediaMarquee-"+tabInfo.id;
      marquee.className = "lonm-mediaMarqueeInner";
      marqueeOuter.appendChild(marquee);
      tab.querySelector(".tab-header").appendChild(marqueeOuter);
      console.log("Created tab" + tabInfo.id + "marquee: "+ tabInfo.title);
      setMarqueeContent(tabInfo);
   }

   chrome.tabs.onUpdated.addListener(tabTitleChanged);
})()
