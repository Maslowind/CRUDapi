let AWS = require('aws-sdk/global')
let AmazonCognitoIdentity = require('amazon-cognito-identity-js');
require('cross-fetch/polyfill');

exports.handler = async (event) => {
    let authenticationData = {
        Username: event.email,
        Password: event.password,
    };
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
        authenticationData
    );
    let poolData = {
        UserPoolId: process.env.USERPOOLID, // Your user pool id here
        ClientId: process.env.CLIENTID, // Your client id here
    };
    let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    let userData = {
        Username: event.email,
        Pool: userPool,
    };
    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    return new Promise((resolve, reject) =>
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                let accessToken = result.getIdToken().getJwtToken();
                console.log("accessToken:", accessToken)

                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: process.env.IDENTITYPOOLID, // your identity pool id here
                    Logins: {
                        'cognito-idp.eu-west-2.amazonaws.com/eu-west-2_mxWm1LgYH': result
                            .getIdToken()
                            .getJwtToken(),
                    },
                });

                AWS.config.credentials.refresh(err => {
                    if (err) {
                        reject(err);
                        console.error(err);
                    } else {
                        resolve(`Successfully logged! Your Token: ${accessToken}`);
                        console.log('Successfully logged!');
                    }
                });
            },
            onFailure: function (err) {
                console.error(err);
                reject("Something went wrong. You should check your input data.");
            },
        }));
};
