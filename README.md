# IQ Javascript adapter for Xbox One

## How to use

To use the xbox adapter, include it as a javascript file to your project, as well as the IQ Javascript library.
Add both scripts to your video player page (the library and adapter file are in the `iq/` folder in this demo):

```
<!DOTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>xboxIQSample</title>
    <link href="lib/winjs-4.0.1/css/ui-light.css" rel="stylesheet" />
    <script src="lib/winjs-4.0.1/js/base.js"></script>
    <script src="lib/winjs-4.0.1/js/ui.js"></script>
    <link href="css/default.css" rel="stylesheet" />
    <script src="js/main.js"></script>
    <script src="lib/iq/iq-html5-1.0.16.10.0.js"></script>
    <script src="lib/iq/xbox_adapter.js"></script>
</head>
<body class="win-type-body">
    <div>
        <video id="player" src="http://content.jwplatform.com/videos/QFAzrVt9-ZILKNsM1.mp4" style="width:100%;height:100%"></video>
    </div>
</body>

   
</html>
```

Then create a XboxOneReporter from your video player.

```
var player = document.getElementById("player");
//Set the content ID of the video on the video element itself
player.setAttribute('data-oo-embedId', "k4cWdsdzoTxuCp6lyBN7TSTsI6OmdII9");
new Ooyala.Analytics.XboxOneReporter("pcode", player);
```


Custom events can be reported:

```
myXboxOneReporter.reportCustomEvent("eventName" { metadata1: value, ...});
```

## Sample app

The sample app xboxIQSample located in the `demo/` folder runs as a UWA on Windows 10. It uses the WinJS framework and simply shows how an HTML5 video can send events to IQ.

To run it, Windows 10 and Visual Studio 2015 are needed.