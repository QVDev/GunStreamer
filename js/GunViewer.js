
class GunViewer {
    constructor(config) {
        this.mimeType = config.mimeType;
        this.video = document.getElementById(config.streamerId);
        this.mediaBuffer = new Mediabuffer(this.video, null, null);
        this.mediaSource = new MediaSource();
        this.debug = config.debug;
        this.lastTime = 0;
        this.init();
    }

    init() {
        if (this.video !== null) {
            this.mediaBuffer.load();
            this.video.src = window.URL.createObjectURL(this.mediaSource);
            this.mediaSource.addEventListener('sourceopen', function () {
                this.sourceBuffer = this.addSourceBuffer(gunViewer.mimeType);
                this.sourceBuffer.mode = 'sequence';
                // Get video segments and append them to sourceBuffer.
                gunViewer.debugLog("Source is open and ready to append to sourcebuffer");
            });
        } else {
            this.debugLog("There is no video present with this ID");
        }
    }

    showDelay() {
        let currentTime = new Date().getTime();
        if (gunViewer.lastTime != 0) {
            var delay = (currentTime - gunViewer.lastTime) / 1000;
            gunViewer.debugLog("current delay::" + delay);
            gunViewer.mediaBuffer.addDelay(delay);
            gunViewer.debugLog("Average Media delay::" + gunViewer.mediaBuffer.getAverageDelay());
        }
        gunViewer.lastTime = currentTime;
    }

    onStreamerData(userData) {
        gunViewer.showDelay()
        gunViewer.debugLog(userData);
        if (gunViewer.video.readyState != 0) {
            gunViewer.debugLog("regular data")
            gunViewer.appendBuffer(userData.data);
        } else {
            gunViewer.debugLog("initial data")
            gunViewer.appendBuffer(userData.initial);
        }

        if (gunViewer.video.readyState >= 2 && gunViewer.video.paused) {
            gunViewer.video.play();
        }
    }

    appendBuffer(base64Data) {
        let byteCharacters = atob(base64Data);
        let byteArray = gunViewer.str2ab(byteCharacters);

        if (!gunViewer.mediaSource.sourceBuffer.updating) {
            gunViewer.debugLog("append to buffer")
            gunViewer.mediaSource.sourceBuffer.appendBuffer(byteArray);
        } else {
            gunViewer.debugLog("BUFFER STILL BUSY")
        }

        byteCharacters = null;
        byteArray = null;
    }

    str2ab(str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        bufView = null;
        return buf;
    }

    debugLog(logData) {
        if (this.debug) {
            console.log(logData);
        }
    }
}