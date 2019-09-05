onmessage = e => {
  const message = e.data;
  parseSelf(message);
};

var allClusterHex = "";
var initSegment = "";

function hex2buf(hex) {
  return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  })).buffer
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

function parseSelf(arrayBuffer) {

  var hex = buf2hex(arrayBuffer);
  var initSeg;

  var ebmlIndex = hex.indexOf("1a45dfa3");
  var clusterIndex = hex.indexOf("1f43b675");
  var trackIndex = hex.indexOf("1654ae6b");
  var cuesIndex = hex.indexOf("1c53bb6b");
  var segmentIndex = hex.indexOf("18538067");
  var infoIndex = hex.indexOf("1549a966");
  var seekIndex = hex.indexOf("114d9b74");


  if (ebmlIndex == -1 && clusterIndex == -1 && trackIndex == -1 && cuesIndex == -1 && segmentIndex == -1 && infoIndex == -1 && seekIndex == -1) {
    allClusterHex += hex;

  }


  if (ebmlIndex != -1) {
    initSeg = hex.substring(ebmlIndex, clusterIndex);
    var initArray = new Uint8Array(hex2buf(initSeg));
    var base64String = btoa(
      new Uint8Array(initArray)
        .reduce((onData, byte) => onData + String.fromCharCode(byte), '')
    );
    postMessage(base64String);
  }

  if (clusterIndex != -1) {
    if (allClusterHex.length != 0) {

      allClusterHex += hex.substring(0, clusterIndex);

      var clusters = new Uint8Array(hex2buf(allClusterHex));

      var base64String = btoa(clusters.reduce((onData, byte) => onData + String.fromCharCode(byte), ''))

      allClusterHex = "";
      postMessage(base64String);
    }
    var cluster = hex.substring(clusterIndex, hex.length);
    var dataIndex = cluster.indexOf("a3");
    var clusterStartString = cluster.substring(0, dataIndex + 2);
    allClusterHex += cluster;
  }
}
