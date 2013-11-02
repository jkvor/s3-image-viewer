var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , moment = require('moment')
  , port = process.env.PORT || 5000
  , s3_bucket_name = process.env.S3_BUCKET_NAME
  , s3_image_prefix = process.env.S3_IMAGE_PREFIX
  , auth_user = process.env.AUTH_USER
  , auth_password = process.env.AUTH_PASSWORD
  , s3_batch_size = 5;

// setup express authentication and static assets
app.use(express.basicAuth(auth_user, auth_password));
app.use(express.static(__dirname + '/'));

// initiate http server
var server = http.createServer(app);
server.listen(port);
console.log('http server listening on %d', port);

// establish connection to s3
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

function stream_images(marker, ws) {
  // fetch a batch of object names/meta data from s3
  s3.listObjects({Bucket: s3_bucket_name, Prefix: s3_image_prefix, MaxKeys: s3_batch_size, Marker: marker}, function(err, list_data) {
    if(err != null) { console.log("s3.listObjects [err]: " + err); return; }
    if(list_data.Contents.length > 0) {
      var new_marker = list_data.Contents[list_data.Contents.length-1].Key;
      var payload = new Array();
      collect_and_stream_images(ws, list_data, 0, payload, new_marker);
    }
  });
}

function collect_and_stream_images(ws, list_data, index, payload, new_marker) {
  s3.getObject({Bucket: s3_bucket_name, Key: list_data.Contents[index].Key, ResponseContentType: "image/jpeg"}, function(err, obj_data) {
    if(err != null) console.log("s3.getObject [err]: " + err);
    payload.push({Modified: moment(obj_data.LastModified).format("dddd, MMMM Do YYYY, h:mm:ss a"), Body: obj_data.Body.toString('base64')});
    if (index == list_data.Contents.length-1) {
      console.log("sending " + payload.length + " images");
      ws.send(JSON.stringify({Marker: new_marker, Images: payload}), function() {});
    } else {
      collect_and_stream_images(ws, list_data, index+1, payload, new_marker);
    }
  });
}

// initiate WebSocket server
var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {
  console.log('websocket connection open');
  ws.on('message', function(marker) {
    // fetch a batch of images from s3 and stream the content to the client
    stream_images(marker, ws);
  });
  ws.on('close', function() {
    console.log('websocket connection close');
  });
  setInterval(function(){
    ws.send(JSON.stringify({Heartbeat: 1}));
  }, 30 * 1000);
});
