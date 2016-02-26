//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;
    var backlotRequester = BacklotRequesterFactory.make();

    var apiKey = "c5bGQyOuJ6V_8wRSO4lN8xzQPNEC.G2-J2";
    var secret = "DEW2_5TO2Y1lMrxUfES3ZZlpS51Amy_NuUMaIee6";
    WinJS.Namespace.define("BACKLOT_ACCOUNT", { apiKey: apiKey, secret: secret, pcode : "c5bGQyOuJ6V_8wRSO4lN8xzQPNEC" });
    

    var objectList = [];
    //WinJS.Namespace.define("Sample.ListView", {
    //    data: new WinJS.Binding.List(objectList)
    //});

    function activated(eventObject) {
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            // Use setPromise to indicate to the system that the splash screen must not be torn down
            // until after processAll and navigate complete asynchronously.
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                backlotRequester.getAssetList(apiKey, secret, function (assetList) {
                    console.log(assetList);

                    for (var i = 0, n = assetList.items.length; i < n; i++) {
                        var item = assetList.items[i];
                        var durationSeconds = item.duration/1000;
                        var minutes = Math.floor(durationSeconds/60);
                        item["durationSeconds"] = minutes.toString() +"m"+ (Math.floor(durationSeconds - minutes * 60)).toString() + "s";
                        objectList.push(item);
                    }
                    var list = new WinJS.Binding.List(objectList);

                    var groupedList = list.createGrouped(function(item){
                        return item.asset_type;
                    }, function(item){
                        if(item.asset_type === "video"){
                            return { asset_type : "Backlot Assets"};
                        } else {
                            return { asset_type : "Remote Assets"};
                        }

                    }, function (left, right){
                        return left.charCodeAt(0) - right.charCodeAt(0);
                    });
                    WinJS.Namespace.define("Sample.ListView", {
                        data: groupedList
                    });
                    return WinJS.Navigation.navigate("/html/backlotView.html");
                });

                
            }));
        }
    }


    WinJS.Application.addEventListener("activated", activated, false);
    WinJS.Application.start();
})();
