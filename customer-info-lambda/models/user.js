var Joi = require('joi');
var dynogels = require('dynogels');
dynogels.AWS.config.update({region: "us-east-1"});
var User = dynogels.define('User', {
  hashKey : 'email',
  schema : {
    email : Joi.string().email(),
    password : Joi.string().min(3).max(50).required(),
  }
});

module.exports = User;