## About

Web application for viewing a series of images stored in an Amazon S3 bucket.

![](http://f.cl.ly/items/0g421M3G2f3p2O0V1r2l/s3-image-viewer.png)

## Setup

### Clone repo

https://github.com/JacobVorreuter/s3-image-viewer

### Create a Heroku app

```
$ heroku create
$ git push heroku master
```

### Login with Amazon

* Register an app with Login for Amazon: http://login.amazon.com/manageApps
* Populate the **Privacy Notice URL** with your `http://myapp.herokuapp.com` URL
* Populate the **Allowed JavaScript Origins** URL with your `https://myapp.herokuapp.com` URL (notice the https)
* Take note of the Client ID and App ID. You'll need those in the following sections

### Create an IAM Role

https://console.aws.amazon.com/iam/home#roles

#### IAM Role Policy

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::<S3_BUCKET_NAME>"
      ]
    },
    {
      "Sid": "",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::<S3_BUCKET_NAME>/*"
      ]
    }
  ]
}
```

#### IAM Role Trust Relationship

You can figure out your Login with Amazon User ID with this API:

`curl -v -H "Authorization: bearer ACCESS_TOKEN" "https://api.amazon.com/user/profile"`

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Federated": "www.amazon.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "www.amazon.com:user_id": "<USER_ID>",
          "www.amazon.com:app_id": "<AMAZON_APP_ID>"
        }
      }
    }
  ]
}
```

### S3 bucket CORS configuration:

https://console.aws.amazon.com/s3/home

Navigate to your S3 bucket properties and select `Add CORS Configuration`.

```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedHeader>*</AllowedHeader>
        <AllowedOrigin>https://myapp.herokuapp.com</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
    </CORSRule>
</CORSConfiguration>
```

### Heroku Env vars

Set the following env vars

```
$ heroku config:add \
  AMAZON_CLIENT_ID= \
  AWS_ROLE_ARN= \
  S3_BUCKET_NAME= \
  APP_DOMAIN=myapp.herokuapp.com
```

### Open in browser

Open `https://myapp.herokuapp.com` in your browser (it only works via HTTPS) and login with your Amazon credentials.
