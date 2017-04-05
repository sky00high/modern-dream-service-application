var AWS = require('aws-sdk');
var stripe = require("stripe")("sk_test_JCy56FAehenafOCX4DpsLILx");
var jwt = require('jsonwebtoken');

function OrderError(message) {
   this.name = "OrderError";
   this.message = message;
}
OrderError.prototype = new Error();

exports.handler = function(event, context, callback) {
    try{
        var operation = event.operation;

        switch (operation) {
            case ('read'):
                console.log("*** operation : read");
                getOrders(event, callback);
                break;
            case ('create'):
                createOrder(event, callback);
                break;
            default:
                var err = new CustomerInfoError('405 Unrecognized operation Error');
                callback(err, null);
        }
    } catch (err){
        callback(err, null);
    }
};

function getOrders(event, callback){
    var userToken = event.userToken; 
    console.log("userToken: " + userToken);
    var userEmail = jwt.verify(userToken, 'secret');
    console.log("userEmail: " + userEmail);
    
    AWS.config.update({
        region: "us-east-1",
    });

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: "orders",
        FilterExpression : 'email = :val', 
        ExpressionAttributeValues : {':val' : userEmail}
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            err = new OrderError("500 Order table access Error");
            callback(err, null);
        } else{
            callback(null, data.Items);
        }
    });
}

function createOrder(event, callback){
    var stripeToken = event.stripeToken;
    var itemID = event.itemID;

    var userToken = event.userToken; 
    var userEmail = jwt.verify(userToken, 'secret');

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: "orders"
    };

    stripe.customers.create({
        source: stripeToken,
    }).then(function(customer) { 
        var date = new Date();
        var orderID = (+date).toString(36);

        var docClient = new AWS.DynamoDB.DocumentClient();

        var params = {
            TableName: "orders",
            Item: {
                "orderID": orderID,
                "userEmail" : userEmail,
                "itemID" : itemID,
                "timestamp" : date.toString(),
                "price" : "$10.00"
            }
        };

        docClient.put(params, function(err, data) {
            if (err) {
                err = new OrderError("500 Order table access Error");
                callback(err, null);
            } else {
                return stripe.charges.create({ 
                    amount: 100,
                    currency: "usd",
                    customer: customer.id,
                    metadata : {orderID : orderID},
                });
            }
        });
    });
    
}






