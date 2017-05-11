#!/bin/bash

lambda_fun="customer-api-authorizer-lambda"

zip "$lambda_fun".zip -r index.js node_modules 

echo "Updating $lambda_fun ..."
aws lambda update-function-code \
    --function-name "$lambda_fun" \
    --zip-file fileb://"$lambda_fun".zip

exit 0
