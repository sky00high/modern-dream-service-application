
var jwt = require('jsonwebtoken');
var User = require('./models/user.js');
var Joi = require('joi');


function CustomerInfoError(message) {
   this.name = "CustomerInfoError";
   this.message = message;
}
CustomerInfoError.prototype = new Error();

exports.handler = function(event, context, callback) {
    try{
        console.log('handler event: ' + JSON.stringify(event));
        console.log('handler context: ' + JSON.stringify(context));
        
        var operation = event.operation;

        switch (operation) {
            case ('read'):
                getUser(event, callback);
                break;
            case ('create'):
                createUser(event, callback);
                break;
            case ('login'):
            	loginUser(event, callback);
            	break;
            case ('verify'):
                verifyUser(event, callback);
                break;
            default:
                var err = new CustomerInfoError('405 Unrecognized operation Error');
                callback(err, null);
        }
    } catch (err){
        callback(err, null);
    }
};



function getUser(event, callback){
	User.scan().exec(function(err, resp){
		if (err){
			var err = new CustomerInfoError("500 User table access Error");
			callback(err, null);
		} else{
			callback(null, JSON.stringify(resp.Items));
		}
	});
}

function createUser(event, callback){

	if(!event.email || !event.password){
		var err = new CustomerInfoError('400 Missing Field Error');
		callback(err, null);
	}
	console.log("creating user");

	User.create({
		email : event.email,
		password : event.password,
        verified : false
	}, {
		overwrite:false
	}, function (err, user){

		if(!err){
			console.log("user " + user.email + " created");
			callback(null, { "message" : "Customer Created!", "RequestPassthrough" : event});

		} else{ 
			console.log("user  erred " + JSON.stringify(err));
            var err = new CustomerInfoError("400 User Creation Error, Please make sure your email is valid and password is between 3 to 50 characters");
			callback(err, null);
		}

	});

}

function loginUser(event, callback){

	if(!event.email || !event.password){
		var err = new Error('400 Misising field for user login');
		callback(err, null);
	}


    Joi.validate(event.email, Joi.string().email().required(), function (err, value) { 

        if(err){
            callback("401 email validation error", null);
        } else{

            User.get(event.email, function(err, user){
                if(err){
                    console.log(err);
                    callback("500 User table query error", null);
                } else{
                    if(!user){
                        callback("401 User does not exist", null);
                    }else if(user.attrs.password != event.password){
                        console.log(user);
                        callback("401 Wrong password", null);
                    }else if(user.get('verified') == false){
                        callback("401 Account not verified");
                    }else{
                        callback(null, { jsonwebtoken: jwt.sign({email: user.attrs.email}, 'secret')});
                    }
                }
            });
        }

    });


}

function verifyUser(event, callback){

    var cipher = event.cipher;
    var crypto = require('crypto');
    var decipher = crypto.createDecipher('aes192', 'password');

    
    var decrypted = decipher.update(cipher, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    

    User.get(decrypted, function(err, user){
        if(err){
            console.log(err);
            callback("500 User table query error", null);
        } else{
            if(!user){
                callback("401 invalid link", null);
            }else if(user.get('verified')){
                console.log(user);
                callback("401 Account already verified", null);
            }else{
                User.update({email: decrypted, verified: true}, (err, acc) =>{
                    if(err){
                        callback("500 user updating error", null);

                    } else{
                        callback(null, "Verify successful");
                    }
                });
            }
        }
    });

}