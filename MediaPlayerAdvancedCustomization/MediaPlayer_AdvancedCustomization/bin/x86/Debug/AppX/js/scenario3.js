//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    function handleMyButtonClick() {
        // TODO - Put code here that you want to execute when the button is pressed.

    }

    var page = WinJS.UI.Pages.define("/html/scenario3.html", {
        ready: function (element, options) {
            WinJS.UI.processAll(element)
                .then(function afterProcessAll() {
                    // Get the MediaPlayer. In this example the MediaPlayer is named myMediaPlayer.
                    var mediaPlayer = document.getElementById("scenario3-mediaplayer").winControl;

                    mediaPlayer.setContentMetadata(XboxJS.Data.ContentType.movie, {
                        title: "Scenario 3", description: "This example shows how to hide and disable buttons on the transport control. Hiding buttons is done through a CSS rule, in scenario3.css. Disabling \
                        buttons is accomplished in JavaScript in scenario3.js."
                    })
                        .done(
                            function success() {
                                mediaPlayer.mediaElementAdapter.mediaElement = element.querySelector("#scenario3-video");
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

                    var videoTag = mediaPlayer.mediaElementAdapter.mediaElement;

                    // Note: We wait until after the video tag's oncanplay event. The MediaPlayer disables the rewind 
                    // and fast forward buttons until playback starts, then when the video can play the MediaPlayer
                    // automatically enables the rewind and fast forward button.
                    // Therefore, if we want to disable the rewind and fast forward buttons we need to wait until
                    // after the canplay event and then set the disabled property on the buttons.
                    videoTag.addEventListener("canplay", function handleCanPlay() {
                        // Get the chapter skip buttons
                        var fastForwardButton = mediaPlayer.element.querySelector(".win-mediaplayer-fastforwardbutton");
                        var rewindButton = mediaPlayer.element.querySelector(".win-mediaplayer-rewindbutton");

                        // Disable the buttons
                        fastForwardButton.disabled = true;
                        rewindButton.disabled = true;
                    }, false);
                });
        }
    });
})();
