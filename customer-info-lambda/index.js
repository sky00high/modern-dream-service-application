
var jwt = require('jsonwebtoken');
var User = require('./models/user.js');

exports.handler = function(event, context, callback) {
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
        default:
            var err = new Error('405 Unrecognized operation');
            err.name = 'Unrecognized operation "${event.operation}"';
            callback(err, null);
    }
};



function getUser(event, callback){
	User.scan().exec(function(err, resp){
		if (err){
			var err = new Error("500 User table access error");
			callback(err, null);
		} else{
			callback(null, JSON.stringify(resp.Items));
		}
	});
}

function createUser(event, callback){

	if(!event.username || !event.password){
		var err = new Error('400 Misising field for user');
		callback(err, null);
	}
	console.log("creating user");

	User.create({
		username : event.username,
		password : event.password
	}, {
		overwrite:false
	}, function (err, user){

		if(!err){
			console.log("user " + user.username + " created");
			callback(null, "Custumer created");

		} else{ 
			console.log("user  erred " + JSON.stringify(err));
			callback("400 User creation failure, detail:"  + JSON.stringify(err), null);
		}

	});

}

function loginUser(event, callback){

	if(!event.username || !event.password){
		var err = new Error('400 Misising field for user login');
		callback(err, null);
	}

    User.get(event.username, function(err, user){
    	if(err){
    		callback("500 User table query error", null);
    	} else{
    		if(!user){
    			callback("401 User does not exist", null);
    		}else if(user.attrs.password != event.password){
    			console.log(user);
    			callback("401 Wrong password", null);
    		}else{
    			callback(null, { jsonwebtoken: jwt.sign({username: user.attrs.username}, 'secret')});
    		}
    		callback("shouldn't be here", null);

    	}
    });


}