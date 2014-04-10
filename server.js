var http = require('http')
  , express = require('express')
  , swig = require('swig')
  , app = express()
  , amazon_client_id = process.env.AMAZON_CLIENT_ID
  , app_domain = process.env.APP_DOMAIN
  , aws_role_arn = process.env.AWS_ROLE_ARN
  , s3_bucket_name = process.env.S3_BUCKET_NAME
  , port = process.env.PORT || 5000;

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public/'));

app.get('/', function (req, res) {
  serve_index(req, res); 
});

app.get('/images', function (req, res) {
  var access_token = req.query.access_token;
  if (access_token == null || access_token == '') {
    serve_index(req, res);
  } else {
    serve_images(req, res);
  }
});

function serve_index(req, res) {
  res.render('index', {
    amazon_client_id: amazon_client_id,
    app_domain: app_domain
  });
}

function serve_images(req, res) {
  res.render('images', {
    access_token: req.query.access_token,
    aws_role_arn: aws_role_arn,
    s3_bucket_name: s3_bucket_name
  });
}

// initiate http server
var server = http.createServer(app);
server.listen(port);
console.log('http server listening on %d', port);
