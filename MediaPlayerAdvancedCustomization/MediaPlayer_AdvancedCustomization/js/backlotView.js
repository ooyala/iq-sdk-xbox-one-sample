/**
 * Created by apesant on 24/02/16.
 */
(function () {
    "use strict";

    WinJS.UI.Pages.define("/html/backlotView.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            WinJS.UI.processAll(element)
               .then(function after() {
                   document.getElementById("loading").style.display = "none";
                   var listView = document.getElementById("listView").winControl;
                   listView.currentItem = { index: 0, hasFocus: true, showFocus: true };
                   var list = listView.itemDataSource
                   listView.addEventListener("iteminvoked",function (e) {
                       console.log("Element selected !", e.detail.itemIndex);
                       list.itemFromIndex(e.detail.itemIndex).done(function(itemSelected) {
                           console.log("Element selected  is ", itemSelected);
                           var asset = itemSelected.data;
                           if (item.asset_type === "remote_asset"){
                               //Play directly a stream

                           } else {
                               //Get the streams from Backlot
                           }
                           
                           WinJS.Navigation.navigate("/html/player.html", itemSelected.data);
                       });

                   });
               });
        }
             
    });
})();
