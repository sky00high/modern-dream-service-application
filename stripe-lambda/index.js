var stripe = require("stripe")("sk_test_JCy56FAehenafOCX4DpsLILx");

function OrderError(message) {
   this.name = "OrderError";
   this.message = message;
}
OrderError.prototype = new Error();

exports.handler = function(event, context, callback) {
    console.log("**** event *****");
    console.log(event);

    var stripeToken = event.stripeToken;

    stripe.customers.create({
        source: stripeToken,
    }).then(
        function(customer) { 
            var date = new Date();
            var orderID = (+date).toString(36);

            var result = stripe.charges.create({ 
                amount: 100,
                currency: "usd",
                customer: customer.id,
                metadata : {orderID : orderID},
            });

            console.log(result);
            console.log(typeof(result));
            return result;
            // return stripe.charges.create({ 
            //     amount: 100,
            //     currency: "usd",
            //     customer: customer.id,
            //     metadata : {orderID : orderID},
            // });
        },
        function(err) {
            return err;
        }
    );

};








