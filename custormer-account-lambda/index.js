function CustomerAccountError(message) {
    this.name = "CustomerAccountError";
    this.message = message;
}
CustomerAccountError.prototype = new Error();

exports.handler = (event, context, callback) => {
    try {
        if(!event.email) {
            var err = new customerAccountError('400 Missing Field Error');
            call(err, null);
        }
        
        var dyn = require('aws-sdk');
    	var client = new dyn.DynamoDB.DocumentClient();
    	
    	var params = {
          TableName : 'orders',
          FilterExpression : 'email = :val',
          ExpressionAttributeValues : {':val' : event.email}
        };
        
        console.log('handler event: ' + JSON.stringify(event));
    	client.scan(params, callback);
    }  
    
    catch (err) {
        callback(err, null);
    }
	
}