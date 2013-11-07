## About

Web application for viewing a series of images stored in an Amazon S3 bucket.

## Setup

```
$ heroku create
$ heroku labs:enable websockets
$ git push heroku master
```

## Env vars

```
$ heroku config:add \
  AWS_ACCESS_KEY_ID= \
  AWS_SECRET_ACCESS_KEY= \
  S3_BUCKET_NAME= \
  AUTH_USER= \
  AUTH_PASSWORD= \
  MOMENT_TZ="America/Los_Angeles"
```

`MOMENT_TZ` var is based on moment.js [timezone data](http://momentjs.com/timezone/data/)
