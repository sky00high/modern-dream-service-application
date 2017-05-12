var AWS = require('aws-sdk');
var stripe = require("stripe")("sk_test_JCy56FAehenafOCX4DpsLILx");
var jwt = require('jsonwebtoken');

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
    console.log("come into getOrders");
    var userEmail = event.userEmail;
    console.log("userEmail: " + userEmail);
    
    AWS.config.update({
        region: "us-east-1",
    });

    var docClient = new AWS.DynamoDB.DocumentClient();
    var orderID = event.orderID;
    console.log(typeof(orderID));
    console.log("orderID:" + orderID);
    var orderIDstring = orderID.toString();

    if (orderID != null) {// 是不是这么判断的啊
        console.log("orderID is :" + orderID);
        var params = {
            TableName: "orders",
            Key:{
                "orderID": orderIDstring
            }
        };
        docClient.get(params, function(err, data) {
            if (err) {
                console.log(JSON.stringify(err, undefined, 2));
                callback(err, (JSON.stringify(err, undefined, 2)));
            } else {
                console.log(" successfully get data");
                console.log(data);
                console.log(JSON.stringify(data, undefined, 2));
                callback(null, data);
            }
        });
    } else {
        console.log("* No orderID *");

        var params = {
            TableName: "orders",
            FilterExpression : 'userEmail = :val', 
            ExpressionAttributeValues : {':val' : userEmail}
        };

        docClient.scan(params, function(err, data) {
            if (err) {
                err = new OrderError("500 Order table access Error");
                callback(err, null);
            } else{
                console.log("cone into scan result");
                result = {items : data.Items,
                          email : userEmail
                         };
                console.log(result);
                callback(null, result);
            }
        });
    }
}

function createOrder(event, callback){
    console.log(event);
    console.log("come into createOrder");
    var stripeToken = event.stripeToken;
    console.log("*** stripeToken : " + stripeToken + " ***");
    console.log("*** itemID : " + event.itemID + " ***");
    console.log("*** userEmail : " + event.userEmail + " ***");

    var itemID = event.itemID;
    var userEmail = event.userEmail;

    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
        TableName: "orders"
    };

    var orderID = event.orderID;
    console.log("orderID:" + orderID);
    console.log("timestamp:" + event.date.toString());

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: "orders",
        Item: {
            "orderID": orderID,
            "userEmail": userEmail,
            "itemID": itemID,
            "timestamp": event.date.toString(),
            "price": "$10.00"
        }
    };

    docClient.put(params, function(err, data) {
        if (err) {
            console.log(" fail !!!!");
            err = new OrderError("500 Order table access Error");
            callback(err, null);
        } else {
            console.log(" successed !!!!");
            callback(null, orderID);
        }
    });

    
}






