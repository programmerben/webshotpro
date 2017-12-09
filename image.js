'use strict';
var crypto  = require('crypto');
var webshot = require('webshot');

var streamBuffers = require('stream-buffers');

module.exports.snap = (event, context, callback) => {
  //console.log(event, context);
  // Make sure we're authorized
  var path_params = event.pathParameters.proxy;

  var parts = path_params.split('/');

  if (parts.length != 3 || !event.queryStringParameters['url']) {
    return callback("Invalid request");
  }

  if (parts[0] != process.env['API_KEY']) {
    return callback("Invalid API key");
  }

  // Verify the HMAC-SHA1 of the secret and URL matches
  var hmac = crypto.createHmac('sha1', process.env['API_SECRET']);
  
  var signed_fields = process.env['SIGNATURE_FIELDS'].split(',');

  signed_fields.forEach(function(field) {
    hmac.write(event.queryStringParameters[field] || 'none');
  });

  hmac.end();

  var hash = hmac.read().toString('hex');

  if (parts[1] != hash) {
    return callback("Invalid hash, should have been " + hash);
  }

  if (parts[2] !== 'png') {
    return callback("Only png type is supported currently.");
  }

  var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();

  var options = {};

  if (event.queryStringParameters && event.queryStringParameters['width']) {
    if (!options.windowSize) {
      options.windowSize = {};
    }

    options.windowSize.width = event.queryStringParameters['width']; 
  }

  if (event.queryStringParameters && event.queryStringParameters['height']) {
    if (!options.windowSize) {
      options.windowSize = {};
    }

    options.windowSize.height = event.queryStringParameters['height']; 
  }

  if (event.queryStringParameters && event.queryStringParameters['delay']) {
    options.renderDelay = event.queryStringParameters['delay']; 
  }

  if (event.queryStringParameters && event.queryStringParameters['selector']) {
    options.captureSelector = event.queryStringParameters['selector']; 
  }

  if (event.queryStringParameters && event.queryStringParameters['quality']) {
    options.quality = event.queryStringParameters['quality']; 
  }


  if (event.queryStringParameters && event.queryStringParameters['thumb_width']) {
    if (!options.shotSize) {
      options.shotSize = {};
    }

    options.shotSize.width = event.queryStringParameters['thumb_width']; 
  }  

  if (event.queryStringParameters && event.queryStringParameters['thumb_height']) {
    if (!options.shotSize) {
      options.shotSize = {};
    }

    options.shotSize.height = event.queryStringParameters['thumb_height']; 
  }  

  if (event.queryStringParameters && event.queryStringParameters['offset_left']) {
    if (!options.shotOffset) {
      options.shotOffset = {};
    }

    options.shotOffset.left = event.queryStringParameters['offset_left']; 
  }  

  if (event.queryStringParameters && event.queryStringParameters['offset_right']) {
    if (!options.shotOffset) {
      options.shotOffset = {};
    }

    options.shotOffset.right = event.queryStringParameters['offset_right']; 
  }  

  if (event.queryStringParameters && event.queryStringParameters['offset_top']) {
    if (!options.shotOffset) {
      options.shotOffset = {};
    }

    options.shotOffset.top = event.queryStringParameters['offset_top']; 
  }  

  if (event.queryStringParameters && event.queryStringParameters['offset_bottom']) {
    if (!options.shotOffset) {
      options.shotOffset = {};
    }

    options.shotOffset.bottom = event.queryStringParameters['offset_bottom']; 
  }  

  var renderStream = webshot(event.queryStringParameters['url'], options).pipe(myWritableStreamBuffer);

  renderStream.on('finish', function() {
    const response = {
      headers: {
        "Content-type": "image/png"
      }, 
      statusCode: 200,
      body: myWritableStreamBuffer.getContentsAsString('base64'),
      isBase64Encoded: true
    };

    callback(null, response);
  });
};
