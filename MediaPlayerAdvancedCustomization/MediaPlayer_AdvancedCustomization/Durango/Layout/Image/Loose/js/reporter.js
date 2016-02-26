(function () {
    "use strict";

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
        SEEK : { name:"seek",priority : _PRIORITIES.MEDIUM},
        PAUSE : { name:"pause",priority : _PRIORITIES.HIGH},
        RESUME : { name:"resume",priority : _PRIORITIES.MEDIUM},
        TIME_PLAYED : { name:"timePlayed",priority : _PRIORITIES.HIGH},
        PLAYHEAD_UPDATE : { name : "playheadUpdate", priority : _PRIORITIES.HIGH},
        CUSTOM: { name:"custom", priority : _PRIORITIES.HIGH}
    };

    function makeStandardEvent(event) {
        var event = {eventName : event.name,
            time : (new Date()).toISOString()
        };
        return event;
    }

    var addPendingEvent = function(event, priority) {
        event["sequenceNum"] = this._currentSequenceNumber;
        updateNextFlushingTime.call(this,priority);
        console.log("Adding event "+ event["eventName"]);
        this._pendingEvents.push(event);
        this._currentSequenceNumber++;
    };

    function updateNextFlushingTime(priority) {
        var wouldBeNextFlushTime = Date.now() + this._priorityIntervals[priority];

        if( wouldBeNextFlushTime < this._flushTime){
            clearTimeout(this._flushTimeout);
            this._flushTimeout = setTimeout(function(){
                flushPendingEvents.call(this);
            }.bind(this), this._priorityIntervals[priority]);
            this._flushTime = Date.now() + this._priorityIntervals[priority];
        }
    }


    function sendJSONToServer(object) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', this._iqEndpoint);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        console.log("Sending json : ", JSON.stringify(object));
        xhr.send(JSON.stringify(object));
    }

    function trackPlayheadUpdate(positionMillis) {
        var event = makeStandardEvent(_EVENTS.PLAYHEAD_UPDATE);
        event["playheadPositionMillis"] = Math.floor(positionMillis);
        addPendingEvent.call(this, event, _EVENTS.PLAYHEAD_UPDATE.priority);
    }

    function trackTimePlayed(positionMillis) {
        var event = makeStandardEvent(_EVENTS.TIME_PLAYED);
        event["timePlayedMillis"] = positionMillis;
        addPendingEvent.call(this, event, _EVENTS.TIME_PLAYED.priority);
        this._timePlayed = 0;
    }

    function flushPendingEvents(){
        var time = Date.now()/1000;
        console.log("Time since last flush ",  time - this._lastFlush);
        var date = new Date();
        this._base.clientTime = date.toISOString();

        trackTimePlayed.call(this, this._timePlayedMillis);
        trackPlayheadUpdate.call(this, this._playheadPositionMillis);
        trackPlaythroughPercent.call(this);

        this._base.events = this._pendingEvents;
        console.log("flushing " + this._base.events.length);
        sendJSONToServer.call(this, this._base);
        this._pendingEvents = [];
        this._flushTime = Number.MAX_VALUE;

        this._lastFlush = time;
    }

    function trackPlaythroughPercent(){
        var percentage = (this._buckets.watchedCount / this._buckets.count) * 100;
        if(percentage >= this._nextPlaythroughToReport){
            var event = makeStandardEvent(_EVENTS.PLAYTHROUGH_PERCENT);
            event["percent"] = Math.floor(percentage);
            addPendingEvent.call(this, event,_EVENTS.PLAYTHROUGH_PERCENT.priority);
            this._nextPlaythroughToReport += 25;
        }
    }


    function computeBuckets(duration){
        var bucketDuration = duration/this._buckets.count;
        for (var i = 0; i < this._buckets.count; i++){
            this._buckets.startingTimes[i] = i * bucketDuration;
        }
    }

    function findBucketsForPlayheadPosition(position) {
        var found = false;
        var i = 0;
        var bucketIndex = 0;
        while (!found) {
            if ((i === this._buckets.count) || (this._buckets.startingTimes[i] > position)) {
                bucketIndex =  i -1;
                found = true;
            }
            else {
                i = i + 1;
            }
        }
        return bucketIndex;
    }

    function addViewedBucket(index) {
        if(!this._buckets.watched[index]){
            this._buckets.watched[index] = true;
            trackBucketWatchedFirstTime.call(this,index);
        }

        if(this._buckets.current !== index){
            trackBucketWatched.call(this,index);
            this._buckets.current = index;
        }

    }

    function trackBucketWatchedFirstTime(index) {
        var event = makeStandardEvent(_EVENTS.PERCENTAGE_WATCHED);
        event["startMille"] = index * 25 +1;
        event["endMille"] = index * 25 +25;
        addPendingEvent.call(this,event, _EVENTS.PERCENTAGE_WATCHED.priority);
        this._buckets.watchedCount++;
    }

    function trackBucketWatched(index) {
        var event = makeStandardEvent(_EVENTS.BUCKETS_WATCHED);
        event["startMille"] = index * 25 +1;
        event["endMille"] = index * 25 +25;
        addPendingEvent.call(this, event, _EVENTS.BUCKETS_WATCHED.priority);
    }



    function buildAndAddEventToPending(eventEnum) {
        var event = makeStandardEvent(eventEnum);
        addPendingEvent.call(this, event, eventEnum.priority);
    }


    Ooyala.Reporter = function (pCode, params) {
        this._base = {};
        this._base.asset = {idType : params.source}
        this._base.sessionId = params.guid;
        this._base.pcode = pCode;
        this._base.sessionStartTime = (new Date()).toISOString();
        this._base.analyticsSdkName = "ooyala-xbox-one-analytics-sdk";
        this._base.analyticsSdkVersion = "1.0.0";
        this._playheadPositionMillis = 0;
        //this._base.user = userInfo;
        //this._base.geo = geoInfo;
        this._base.device = {
            "id": "8J1gDIJtaKfh7H0KnrBAzG7Pa0KSONL3iHMouMZzHU4",
            "deviceInfo": {
                "browser": "chrome",
                "browserVersion": "33.0.1750.146",
                "os": "windows",
                "osVersion": "8.0",
                "deviceType": "console",
                "deviceBrand": "MicroSoft",
                "model": "Xbox One"
            }
        };

        this._lastFlush = 0;
        this._liveContent = false;
        this._contentDuration = 0;
        this._date = new Date();
        this._pendingEvents = [];
        this._currentSequenceNumber = 0;
        this._flushTime = Number.MAX_VALUE;
        this._timePlayed = 0;
        this._iqEndpoint = " http://ip-10-50-40-172.sjc1.ooyala.net:61057/session/xbox-qa-testing/v3/analytics/events" //FIXME
        this._priorityIntervals = [10000, 5000, 1000];
        this._seek = {start : 0, end : 0};
        this._lastTimePlayed = 0;
        this._hasContentStarted = false;
        this._flushTimeout = null;
        this._buckets = {watched : [], current : -1, startingTimes : [], count : 40, watchedCount : 0};
        this._nextPlaythroughToReport = 25; // We will report 25/50/75/100
    };



    Ooyala.Reporter.prototype = {
        reportPlayerLoad : function() {
            buildAndAddEventToPending.call(this, _EVENTS.PLAYER_LOAD);
        },
        initializeVideo : function(mediaId) {
            this._base.asset.id = mediaId;
        },
        setVideoDuration : function(durationMillis) {
            if(durationMillis <= 0) {
                this._liveContent = true;
            } else {
                computeBuckets.call(this, durationMillis);
            }
            buildAndAddEventToPending.call(this, _EVENTS.DISPLAY);
        },
        reportPlayRequested : function(autoplay) {
            var event = makeStandardEvent(_EVENTS.PLAY_REQUESTED);
            event["isAutoPlay"] = autoplay || false;
            addPendingEvent.call(this,event, _EVENTS.PLAY_REQUESTED.priority);
        },
        reportReplay : function() {
            var event = makeStandardEvent(_EVENTS.REPLAY);//FIXME AUTOPLAY
            event["isAutoPlay"] = false;
            addPendingEvent.call(this, event, _EVENTS.REPLAY.priority);
        },
        reportVideoStarted : function() {
            buildAndAddEventToPending.call(this, _EVENTS.VIDEO_STARTED);
        },
        reportPlayheadUpdate: function (playHeadPositionMillis) {
            //console.log("time update ", playHeadPositionMillis);
            this._timePlayed = this._timePlayed + (playHeadPositionMillis - this._lastTimePlayed);
            this._lastTimePlayed = playHeadPositionMillis;
            this._playheadPositionMillis = playHeadPositionMillis;
            this._timePlayedMillis = Math.floor(this._timePlayed);
            updateNextFlushingTime.call(this, _EVENTS.PLAYHEAD_UPDATE.priority);
            updateNextFlushingTime.call(this, _EVENTS.TIME_PLAYED.priority);

            if(!this._liveContent) {
                var bucketIndex = findBucketsForPlayheadPosition.call(this, playHeadPositionMillis);
                //We add the bucket to the viewed buckets
                addViewedBucket.call(this, bucketIndex);
            }
        },
        reportPause : function() {
            buildAndAddEventToPending.call(this, _EVENTS.PAUSE);
        },
        reportResume : function() {
            buildAndAddEventToPending.call(this, _EVENTS.RESUME);
        },
        reportSeek : function(startMillis, endMillis) {
            var event = makeStandardEvent(_EVENTS.SEEK);
            event["fromMillis"] = startMillis;
            event["toMillis"] = endMillis;
            addPendingEvent.call(this,event,_EVENTS.SEEK.priority);
        },
        reportComplete : function() {
            flushPendingEvents.call(this);
        }
    }
})(Ooyala);