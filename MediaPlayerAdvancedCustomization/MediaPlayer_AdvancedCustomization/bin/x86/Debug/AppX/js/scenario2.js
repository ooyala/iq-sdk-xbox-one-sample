//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var mediaPlayer = null;

    // To create a custom MediaElementAdapter, you want to derive from the XboxJS.UI.Media.MediaElementAdapter base class.
    // In this example we've created a mediaElementAdapter so we can do some custom logging.
    var MyMediaElementAdapter = WinJS.Class.derive(XboxJS.UI.MediaElementAdapter,
        function constructor(mediaPlayer, mediaElement) {

            // You must call baseMediaElementAdapterConstructor to initialize
            // your adapter correctly.
            this.baseMediaElementAdapterConstructor(mediaPlayer, mediaElement);
        },
        {
            // This section overrides the seek function
            seek: function (newTime) {

                // This is where you can perform your special processing
                // In this example, we log the seek command
                WinJS.log(newTime + " seconds.", "seek", "telemetry");

                // This line ensures that the seek function still works as expected
                this.mediaElement.currentTime = newTime;
            }
        });


    var page = WinJS.UI.Pages.define("/html/scenario2.html", {
        ready: function (element, options) {
            WinJS.UI.processAll(element)
                .then(function afterProcessAll() {
                    // Get the MediaPlayer
                    var mediaPlayer = document.getElementById("scenario2-mediaplayer").winControl;

                    mediaPlayer.setContentMetadata(XboxJS.Data.ContentType.movie, { title: "Scenario 2", description: "This example shows how to create a custom MediaElementAdapter. A custom MediaElementAdapter is useful if you need to run custom business logic in between the time a user invokes a command in the UI and the command is processed by the video tag." })
                        .done(
                            function success() {
                                mediaPlayer.mediaElementAdapter.mediaElement = element.querySelector("#scenario2-video");
                                mediaPlayer.mediaElementAdapter.mediaElement.src = "http://smf.blob.core.windows.net/samples/videos/wildlife.mp4";
                            },
                            function error() {
                                // The expected behavior is to navigate back, or if there is no back stack, navigate home.
                                if (WinJS.Navigation.canGoBack) {
                                    WinJS.Navigation.back();
                                } else {
                                    WinJS.Navigation.navigate('/pages/home/home.html');
                                }
                            }
                        );

                    setImmediate(function afterPageRenderingHasFinished() {
                        if (mediaPlayer &&
                            mediaPlayer.element) {
                            mediaPlayer.element.focus();
                        }

                        if (!Windows.Xbox) {
                            var backButton = element.querySelector(".win-navigation-backbutton");

                            mediaPlayer.onbeforeshowcontrols = function () {
                                WinJS.UI.executeTransition(backButton, [{
                                    property: "opacity",
                                    delay: 0,
                                    duration: 222,
                                    timing: "linear",
                                    from: 0,
                                    to: 1
                                }]);
                            }

                            mediaPlayer.onbeforehidecontrols = function () {
                                WinJS.UI.executeTransition(backButton, [{
                                    property: "opacity",
                                    delay: 0,
                                    duration: 222,
                                    timing: "linear",
                                    from: 1,
                                    to: 0
                                }]);
                            }
                        }

                        // We need to re-enable disable animations after navigating to
                        // the playback page, because they were previously disabled to hide
                        // the animation that would normally occur for a page transition to
                        // the details page.
                        WinJS.UI.enableAnimations();
                    });

                    // Get the loaded video element
                    var mediaElement = document.getElementById("scenario2-video");

                    // Initialize the WinJS logger
                    WinJS.Utilities.startLog({ type: "telemetry" });

                    // Create the custom adapter and connect it to the player
                    mediaPlayer.mediaElementAdapter = new MyMediaElementAdapter(mediaPlayer, mediaElement);

                });
        }
    });
})();
