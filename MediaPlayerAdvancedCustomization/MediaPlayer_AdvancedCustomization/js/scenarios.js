//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("../scenarios.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var btn1 = document.getElementById("button1");

            btn1.focus();

            btn1.winControl.addEventListener("invoked", function () {
                WinJS.Navigation.navigate("/html/scenario1.html");
            });

            document.getElementById("button2").winControl.addEventListener("invoked", function () {
                WinJS.Navigation.navigate("/html/scenario2.html");
            });

            document.getElementById("button3").winControl.addEventListener("invoked", function () {
                WinJS.Navigation.navigate("/html/scenario3.html");
            });

            document.getElementById("button4").winControl.addEventListener("invoked", function () {
                WinJS.Navigation.navigate("/html/scenario4.html");
            });
        }
    });
})();
