var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000
  , s3_bucket_name = process.env.S3_BUCKET_NAME
  , s3_image_prefix = process.env.S3_IMAGE_PREFIX
  , auth_user = process.env.AUTH_USER
  , auth_password = process.env.AUTH_PASSWORD;

app.use(express.basicAuth(auth_user, auth_password));
app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var AWS = require('aws-sdk');
var s3 = new AWS.S3();


function stream_images(marker, ws) {
  s3.listObjects({Bucket: s3_bucket_name, Prefix: s3_image_prefix, MaxKeys: 5, Marker: marker}, function(err, data) {
    if(err != null) console.log("s3.listObjects [err]: " + err);
    if(data.Contents.length > 0) {
      var new_marker = data.Contents[data.Contents.length-1].Key
      for (var index in data.Contents) {
        s3.getObject({Bucket: s3_bucket_name, Key: data.Contents[index].Key, ResponseContentType: "image/jpeg"}, function(err, data) {
          if(err != null) console.log("s3.getObject [err]: " + err);
          ws.send(JSON.stringify({Marker: new_marker, Modified: data.LastModified, Body: data.Body.toString('base64')}), function() {});
        });
      }
    }
  });
}

var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {
    console.log('websocket connection open');
    ws.on('message', function(marker) {
        stream_images(marker, ws);
    });
    ws.on('close', function() {
        console.log('websocket connection close');
    });
});
