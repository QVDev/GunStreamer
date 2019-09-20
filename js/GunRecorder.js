var recordState = {
  STOPPED: 1,
  RECORDING: 2,
  NOT_AVAILABLE: 3,
  UNKNOWN: 4,
};

class GunRecorder {
  constructor(config) {
    this.video = document.getElementById(config.video_id);
    this.mediaRecorder = null;
    this.onDataAvailable = config.onDataAvailable;
    this.onRecordStateChange = config.onRecordStateChange
    this.recorderOptions = {
      mimeType: config.mimeType,
      audioBitsPerSecond: config.audioBitsPerSecond,
      videoBitsPerSecond: config.videoBitsPerSecond
    }
    this.recordInterval = config.recordInterval
    this.cameraOptions = config.cameraOptions
    this.experimental = config.experimental;
    this.debug = config.debug;
    this.setRecordingState(recordState.UNKNOWN);
  }

  record() {
    if (this.recordState == recordState.RECORDING) {
      this.mediaRecorder.stop();
      clearInterval(this.experimentalTimerId);
      this.changeRecordState();
    } else if (this.recordState == recordState.STOPPED) {
      this.mediaRecorder = new MediaRecorder(gunRecorder.video.captureStream(), this.recorderOptions);
      this.mediaRecorder.ondataavailable = gunRecorder.onDataAvailable;
      if (this.experimental) {
        this.experimentalTimerId = setInterval(this.experimentalTimer, this.recordInterval);
        this.mediaRecorder.start();
      } else {
        this.mediaRecorder.start(this.recordInterval);
      }
      this.changeRecordState();
    } else {
      this.debugLog("The camera has not been initialized yet. First call startCamera()")
    }
  }

  //This will use a custom timer to make intervals witb start and stop recorder decrease latency test
  experimentalTimer() {
    if (gunRecorder.experimental) {
      // mediaRecorder.requestData() can we parse this manually?
      gunRecorder.mediaRecorder.stop()
      gunRecorder.mediaRecorder.start();
    }
  }

  startCamera() {
    if (this.recordState == recordState.RECORDING || this.recordState == recordState.STOPPED) {
      this.debugLog("Camera already started no need to do again");
      return;
    }
    var gunRecorder = this;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(this.cameraOptions).then(function (stream) {
        gunRecorder.video.srcObject = stream;
        gunRecorder.video.play();
      });
      this.setRecordingState(recordState.STOPPED);
    } else {
      this.setRecordingState(recordState.NOT_AVAILABLE);
    }
  }

  startScreenCapture() {
    if (this.recordState == recordState.RECORDING || this.recordState == recordState.STOPPED) {
      this.debugLog("ScreenCast already started no need to do again");
      return;
    }
    var gunRecorder = this;
    if (navigator.mediaDevices.getDisplayMedia && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia(this.cameraOptions).then(function (desktopStream) {
        navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(function (voiceStream) {
          let tracks = [desktopStream.getVideoTracks()[0], voiceStream.getAudioTracks()[0]]
          var stream = new MediaStream(tracks);
          gunRecorder.video.srcObject = stream;
          gunRecorder.video.play();
        });
      });
      this.setRecordingState(recordState.STOPPED);
    } else {
      this.setRecordingState(recordState.NOT_AVAILABLE);
    }
  }

  changeRecordState() {
    switch (this.recordState) {
      case recordState.STOPPED:
        this.setRecordingState(recordState.RECORDING);
        break;
      case recordState.NOT_AVAILABLE:
        this.debugLog("Sorry camera not available")
        break;
      case recordState.UNKNOWN:
        this.debugLog("State is unknown check if camera is intialized")
        break;
      default:
        this.setRecordingState(recordState.STOPPED);
        break;
    }
  }

  setRecordingState(recordState) {
    this.debugLog("STATE BEFORE::" + this.recordState);
    this.recordState = recordState;
    this.onRecordStateChange(this.recordState);
    this.debugLog("STATE AFTER::" + this.recordState);
  }

  debugLog(logData) {
    if (this.debug) {
      console.log(logData);
    }
  }
}
