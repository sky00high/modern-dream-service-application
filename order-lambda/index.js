var AWS = require('aws-sdk');
var stripe = require("stripe")("sk_test_JCy56FAehenafOCX4DpsLILx");
var jwt = require('jsonwebtoken');
var request = require("request");

function OrderError(message) {
   this.name = "OrderError";
   this.message = message;
}
OrderError.prototype = new Error();

exports.handler = function(event, context, callback) {
    console.log("**** event *****");
    console.log(event);

    try{
        var operation = event.operation;

        switch (operation) {
            case ('read'):
                // 这里直接call order的lambda, 参数：operation:"read",emial:event.email
                getOrders(event, callback);
                break;
            case ('create'):
                // 这里先call Stripe lambda, 参数：stripeToken:event.stripeToken
                createOrder(event, callback);

                // 确认成功则call order 参数:event.itemID 和 event.email,否则返回
                break;
            default:
                var err = new OrderError('405 Unrecognized operation Error');
                callback(err, null);
        }
    } catch (err){
        callback(err, null);
    }
};

function getOrders(event, callback) {
    var aws = require('aws-sdk');
    var lambda = new aws.Lambda({
        region: 'us-east-1' 
    });

    console.log("**** 111 *****");

    lambda.invoke({
        FunctionName: 'order-database-lambda',
        Payload: JSON.stringify(event, null, 2) // pass params
    }, function(error, data) {
        if (error) {
            console.log("======== a error===");
            context.done('error', error);
        }
        if (data.Payload) {
            var payload = JSON.parse(data.Payload);

            var list = payload.items;
            

            result = {items : list,
                      email : event.userEmail
                     };

            callback(null, result);
            // callback(null, data.Payload.items);
        }
    });
}

function createOrder(event, callback){
    console.log("come into createOrder");
    var stripeToken = event.stripeToken;
    console.log("*** stripeToken : " + stripeToken + " ***");
    console.log("*** itemID : " + event.itemID + " ***");
    console.log("*** userEmail : " + event.userEmail + " ***");

    var itemID = event.itemID;
    var userEmail = event.userEmail;

    var aws = require('aws-sdk');
    var lambda = new aws.Lambda({
        region: 'us-east-1' 
    });

    var date = new Date();
    var orderID = (+date).toString(36);
    event.orderID = orderID;
    event.date = date;
    console.log("**** new even *****");
    console.log(event);

    lambda.invoke({
        FunctionName: 'stripe-lambda',
        Payload: JSON.stringify(event, null, 2) // pass params
    }, function(error, data) {
        if (error) {
            console.log("======== a error===");
            context.done('error', error);
        }
        if (data.Payload) {
            var payload = JSON.parse(data.Payload);
            console.log(payload);
            console.log(typeof(payload));

            if (payload == "fail") {
                callback(null, "fail");
            }

            writeOrdersDatabase(event, callback);
            // callback(null, data.Payload.items);
        }
    });

function writeOrdersDatabase(event, callback) {
    var aws = require('aws-sdk');
    var lambda = new aws.Lambda({
        region: 'us-east-1' 
    });

    console.log("**** 222 *****");

    lambda.invoke({
        FunctionName: 'order-database-lambda',
        Payload: JSON.stringify(event, null, 2) // pass params
    }, function(error, data) {
        if (error) {
            console.log("======== a error===");
            context.done('error', error);
        }
        if (data.Payload) {
            var payload = JSON.parse(data.Payload);
            callback(null, "end");
            // callback(null, data.Payload.items);
        }
    });
}

    // var docClient = new AWS.DynamoDB.DocumentClient();
    // var params = {
    //     TableName: "orders"
    // };

    // stripe.customers.create({
    //     source: stripeToken,
    // }).then(function(customer) { 
    //     var date = new Date();
    //     var orderID = (+date).toString(36);

    //     var docClient = new AWS.DynamoDB.DocumentClient();

    //     var params = {
    //         TableName: "orders",
    //         Item: {
    //             "orderID": orderID,
    //             "userEmail" : userEmail,
    //             "itemID" : itemID,
    //             "timestamp" : date.toString(),
    //             "price" : "$10.00"
    //         }
    //     };

    //     docClient.put(params, function(err, data) {
    //         if (err) {
    //             err = new OrderError("500 Order table access Error");
    //             callback(err, null);
    //         } else {
    //             return stripe.charges.create({ 
    //                 amount: 100,
    //                 currency: "usd",
    //                 customer: customer.id,
    //                 metadata : {orderID : orderID},
    //             });
    //         }
    //     });
    // });
    
}






