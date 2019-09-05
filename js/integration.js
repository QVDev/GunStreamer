//Configure GUN to pass to streamer
var peers = ['https://gunmeetingserver.herokuapp.com/gun'];
var opt = { peers: peers, localStorage: false, radisk: false };
var gunDB = Gun(opt);

//Config for the GUN GunStreamer
var streamer_config = {
  dbRecord: "gunmeeting",//The root of the streams
  streamId: "qvdev",//The user id you wanna stream
  gun: gunDB,//Gun instance
  debug: false//For debug logs
}

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
  video_id: "record_video",//Video html element id
  onDataAvailable: gunStreamer.onDataAvailable,//MediaRecorder data available callback
  onRecordStateChange: onRecordStateChange,//Callback for recording state
  audioBitsPerSecond: 6000,//Audio bits per second this is the lowest quality
  videoBitsPerSecond: 100000,//Video bits per second this is the lowest quality
  debug: false//For debug logs
}

//Init the recorder
const gunRecorder = new GunRecorder(recorder_config);
