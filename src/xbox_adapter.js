// Requires:
// analytics.js

Ooyala.Util.createNamespace("Ooyala.Analytics");

/**
 * Xbox One HTML5 video reporter
 *
 * @example:
 * <video id="video" height="600px" controls>
 *      <source src="http://csg-eng.ooyala.com/custom-iq-reporters/video.mp4" type="video/mp4"></source>
 *      <p>Click image to play a video demo of dynamic app search</p>
 *    </video>
 *
 *    <script type="text/javascript">
 *      var videoContainer = document.getElementById("video");
 *      videoContainer.setAttribute("data-embedId", embedcode1);
 *      var reporter = Ooyala.Analytics.HTML5Reporter(pcode1, videoContainer);
 *      //Report a custom event
 *      reporter.reportCustomEvent("myCustomEvent", { key1: value1, key2: value2});
 *    </script>
 *
 * The above sets a native HTML5 video for a provider with provide id pcode1 and a video
 * play with embedcode given by embedcode1.
 * Creates a XboxOneReporter
 * @constructor
 * @param {string} pcode - The customer specific provider code obtained from Ooyala.
 * @param {object} player - the HTML5 video instance.
 * @param {object} options - optional parameters for the adapter
 * @param {string} [options.playerId] - Unique identifier for the player
 * @param {MediaContentType} [options.contentType] - Content type of the media being played(eg: Ooyala.Analytics.MediaContentType.EXTERNAL_CONTENT)
 * @param {string} [options.playerVersion] - Player version
 * @return {undefined}
 */

Ooyala.Analytics.XboxOneReporter = function(pCode, player, options) {
    var self = this;

    if (!options) {
        options = {};
    }

    console.log(options)
    self._options = {
        playerName: "xbox",
        playerId: "xbox",
        playerVersion: "xbox-10",
        contentType: Ooyala.Analytics.MediaContentType.OOYALA_CONTENT

    }

    for (var attr in options) { self._options[attr] = options[attr]; }

    self._ooyalaReporter = new Ooyala.Analytics.Reporter(pCode);
    self._ooyalaReporter.setPlayerInfo(
        self._options.playerId,
        self._options.playerName,
        self._options.playerVersion);
    self._ooyalaReporter.setDeviceInfo(null, {
        os: "windows",
        browser: "xbox_sdk",
        deviceType: "console"
    });

    self._player = player;
    self._isVideoFinished = false;
    self._isFirstPlayClickForPlayer = true;
    self._loadTracked = false;

    function trackPlayerLoad(){
        self._ooyalaReporter.reportPlayerLoad();
        self._ooyalaReporter.initializeMedia(self._player.attributes['data-oo-embedId'].value, self._options.contentType);
        self._loadTracked = true;
    }
    // Fired when the player has initialized.
    // event: the event itself contains the player status and other data reference to the player
    self._player.addEventListener('loadstart', function(event) {
        trackPlayerLoad();
    });

    // Fired when the player is ready for playback.
    // event: the event itself contains the player status and other data reference to the player
    self._player.addEventListener('canplay', function(event) {
        if(!self._loadTracked){
            trackPlayerLoad();
        }
        self._ooyalaReporter.setMediaDuration(parseFloat(self._player.duration) * 1000);
    });

    // Fired when a play of any kind is triggered.
    // event: the event itself contains the player status and other data reference to the player
    self._player.addEventListener("playing", function(event) {
        if (self._isFirstPlayClickForPlayer) {
            self._ooyalaReporter.reportPlayRequested(event.target.autoplay);
            self._ooyalaReporter.reportPlaybackStarted();
            self._isFirstPlayClickForPlayer = false;
        } else if(self._isVideoFinished) {
            self._ooyalaReporter.reportReplay();
            self._isVideoFinished = false;
        } else {
            self._ooyalaReporter.reportResume();
        }
    });

    // Fired when seek event is triggered.
    // event: the event itself contains the player status and other data reference to the player
    self._player.addEventListener("timeupdate", function(event) {
        if(!self._isFirstPlayClickForPlayer)
            self._ooyalaReporter.reportPlayHeadUpdate(event.target.currentTime * 1000);
    });

    self._player.addEventListener("seeking", function(event) {
        self._seekStart = self._player.currentTime * 1000;
    });

    self._player.addEventListener("seeked", function(event) {
      self._ooyalaReporter.reportSeek(self._seekStart, self._player.currentTime);
    });

    // Fired when the pause button is triggered.
    // event: the event itself contains the player status and other data reference to the player
    self._player.addEventListener("pause", function(event) {
        self._ooyalaReporter.reportPause();
    });

    // Fired when the video reach the end.
    // event: the event itself contains the player status and other data reference to the player
    self._player.addEventListener("ended", function(event) {
        self._ooyalaReporter.reportComplete();
        self._isVideoFinished = true;
    });


    /**
     * Report a custom event.
     * @param {string} name - event name
     * @param {Object} metadata - metadata object
     */
    self.reportCustomEvent = function(name, metadata){
        self._ooyalaReporter.reportCustomEvent(name, metadata);
    }
};