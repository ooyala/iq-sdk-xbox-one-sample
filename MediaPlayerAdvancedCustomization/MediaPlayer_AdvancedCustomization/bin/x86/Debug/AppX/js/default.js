//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var sampleTitle = "Creating a custom media element adapter";

    var scenarios = [
        { url: "/html/scenario1.html", title: "Adding a custom button." },
        { url: "/html/scenario2.html", title: "Creating a custom media element adapter." },
        { url: "/html/scenario3.html", title: "Hiding and disabling buttons." },
        { url: "/html/scenario4.html", title: "Showing post-roll overlay." }
    ];

    function activated(eventObject) {
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            // Use setPromise to indicate to the system that the splash screen must not be torn down
            // until after processAll and navigate complete asynchronously.
            eventObject.setPromise(WinJS.UI.processAll().then(function () {
                return WinJS.Navigation.navigate("/scenarios.html");
            }));
        }
    }

    WinJS.Namespace.define("SdkSample", {
        sampleTitle: sampleTitle,
        scenarios: scenarios
    });

    WinJS.Application.addEventListener("activated", activated, false);
    WinJS.Application.start();
})();
