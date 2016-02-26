//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var page = WinJS.UI.Pages.define("/html/scenario4.html", {
        ended: false,
        ready: function (element, options) {
            var that = this;
            WinJS.UI.processAll(element)
                .then(function afterProcessAll() {
                    // Get the MediaPlayer. In this example the MediaPlayer is named scenario4-mediaplayer.
                    var mediaPlayer = document.getElementById("scenario4-mediaplayer").winControl;

                    mediaPlayer.setContentMetadata(XboxJS.Data.ContentType.movie, { title: "Scenario 4", description: "This example shows how to create a post-roll overlay that show up above the MediaPlayer when the video has ended." })
                        .done(
                            function success() {
                                mediaPlayer.mediaElementAdapter.mediaElement = element.querySelector("#scenario4-video");
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

                    // Listen for beforehidecontrols on the MediaPlayer so we can prevent the controls from
                    // when the overlay is up.
                    mediaPlayer.addEventListener("beforehidecontrols", that.handleHideControls.bind(that));

                    // We wait for the video tag's ended event to show the post-roll
                    videoTag.addEventListener("ended", function handleCanPlay() {
                        that.ended = true;
                        // Explicitly show the MediaPlayer controls
                        mediaPlayer.showControls();

                        // Remove "win-hidden" from the overlay to make it visible
                        WinJS.Utilities.removeClass(document.getElementById("postRollOverlay"), "win-hidden");
                        document.querySelector(".post-roll-related-tile").focus();
                    }, false);

                    document.getElementById("postroll-replaybutton").addEventListener("invoked", function () {
                        that.replay();
                        that.ended = false;
                        WinJS.Utilities.addClass(document.getElementById("postRollOverlay"), "win-hidden");
                    });

                    // Configure the MediaTile's in the overlay
                    document.querySelector(".tile1").winControl.metadata = { title: 'Movie 1', image: 'images/squareTile-sdk.png' };
                    document.querySelector(".tile2").winControl.metadata = { title: 'Movie 2', image: 'images/squareTile-sdk.png' };
                    document.querySelector(".tile3").winControl.metadata = { title: 'Movie 3', image: 'images/squareTile-sdk.png' };
                });
        },
        handleHideControls: function (evt) {
            // If we have reached the end of the video, preventDefault to keep the MediaPlayer controls on screen
            if (this._ended) {
                evt.preventDefault();
                return false;
            }
            return true;
        },
        replay: function () {
            // Reset the playback state and replay the video
            var mediaPlayer = document.getElementById("scenario4-mediaplayer").winControl;
            mediaPlayer.seek(0);
            mediaPlayer.play();
        },
        unload: function () {
            // Hide the overlay in case of a second play through
            WinJS.Utilities.addClass(document.getElementById("postRollOverlay"), "win-hidden");
        }
    });
})();
