// Requires:
// reporter.js

//Ooyala.Util.createNamespace("Ooyala.Analytics");
var Ooyala = {Analytics : {}};

WinJS.Namespace.define("Ooyala", Ooyala);

function generateUUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

/**
 * This indicate which player the content is from.
 * @global
 * @enum
 */
Ooyala.Analytics.MediaContentType ={
    /** @constant {number} - Indicates that the media id is an Ooyala embed code */
    OOYALA_CONTENT: "ooyala",
    /** @constant {number} - Indicates that the media id is customer-specific and not an Ooyala embed code */
    EXTERNAL_CONTENT: "external"
}

/**
 * The Ooyala IQ JavaScript SDK enables the integration of Ooyala analytics with any player. The user
 * needs to obtain a provider code from Ooyala first before this can be used. The integration must conform
 * to calling the methods in the right order, otherwise analytics metrics are not guaranteed to be correct.
 *
 * @example
 * var pCode = "xxxxxx"
 * var ooyalaReporter = new Ooyala.Analytics.Reporter(pCode,
 *             {
 *              playerName: "jwplayer",
 *              playerVersion: "7.0.283",
 *              contentType: Ooyala.Analytics.MediaContentType.OOYALA_CONTENT // Miss configuration will fall into EXTERNAL_CONTENT.
 *             });
 * ooyalaReporter.reportPlayerLoad();
 * ..
 * ooyalaReporter.initializeMedia("5612443");
 * ooyalaReporter.setMediaDuration(60000);
 * ooyalaReporter.reportPlayRequested();
 * ooyalaReporter.reportPlaybackStarted();
 * ..
 * ooyalaReporter.reportPlayHeadUpdate(2000);
 * ..
 * ooyalaReporter.reportPlayHeadUpdate(4000);
 * ..
 * ooyalaReporter.reportPlayHeadUpdate(60000);
 * ooyalaReporter.reportComplete();
 *
 * @constructor
 * @param {string} pCode - The customer-specific provider code obtained from Ooyala.
 * @param {object} [options] - Optional arguments
 * @param {string} [options.playerName] - Name of the player (eg: youtube, jwplayer etc)
 * @param {string} [options.playerVersion] - Version of the player.(eg: 6.0.283)
 * @param {string} [options.playerId] - Unique identifier for the player
 * @param {string} [options.documentUrl] - The url where the video is being watched by the user
 *      In absence of this parameter it is derived from http referral url by the http endpoint
 * @param {MediaContentType} [options.contentType] - Content type of the media being played(eg: Ooyala.Analytics.MediaContentType.EXTERNAL_CONTENT)
 */
Ooyala.Analytics.Reporter = function (pCode, options) {
    //this._guidManager = new Ooyala.Analytics._GuidManager();
    this._guid = generateUUID();


    var moduleParams = {
        "guid": this._guid,
        "source": options.source
    };


    this._reporter = new Ooyala.Reporter(pCode, moduleParams);
};

//TODO: make sure the order is maintained: initializeMedia -> setMediaDuration -> other calls
Ooyala.Analytics.Reporter.prototype = {

    /**
     * Call this method to report that a player instance has fully loaded. This should only be called once per reporter.
     * @method Ooyala.Analytics.Reporter#reportPlayerLoad
     */
    reportPlayerLoad: function () {
        this._reporter.reportPlayerLoad();
    },

    /**
     * Set the media id on which to report analytics information. This should also get called when the
     * video within the player changes (in the case of back-to-back videos coming from a single instance
     * of the player). This may only be called once per video and should only be called when the video has
     * been displayed to the end user.
     * @method Ooyala.Analytics.Reporter#initializeMedia
     * @param {string} mediaId - The customer-specific id for the media item.
     */
    initializeMedia: function (mediaId) {
        this._reporter.initializeVideo(mediaId);
    },

    /**
     * Call this method to set the duration of the video.
     * This can be called only after the Ooyala.Analytics.Reporter#initializeVideo has been called.
     * @method Ooyala.Analytics.Reporter#setMediaDuration
     * @param {number} durationMillis - The duration of the video in milliseconds.
     */
    setMediaDuration: function (durationMillis) {
        this._reporter.setVideoDuration(durationMillis)
    },

    /**
     * Call this method to report when the playback of the video has been requested.
     * @method Ooyala.Analytics.Reporter#reportPlayRequested
     * @param {boolean} isAutoPlay - true if the play was auto triggered.
     */
    reportPlayRequested: function (isAutoPlay) {
        this._reporter.reportPlayRequested();
    },

    /**
     * Call this method when the media has been requested to be *replayed*.
     * @method Ooyala.Analytics.Reporter#reportReplay
     */
    reportReplay: function() {
        this._reporter.reportReplay();
    },

    /**
     * Call this method when playback of the media has actually begun.
     * @method Ooyala.Analytics.Reporter#reportPlaybackStarted
     */
    reportPlaybackStarted: function () {
        this._reporter.reportVideoStarted();
    },

    /**
     * Call this method to report that the playhead of the media was updated (either because some
     * amount of playback occurred or through scrubbing). It is important that this method gets called
     * frequently (every 2-3 seconds) as the media is being played.
     * @method Ooyala.Analytics.Reporter#reportPlayHeadUpdate
     * @param {number} playHeadPositionMillis - The current position of the playhead in milliseconds.
     */
    reportPlayHeadUpdate: function (playHeadPositionMillis) {
        this._reporter.reportPlayheadUpdate(playHeadPositionMillis);
    },

    /**
     * Call this method when playback pause has been triggered.
     * @method Ooyala.Analytics.Reporter#reportPause
     */
    reportPause: function () {
        this._reporter.reportPause();
    },

    /**
     * Call this method when playback resume has been triggered.
     * @method Ooyala.Analytics.Reporter#reportResume
     */
    reportResume: function () {
        this._reporter.reportResume();
    },

    /**
     * Call this method when playback of the media item is completed.
     * @method Ooyala.Analytics.Reporter#reportComplete
     */
    reportComplete: function () {
        this._reporter.reportComplete();
    }
};