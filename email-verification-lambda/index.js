var params = {
  Destination: { /* required */

    ToAddresses: [
      'tianyu0726@gmail.com',
      /* more items */
    ]
  },
  Message: { /* required */
    Body: { /* required */
      Html: {
        Data: 'lalala', /* required */
      }
    },
    Subject: { /* required */
      Data: 'Please verify your email', /* required */
    }
  },
  Source: 'ty2345@columbia.edu'

};


var AWS = require('aws-sdk');
var crypto = require('crypto');
var cipher = crypto.createCipher('aes192', 'password');

exports.handler = (event, context, callback) => {
    var ses = new AWS.SES();
    var email = event.toAddress;

    var encrypted = cipher.update(email,'utf8', 'hex');
    encrypted += cipher.final('hex');


    var link = 'https://fbhkc2kin1.execute-api.us-east-1.amazonaws.com/prod/customers/verify?cipher=' + encrypted;
    var html = '<!DOCTYPE html>\
<html>\
<body>\
<h1>Please click on the link below to verify your email</h1>\
<p><a href="' + link + '">' + link '</a>.</p>\
</body>\
</html>';
    params.Destination.ToAddresses[0] = event.toAddress;
    params.Message.Body.Html.Data = html;
    ses.sendEmail(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });

};