//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    //Custom Event handerler
    function handleMyButtonClick(but) {
        console.log("clicked " + but);
    }

    function addMediaPlayerEvents(customButton, mediaPlayer) {
        var handleTransportBarButtonFocus = function transportBarButtonFocusHandler(ev) { mediaPlayer._resetAutoHideTimers(); };
        var handleTransportBarButtonKeyDown = function transportBarButtonKeyDownHandler(ev) { WinJS.Utilities.addClass(ev.srcElement, "win-mediaplayer-transportbarbutton-active"); };
        var handleTransportBarButtonKeyUp = function transportBarButtonKeyUpHandler(ev) { WinJS.Utilities.removeClass(ev.srcElement, "win-mediaplayer-transportbarbutton-active"); };

        mediaPlayer._addButtonEventHandler(customButton, "focus", handleTransportBarButtonFocus);
        mediaPlayer._addButtonEventHandler(customButton, "click", handleTransportBarButtonFocus);
        mediaPlayer._addButtonEventHandler(customButton, "keydown", handleTransportBarButtonKeyDown);
        mediaPlayer._addButtonEventHandler(customButton, "keyup", handleTransportBarButtonKeyUp);
    }
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }
    function getBestStreamFromRemoteAsset(asset){
        var streams = asset.stream_urls;
        for (var stream in streams){
            if (streams[stream] && streams[stream].endsWith("mp4")) {
                return streams[stream];
            }
        }
        return null;
    }

    function getBestStreamForBacklotAsset(asset, callback) {
        var backlotRequester = BacklotRequesterFactory.make();
        backlotRequester.getStreamsForAsset(asset.embed_code,BACKLOT_ACCOUNT.apiKey,BACKLOT_ACCOUNT.secret, function(streams){
            var bestStream = {average_video_bitrate : 1, url : null};

            for (var i = 0, n = streams.length; i < n; i++){
                if(streams[i].muxing_format === "MP4"){
                    if(bestStream.average_video_bitrate < streams[i].average_video_bitrate){
                        bestStream = streams[i];
                    }
                }
            }
            callback(bestStream.url)
        });

    }

    function getStreamForAsset(asset, callback){
        if(asset.asset_type ==="remote_asset"){
            callback(getBestStreamFromRemoteAsset(asset));
        }
        else {
            getBestStreamForBacklotAsset(asset, callback);
        }
    }

    function alert(message) {
        var msgBox = new Windows.UI.Popups.MessageDialog(message);
        msgBox.showAsync();
    }

    var page = WinJS.UI.Pages.define("/html/player.html", {
        ready: function (element, asset) {
            console.log("options are ", asset);
            WinJS.UI.processAll(element)
                .then(function afterProcessAll() {
                    // Get the MediaPlayer. In this example the MediaPlayer is named myMediaPlayer.

                    var mediaPlayer = document.getElementById("mediaplayer").winControl;

                  //  IQ.initSession(mediaPlayer.mediaElementAdapter.mediaElement, "ooyala" );
                    //IQ.setContentMetadata(30.8, BACKLOT_ACCOUNT.PCODE, IQ.EXTERNAL_ASSET);






                    //iq.Ooyala.Analytics.HTML5Reporter('F4NGUyOvIrsRkkvtsm9r-Uu_qENR', mediaPlayer.mediaElementAdapter.mediaElement);

                    getStreamForAsset(asset, function(streamUrl){
                        mediaPlayer.setContentMetadata(XboxJS.Data.ContentType.movie, { title: asset.name, description: asset.description })
                            .done(
                                function success() {
                                    if(!streamUrl){
                                        console.log("Couldn't find a playable stream for the embed code " + asset.embed_code);
                                        alert("Couldn't find a playable stream for the embed code " + asset.embed_code);
                                        if (WinJS.Navigation.canGoBack) {
                                            WinJS.Navigation.back();
                                        } else {
                                            WinJS.Navigation.navigate('/html/default.html');
                                        }
                                    }else {
                                        mediaPlayer.mediaElementAdapter.mediaElement = element.querySelector("#video");
                                        mediaPlayer.mediaElementAdapter.mediaElement.src = streamUrl;
                                        mediaPlayer.mediaElementAdapter.mediaElement.setAttribute('data-oo-embedId', 'k4cWdsdzoTxuCp6lyBN7TSTsI6OmdII9');

                                        Ooyala.XboxAdapter('F4NGUyOvIrsRkkvtsm9r-Uu_qENR', mediaPlayer.mediaElementAdapter.mediaElement);
                                    }

                                },
                                function error() {
                                    // The expected behavior is to navigate back, or if there is no back stack, navigate home.
                                    if (WinJS.Navigation.canGoBack) {
                                        WinJS.Navigation.back();
                                    } else {
                                        WinJS.Navigation.navigate('/html/backlotView.html');
                                    }
                                }
                            );
                    })


                    setImmediate(function afterPageRenderingHasFinished() {
                        if (mediaPlayer &&
                            mediaPlayer.element) {
                            mediaPlayer.element.focus();
                        }

                        if(!Windows.Xbox) {
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

                });


        },

        unload: function () {
            // TODO: Respond to navigations away from this page.

        }
    });
})();
