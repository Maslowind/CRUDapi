

let AmazonCognitoIdentity = require('amazon-cognito-identity-js');
require('cross-fetch/polyfill');

exports.handler = async (event) => {
    let poolData = {
        UserPoolId: process.env.USERPOOLID, // Your user pool id here
        ClientId: process.env.CLIENTID, // Your client id here
    };
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    let attributeList = [];

    let dataEmail = {
        Name: 'email',
        Value: event.email,
    };

    let dataPhoneNumber = {
        Name: 'phone_number',
        Value: event.phone_number,
    };
    let dataName = {
        Name: 'name',
        Value: event.email,
    };
    let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    let attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);
    let attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);
    attributeList.push(attributeName);
    console.log(event.email, event.password, event.phone_number)



    return new Promise((resolve, reject) =>
        userPool.signUp(event.email, event.password, attributeList, null, function (
            err,
            result
        ) {
            if (err) {
                console.error("err", err);
                reject(err.message);
                return;
            }
            resolve("User created");
            let cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
        }));
};
