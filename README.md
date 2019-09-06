# GunStreamer
Streaming components for Gun db. [See here for a working example](https://qvdev.github.io/GunStreamer)

# Integration
For an example use the index.html and the .js folder. 

### HTML
```html
<head>
...
  <script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/QVDev/GunStreamer@0.0.2/js/GunRecorder.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/QVDev/GunStreamer@0.0.2/js/GunStreamer.js"></script>
 ... 
</head>
```

```html
<body>
...
  <button type="button" onclick="gunRecorder.startCamera()">Start Camera</button>
  <button id="record_button" type="button" onclick="gunRecorder.record()">Start Recording</button>
  <br><br>
  <video id="record_video" width="20%" poster="https://www.srsd.net/images/video-poster.png" autoplay controls muted /><!-- Streamer -->
  <video id="qvdev" width="20%" poster="https://www.srsd.net/images/video-poster.png" autoplay muted/><!-- Viewer id is equal to streamId -->
  <script src="https://cdn.jsdelivr.net/gh/QVDev/GunStreamer@0.0.2/js/integration.js"></script><!-- Default integration -->
 ...
</body>
```

### initialiation.js 
In case you are not using the default integration. You can create own initialiation.js The gun part, writing to gun and publish it.
Just make sure to refer it at the end of the body as a script.

```javascript
//Basic configurations for mime types
onst MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp8"';
const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';

//Configure GunViewer 
var viewer_config = {
  mimeType: MIMETYPE_VIDEO_ONLY,
  streamerId: "qvdev",//ID of the streamer
  debug: false,//For debug logs  
}

var gunViewer = new GunViewer(viewer_config);

//Configure GUN to pass to streamer
var peers = ['https://gunmeetingserver.herokuapp.com/gun'];
var opt = { peers: peers, localStorage: false, radisk: false };
var gunDB = Gun(opt);

Get data from gun and pass along to viewer
gunDB.get("qvdev").on(function (data) {
  //Make sure the video is in the html or create on here dynamically.
  gunViewer.onStreamerData(data);
});
```

```javascript
//Config for the GUN GunStreamer
var streamer_config = {
  dbRecord: "gunmeeting",//The root of the streams
  streamId: "qvdev",//The user id you wanna stream
  // gun: gunDB,//Gun instance
  debug: false,//For debug logs
  onStreamerData: gunViewer.onStreamerData//If you want manually handle the data manually
}
```

```javascript
//GUN Streamer is the data side. It will convert data and write to GUN db
const gunStreamer = new GunStreamer(streamer_config)

//This is a callback function about the recording state, following states possible
// STOPPED: 1¸
// RECORDING:2
// NOT_AVAILABLE:3
// UNKNOWN:4
var onRecordStateChange = function (state) {
  var recordButton = document.getElementById("record_button");
  switch (state) {
    case recordSate.RECORDING:
      recordButton.innerText = "Stop recording";
      break;
    default:
      recordButton.innerText = "Start recording";
      break;
  }
}

//Config for the gun recorder
var recorder_config = {
  mimeType: MIMETYPE_VIDEO_ONLY,
  video_id: "record_video",//Video html element id
  onDataAvailable: gunStreamer.onDataAvailable,//MediaRecorder data available callback
  onRecordStateChange: onRecordStateChange,//Callback for recording state
  audioBitsPerSecond: 6000,//Audio bits per second this is the lowest quality
  videoBitsPerSecond: 100000,//Video bits per second this is the lowest quality
  experimental: true,//This is custom time interval and very unstable with audio. Only video is more stable is interval quick enough? Audio
  debug: false//For debug logs
}

//Init the recorder
const gunRecorder = new GunRecorder(recorder_config);
```
