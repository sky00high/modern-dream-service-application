var Jwt = require('jsonwebtoken');
var AWS = require('aws-sdk');

var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // Can optionally return a context object of your choosing.
    authResponse.context = {};
    authResponse.context.stringKey = "stringval";
    authResponse.context.numberKey = 123;
    authResponse.context.booleanKey = true;
    return authResponse;
}


exports.handler = function(event, context, callback) {
    console.log('Client token: ' + event.authorizationToken);
    console.log('Method ARN: ' + event.methodArn);

    try {
        verifiedJwt = Jwt.verify(event.authorizationToken, 'secret');
        console.log(verifiedJwt);

        // parse the ARN from the incoming event
        var apiOptions = {};
        var tmp = event.methodArn.split(':');
        var apiGatewayArnTmp = tmp[5].split('/');
        var awsAccountId = tmp[4];
        apiOptions.region = tmp[3];
        apiOptions.restApiId = apiGatewayArnTmp[0];
        apiOptions.stage = apiGatewayArnTmp[1];


        callback(null, generatePolicy(verifiedJwt.email, 'Allow', event.methodArn));

    } catch (ex) {
        console.log(ex, ex.stack);
        callback("Unauthorized");
    }
    
};