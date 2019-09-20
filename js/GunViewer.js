
class GunViewer {
    constructor(config) {
        this.mimeType = config.mimeType;
        this.video = document.getElementById(config.streamerId);
        this.mediaBuffer = new Mediabuffer(this.video, null, null, true, null, config.catchup);
        this.mediaSource = new MediaSource();
        this.debug = config.debug;
        this.lastTime = 0;
        this.init();
    }

    init() {
        if (this.video !== null) {
            this.mediaBuffer.load();
            this.video.src = window.URL.createObjectURL(this.mediaSource);
            this.mediaSource.addEventListener('sourceopen', () => {
                this.sourceBuffer = this.addSourceBuffer(this.mimeType);
                this.sourceBuffer.mode = 'sequence';
                // Get video segments and append them to sourceBuffer.
                this.debugLog("Source is open and ready to append to sourcebuffer");
            });
        } else {
            this.debugLog("There is no video present with this ID");
        }
    }

    showDelay() {
        let currentTime = new Date().getTime();
        if (this.lastTime != 0) {
            var delay = (currentTime - this.lastTime) / 1000;
            this.debugLog("current delay::" + delay);
            this.mediaBuffer.addDelay(delay);
            this.debugLog("Average Media delay::" + this.mediaBuffer.getAverageDelay());
        }
        this.lastTime = currentTime;
    }

    onStreamerData(userData) {
        this.showDelay()
        this.debugLog(userData);
        if (this.video.readyState != 0) {
            this.debugLog("regular data")
            this.appendBuffer(userData.data);
        } else {
            this.debugLog("initial data")
            this.appendBuffer(userData.initial);
        }

        if (this.video.readyState >= 2 && this.video.paused) {
            this.video.play();
        }
    }

    appendBuffer(base64Data) {
        let byteCharacters = atob(base64Data);
        let byteArray = this.str2ab(byteCharacters);

        if (!this.mediaSource.sourceBuffer.updating) {
            this.debugLog("append to buffer")
            this.mediaSource.sourceBuffer.appendBuffer(byteArray);
        } else {
            this.debugLog("BUFFER STILL BUSY")
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
