const Router = require('koa-router');
const router = new Router();
const koaBody = require('koa-body');
const AWS = require('aws-sdk');
const stream = require('stream');
const formidable = require('formidable');

const s3 = new AWS.S3({
  accessKeyId: 'minioadmin' ,
  secretAccessKey: 'minioadmin' ,
  endpoint: 'http://127.0.0.1:9000' ,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
})

var s3Stream = require('s3-upload-stream')(s3);

router.post('/upload', async (ctx, next) => {
  const form = new formidable.IncomingForm();

  form.on('error', function(err) {
    console.log('err', err);
  });

  form.on('aborted', function() {
    console.log('aborted');
  });

  form.on('end', function() {
    console.log('end');
  });

  form.onPart = function(part) {
    console.log('part',part);

    if (part.name === 'file') {
      var upload = s3Stream.upload({
        Bucket: 'koa-multipart-stream-to-s3',
        Key: 'testFile'
      });

      upload.on('error', function (error) {
        console.log('errr',error);
      });
      upload.on('part', function (details) {
        console.log('part',details);
      });
      upload.on('uploaded', function (details) {
        console.log('uploaded');
      });

      // Maybe you could add compress like
      // part.pipe(compress).pipe(upload)
      part.pipe(upload);
    }
  };

  await new Promise((resolve, reject) => {
    form.parse(ctx.req, (err, fields, files) => {
      console.log(err);

      ctx.set('Content-Type', 'application/json');
      ctx.status = 200;
      resolve();
    });
  });

  await next();
  return;
});

const Koa = require('koa');
const app = new Koa();

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);