(function () {





    Ooyala.XboxAdapter = function(pCode, player, options) {
        var self = this;

        if (!options) {
            options = {};
        }

        console.log(options)
        self._options = {
            playerName: "html5",
            playerId: "html5"
        }

        for (var attr in options) { self._options[attr] = options[attr]; }

        self._ooyalaReporter = new Ooyala.Analytics.Reporter(pCode, self._options);
        console.log("reporter Created !");

        self._player = player;
        self._isVideoFinished = false;
        self._isFirstPlayClickForPlayer = true;


        // Fired when the player has initialized.
        // event: the event itself contains the player status and other data reference to the player
        self._player.addEventListener('loadstart', function(event) {
            self._ooyalaReporter.reportPlayerLoad();
            self._ooyalaReporter.initializeMedia(self._player.attributes['data-oo-embedId'].value);
        });

        // Fired when the player is ready for playback.
        // event: the event itself contains the player status and other data reference to the player
        self._player.addEventListener('canplay', function(event) {
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
    };
}());