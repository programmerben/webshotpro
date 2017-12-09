'use strict';
var webshot = require('webshot');
var streamBuffers = require('stream-buffers');

// Since this file is simple.js, and this exported function is named 'snap',
// This is what is called for the simpleSnap handler: simple.snap
module.exports.snap = (event, context, callback) => {

  // Create a writeable stream buffer to allow for image to be dumped into a Buffer object
  var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer();

  // Example for logging
  console.log("Going to convert " + event.queryStringParameters['url'] + " into a PNG image");

  // Use webshot to open the URL passed in via a GET variable
  var renderStream = webshot(event.queryStringParameters['url'], { }).pipe(myWritableStreamBuffer);

  // When the image's data has been fully written to myWriteableStreamBuffer
  renderStream.on('finish', function() {

    // This response format is dictated by AWS
    const response = {
      headers: {
        "Content-type": "image/png"
      }, 
      statusCode: 200,

      // This is an AWS oddity, we need to encode binary responses as Base64 Data
      body: myWritableStreamBuffer.getContentsAsString('base64'),       

      // We set this flag which tells AWS it should render the base64ed data as binary
      isBase64Encoded: true
    };

    // This is how we return data back to AWS
    callback(null, response);
  });
};
