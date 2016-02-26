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

    var page = WinJS.UI.Pages.define("/html/scenario1.html", {
        ready: function (element, options) {
            WinJS.UI.processAll(element)
                .then(function afterProcessAll() {
                    // Get the MediaPlayer. In this example the MediaPlayer is named myMediaPlayer.

                    var mediaPlayer = document.getElementById("scenario1-mediaplayer").winControl;
                    mediaPlayer.mediaElementAdapter.mediaElement.setAttribute('data-oo-embedId', 'k4cWdsdzoTxuCp6lyBN7TSTsI6OmdII9');

                    var iframe = document.getElementById("iqIframe");
                    var iq = iframe.contentWindow;
                    console.log(iframe);
                    IQ.initSession(mediaPlayer.mediaElementAdapter.mediaElement, "ooyala" );
                    IQ.setContentMetadata(30.8, "42", IQ.EXTERNAL_ASSET);
                   

                    //iq.Ooyala.Analytics.HTML5Reporter('F4NGUyOvIrsRkkvtsm9r-Uu_qENR', mediaPlayer.mediaElementAdapter.mediaElement);


                    // Create the new button
                    var myIconButton = document.createElement("button");
                    var myPNGButton = document.createElement("button");

                    //Example of using a PNG file as background image for button
                    myPNGButton.innerHTML = "<div class='mediaplayer-png-icon win-mediaplayer-icon'></div>"                    

                    // Create the icon and voice attributes
                    // This example uses the provided icon for more commands. You can either use one of 
                    // the icons provided or create your own.
                    var iconAttribute = document.createElement("span");
                    WinJS.Utilities.addClass(iconAttribute, "win-mediaplayer-icon win-mediaplayer-moreicon");

                    var IconVoiceAttribute = document.createElement("span");
                    WinJS.Utilities.addClass(IconVoiceAttribute, "win-voice-textdisplay win-voice-activetext");

                    var PNGVoiceAttribute = document.createElement("span");
                    WinJS.Utilities.addClass(PNGVoiceAttribute, "win-voice-textdisplay win-voice-activetext voice-PNGButton");

                    // Create the VUI attributes.
                    // You will need to update this section to point to your own VUI resources
                    var IconVoiceData = document.createAttribute("data-win-voice");
                    var PNGVoiceData = document.createAttribute("data-win-voice");
                    IconVoiceData.nodeValue = "{ phrase: 'ms-resource://Microsoft.Xbox.WinJS.1.0/tv/MORE_MEDIA_COMMAND_VUI_ALM', confidence: 'ms-resource://Microsoft.Xbox.WinJS.1.0/tv/MORE_MEDIA_COMMAND_VUI_CONF', pronunciation: 'ms-resource://Microsoft.Xbox.WinJS.1.0/tv/MORE_MEDIA_COMMAND_VUI_PRON', targetElement: select('.win-voice-activetext') }";                    
                    PNGVoiceData.nodeValue = "{ phrase: 'Custom Button', confidence: '.06', pronunciation: 'my button', targetElement: select('.voice-PNGButton') }";

                    // Add the class and attributes to our buttons
                    myPNGButton.setAttributeNode(PNGVoiceData);
                    myPNGButton.appendChild(PNGVoiceAttribute);
                    myIconButton.setAttributeNode(IconVoiceData);
                    myIconButton.appendChild(IconVoiceAttribute);
                    myIconButton.appendChild(iconAttribute);

                    // This code adds the buttons to the mediaplayer transport bar                    
                    var transportControls = mediaPlayer.element.querySelector(".win-mediaplayer-transportcontrols-primary");

                    transportControls.appendChild(myPNGButton);
                    transportControls.appendChild(myIconButton);

                    //// Alternatively, you can place buttons next to buttons already on the 
                    //// transport bar. This code places the button before the rewind button.
                    //var rewindButton = mediaPlayer.element.querySelector(".win-mediaplayer-rewindbutton");
                    //rewindButton.parentNode.insertBefore(myCustomButton, rewindButton);

                    //Add event handlers for new buttons
                    addMediaPlayerEvents(myPNGButton, mediaPlayer);
                    addMediaPlayerEvents(myIconButton, mediaPlayer);
                    myPNGButton.addEventListener("click", handleMyButtonClick);
                    myIconButton.addEventListener("click", handleMyButtonClick);



                    //addMediaPlayerEvents(myCustomButton, mediaPlayer);

                    //var itemContainer = document.createAttribute("data-win-control");
                    //itemContainer.nodeValue = "XboxJS.UI.ItemContainer";                    

                    //WinJS.Utilities.addClass(myCustomButton, "win-mediaplayer-transportcontrols-builtinbutton");
                    //myCustomButton.style.display = "block";

                    //// Create the icon and voice attributes
                    //// This example uses the provided icon for more commands. You can either use one of 
                    //// the icons provided or create your own.
                    //var iconAttribute = document.createElement("span");
                    //WinJS.Utilities.addClass(iconAttribute, "win-mediaplayer-icon win-mediaplayer-moreicon");
                    
                    //var voiceAttribute = document.createElement("span");
                    //WinJS.Utilities.addClass(voiceAttribute, "win-voice-textdisplay win-voice-activetext");

                    //// Create the VUI attributes.
                    //// You will need to update this section to point to your own VUI resources
                    //var voiceData = document.createAttribute("data-win-voice");
                    //voiceData.nodeValue = "{ phrase: 'ms-resource://Microsoft.Xbox.WinJS.1.0/tv/MORE_MEDIA_COMMAND_VUI_ALM', confidence: 'ms-resource://Microsoft.Xbox.WinJS.1.0/tv/MORE_MEDIA_COMMAND_VUI_CONF', pronunciation: 'ms-resource://Microsoft.Xbox.WinJS.1.0/tv/MORE_MEDIA_COMMAND_VUI_PRON', targetElement: select('.win-voice-activetext') }";

                    //// Add the class and attributes to the button
                    //myCustomButton.setAttributeNode(voiceData);
                    //myCustomButton.setAttributeNode(itemContainer);
                    //myCustomButton.appendChild(iconAttribute);
                    //myCustomButton.appendChild(voiceAttribute);

                    // The custom button must be placed before or after one of the buttons already on the 
                    // transport bar. This code places the button before the rewind button.
                    //var rewindButton = mediaPlayer.element.querySelector(".win-mediaplayer-rewindbutton");                   
                    //rewindButton.parentNode.insertBefore(myCustomButton, rewindButton);

                    mediaPlayer.setContentMetadata(XboxJS.Data.ContentType.movie, { title: "Scenario 1", description: "This shows you how to create a custom button and add it to the MediaPlayer's transport controls." })
                        .done(
                            function success() {
                                mediaPlayer.mediaElementAdapter.mediaElement = element.querySelector("#scenario1-video");
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
