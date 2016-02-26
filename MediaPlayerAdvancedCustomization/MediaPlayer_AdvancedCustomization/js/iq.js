/**
 * Created by apesant on 23/02/16.
 */
(function(){

   
    //var DeviceIdentifier

    var IQ = function(){

        var iq = {};

        var _PRIORITIES = {
            LOW : 0,
            MEDIUM : 1,
            HIGH : 2
        };
        var _EVENTS = {
            PLAYER_LOAD : { name: "playerLoad", priority : _PRIORITIES.HIGH},
            DISPLAY : { name:"display",priority : _PRIORITIES.HIGH},
            PLAY_REQUESTED : { name:"playRequested",priority : _PRIORITIES.HIGH},
            VIDEO_STARTED : { name:"videoStarted",priority : _PRIORITIES.HIGH},
            PLAYTHROUGH_PERCENT: { name:"playthroughPercent",priority : _PRIORITIES.HIGH},
            PERCENTAGE_WATCHED : { name:"percentageWatched",priority : _PRIORITIES.HIGH},
            BUCKETS_WATCHED : { name:"bucketWatched",priority : _PRIORITIES.HIGH},
            REPLAY : { name:"replay",priority : _PRIORITIES.HIGH},
            SEEK : { name:"seek",priority : _PRIORITIES.HIGH},
            PAUSE : { name:"pause",priority : _PRIORITIES.HIGH},
            RESUME : { name:"resume",priority : _PRIORITIES.HIGH},
            TIME_PLAYED : { name:"timePlayed",priority : _PRIORITIES.HIGH},
            PLAYHEAD_UPDATE : { name : "playheadUpdate", priority : _PRIORITIES.HIGH},
            CUSTOM: { name:"custom", priority : _PRIORITIES.HIGH}
        };


        var _videoElement = null;
        var _base = {};
        var _lastFlush = 0;
        var _liveContent = false;
        var _contentDuration = 0;
        var _date = new Date();
        var _pendingEvents = [];
        var _currentSequenceNumber = 0;
        var _flushTime = Number.MAX_VALUE;
        var _timePlayed = 0;
        var _iqEndpoint = "http://10.11.67.197:9000/session/xbox2/v3/analytics/events" //FIXME
        var _priorityIntervals = [10000, 5000, 1000];
        var _listeners = {};
        var _seek = {start : 0, end : 0};
        var _timePlayedEvent = makeStandardEvent(_EVENTS.TIME_PLAYED);
        var _lastTimePlayed = 0;
        var _hasContentStarted = false;
        var _flushTimeout = null;
        var _buckets = {watched : [], current : -1, startingTimes : [], count : 40, watchedCount : 0};


        function generateUUID() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        function getDeviceInfo() {
            //TODO
            return {};
        }

        function makeStandardEvent(event) {
            var event = {eventName : event.name,
                time : _date.toISOString()
            };
            return event;
        }

        function addPendingEvent(event, priority) {
            event["sequenceNum"] = _currentSequenceNumber;
            updateNextFlushingTime(priority);
            _pendingEvents.push(event);
            _currentSequenceNumber++;
        }

        function updateNextFlushingTime(priority) {
             if(Date.now() + _priorityIntervals[priority] < _flushTime){
                clearTimeout(_flushTimeout);
                setTimeout(flushPendingEvents, _priorityIntervals[priority])
                _flushTime = Date.now() + _priorityIntervals[priority];
            }
        }
        function buildAndAddEventToPending(eventEnum){
            var event = makeStandardEvent(eventEnum);
            addPendingEvent(event, eventEnum.priority);
        }

        function sendJSONToServer(object) {
            xhr = new XMLHttpRequest();
            xhr.open('POST', _iqEndpoint);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            console.log("Sending json : ", JSON.stringify(object));
            xhr.send(JSON.stringify(object));
        }

        function flushPendingEvents(){
            var time = Date.now()/1000;
            console.log("Time since last flush ", _lastFlush - time);
            var date = new Date();
            _base.clientTime = date.toISOString();
            _base.events = _pendingEvents;
            _lastTimePlayed = 0;
            addPendingEvent(_timePlayedEvent);
            sendJSONToServer(_base);
            _pendingEvents = [];
            _flushTime = Number.MAX_VALUE;
            _lastFlush = time;
        }

        function trackPlayerLoad(){
            var event = makeStandardEvent(_EVENTS.PLAYER_LOAD);
            addPendingEvent(event);
        }

        function trackPlayerDisplay(){
            var event = makeStandardEvent(_EVENTS.DISPLAY);
            addPendingEvent(event);
        }

        function initializeListeners() {
            _videoElement.addEventListener("play",_listeners.onPlay);
            _videoElement.addEventListener("pause",_listeners.onPause);
            _videoElement.addEventListener("ended",_listeners.onEnded);
            _videoElement.addEventListener("seeked",_listeners.onSeeked);
            _videoElement.addEventListener("seeking",_listeners.onSeeking);
            _videoElement.addEventListener("timeupdate",_listeners.onTimeUpdate);
        }

        function computeBuckets(duration){
            var bucketDuration = duration/_buckets.count;
            for (var i = 0; i < _buckets.count; i++){
                _buckets.startingTimes[i] = i * bucketDuration;
            }
        }

        function findBucketsForPlayheadPosition(position) {
            var found = false;
            var i = 0;
            var bucketIndex = 0;
            while (!found) {
                if ((i === _buckets.count) || (_buckets.startingTimes[i] > position)) {
                    bucketIndex =  i -1;
                    found = true;
                }
                else
                {
                    i = i + 1;
                }
            }
            return bucketIndex;
        }

        function addViewedBucket(index) {
            if(!_buckets.watched[index]){
                _buckets.watched[index] = true;
                trackBucketWatchedFirstTime(index);
            }

            if(_buckets.current !== index){
                trackBucketWatched(index);
                _buckets.current = index;
            }

        }

        function trackBucketWatchedFirstTime(index) {
            var event = makeStandardEvent(_EVENTS.PERCENTAGE_WATCHED);
            event["startMille"] = index * 25 +1;
            event["endMille"] = index * 25 +25;
            addPendingEvent(event,_EVENTS.PERCENTAGE_WATCHED.priority);
            _buckets.watchedCount++;
        }

        function trackBucketWatched(index) {
            var event = makeStandardEvent(_EVENTS.BUCKETS_WATCHED);
            event["startMille"] = index * 25 +1;
            event["endMille"] = index * 25 +25;
            addPendingEvent(event,_EVENTS.BUCKETS_WATCHED.priority);
        }

        //listeners

        _listeners.onPlay = function(){
            if(!_hasContentStarted){
                buildAndAddEventToPending(_EVENTS.VIDEO_STARTED);
                _hasContentStarted = true;
            }else {
                buildAndAddEventToPending(_EVENTS.RESUME);
            }
        }

        _listeners.onPause = function() {
            buildAndAddEventToPending(_EVENTS.PAUSE);
        }

        _listeners.onSeeking = function() {
            _seek.start = _videoElement.currentTime * 1000;
        }

        _listeners.onSeeked = function() {
            var event = makeStandardEvent(_EVENTS.SEEK);

            _seek.end = _videoElement.currentTime * 1000;
            event["fromMillis"] = Math.floor(_seek.start);
            event["toMillis"] = Math.floor(_seek.end);
            addPendingEvent(event,_EVENTS.SEEK.priority);
        }

        _listeners.onEnded = function(){
            //We flush the remaining events
            clearTimeout(_flushTimeout);
            flushPendingEvents();
        }



        _listeners.onTimeUpdate = function(){
            var currentTime = _videoElement.currentTime;
            //console.log("time update ", currentTime);
            _timePlayed = _timePlayed + (currentTime - _lastTimePlayed);
            _lastTimePlayed = currentTime;
            _timePlayedEvent["timePlayedMillis"] = Math.floor(_timePlayed * 1000);
            updateNextFlushingTime(_EVENTS.PLAYHEAD_UPDATE.priority);
            updateNextFlushingTime(_EVENTS.TIME_PLAYED.priority);
            if(!_liveContent) {
                var bucketIndex = findBucketsForPlayheadPosition(currentTime);
                console.log("Bucket for playhead " + currentTime + " is " + bucketIndex);
                //We add the bucket to the viewed buckets
                addViewedBucket(bucketIndex);
            }
        }

        iq.setContentMetadata = function (duration, assetId, assetType){
            console.log("Asset metadata : duration " + duration + "s");

            _base.asset = {id : assetId, type : assetType};
            _contentDuration = duration;
            _liveContent = _contentDuration === -1;
            if(!_liveContent){
                computeBuckets(duration);
            }
        };

        iq.trackCustomEvent = function(object){
            var event = makeStandardEvent(_EVENTS.CUSTOM);
            for (var property in object){
                if (!object.hasOwnProperty(property)){
                    event[property]  = object[property];
                }
            }
            addPendingEvent(event, _EVENTS.CUSTOM.priority);
        };

        iq.initSession = function(videoElement, pcode, userInfo, geoInfo){
            console.log("IQ \\o/", videoElement);
            _videoElement = videoElement;

            //Let's set all our listeners on the video element
            initializeListeners(_videoElement);
            //Prepare our base object that we will send at every ping
            var date = new Date();
            _base.pcode = pcode;
            _base.sessionStartTime = date.toISOString();
            _base.sessionId = generateUUID();
            _base.analyticsSdkName = "ooyala-xbox-one-analytics-sdk";
            _base.analyticsSdkVersion = "1.0.0";
            _base.user = userInfo;
            _base.geo = geoInfo;
            _base.device = getDeviceInfo();
        };


        return iq;
    }();

    WinJS.Namespace.define("IQ", IQ);
})();