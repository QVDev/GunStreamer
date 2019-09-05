var recordSate = {
  STOPPED: 1,
  RECORDING: 2,
  NOT_AVAILABLE: 3,
  UNKNOWN: 4,
};

const MIMETYPE = 'video/webm; codecs="opus,vp8"';
const RECORDER_TIME_SLICE = 300;
const CAMERA_OPTIONS = { video: true, audio: true }

class GunRecorder {
  constructor(config) {
    this.video = document.getElementById(config.video_id);
    this.mediaRecorder = null;
    this.onDataAvailable = config.onDataAvailable;
    this.onRecordStateChange = config.onRecordStateChange
    this.recorderOptions = {
      mimeType: MIMETYPE,
      audioBitsPerSecond: config.audioBitsPerSecond,
      videoBitsPerSecond: config.videoBitsPerSecond
    }
    this.debug = config.debug;
    this.setRecordingState(recordSate.UNKNOWN);
  }

  record() {
    if (this.recordSate == recordSate.RECORDING) {
      this.mediaRecorder.stop();
      this.changeRecordState();
    } else if (this.recordSate == recordSate.STOPPED) {
      this.mediaRecorder = new MediaRecorder(gunRecorder.video.captureStream(), this.recorderOptions);
      this.mediaRecorder.ondataavailable = gunRecorder.onDataAvailable;
      this.mediaRecorder.start(RECORDER_TIME_SLICE);
      this.changeRecordState();
    } else {
      this.debugLog("The camera has not been initialized yet. First call startCamera()")
    }
  }

  startCamera() {
    if (this.recordSate == recordSate.RECORDING || this.recordSate == recordSate.STOPPED) {
      this.debugLog("Camera already started no need to do again");
      return;
    }
    var gunRecorder = this;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(CAMERA_OPTIONS).then(function (stream) {
        gunRecorder.video.srcObject = stream;
        gunRecorder.video.play();
      });
      this.setRecordingState(recordSate.STOPPED);
    } else {
      this.setRecordingState(recordSate.NOT_AVAILABLE);
    }
  }

  changeRecordState() {
    switch (this.recordSate) {
      case recordSate.STOPPED:
        this.setRecordingState(recordSate.RECORDING);
        break;
      case recordSate.NOT_AVAILABLE:
        this.debugLog("Sorry camera not available")
        break;
      case recordSate.UNKNOWN:
        this.debugLog("State is unknown check if camera is intialized")
        break;
      default:
        this.setRecordingState(recordSate.STOPPED);
        break;
    }
  }

  setRecordingState(recordSate) {
    this.debugLog("STATE BEFORE::" + this.recordSate);
    this.recordSate = recordSate;
    this.onRecordStateChange(this.recordSate);
    this.debugLog("STATE AFTER::" + this.recordSate);
  }

  debugLog(logData) {
    if (this.debug) {
      console.log(logData);
    }
  }
}
