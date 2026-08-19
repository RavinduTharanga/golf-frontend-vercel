// import {
//   CognitoIdentityProviderClient,
//   SignUpCommand,
//   ConfirmSignUpCommand,
//   InitiateAuthCommand,
// } from "@aws-sdk/client-cognito-identity-provider";

// // These three Cognito operations (SignUp, ConfirmSignUp, InitiateAuth
// // with USER_PASSWORD_AUTH) are "unauthenticated" API calls by design --
// // they're meant to be called directly by end users, so no AWS IAM
// // credentials are needed here at all, just the region and your app
// // client's ID. That's why this client is created with no `credentials`
// // option.
// const client = new CognitoIdentityProviderClient({
//   region: process.env.AWS_REGION || "us-east-1",
// });

// const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

// export async function signUp(email, password) {
//   return client.send(
//     new SignUpCommand({
//       ClientId: CLIENT_ID,
//       Username: email,
//       Password: password,
//       UserAttributes: [{ Name: "email", Value: email }],
//     })
//   );
// }

// export async function confirmSignUp(email, code) {
//   return client.send(
//     new ConfirmSignUpCommand({
//       ClientId: CLIENT_ID,
//       Username: email,
//       ConfirmationCode: code,
//     })
//   );
// }

// /**
//  * Returns the authenticated user's tokens on success, or throws (e.g.
//  * NotAuthorizedException for wrong password, UserNotConfirmedException
//  * if they haven't entered their confirmation code yet).
//  */
// export async function login(email, password) {
//   const result = await client.send(
//     new InitiateAuthCommand({
//       AuthFlow: "USER_PASSWORD_AUTH",
//       ClientId: CLIENT_ID,
//       AuthParameters: {
//         USERNAME: email,
//         PASSWORD: password,
//       },
//     })
//   );
//   return result.AuthenticationResult;
// }

import crypto from "crypto";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// SignUp, ConfirmSignUp, and InitiateAuth (USER_PASSWORD_AUTH) are
// "unauthenticated" Cognito API calls by design -- meant to be called
// directly by end users -- so no AWS IAM credentials are needed here,
// just the region and your app client's ID.
const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

/**
 * If the app client has a secret configured, every SignUp/InitiateAuth/
 * ConfirmSignUp call MUST include this computed hash or Cognito rejects
 * the request with a generic error. Returns undefined if no secret is
 * configured (app clients without a secret don't need this at all).
 */
function computeSecretHash(username) {
  if (!CLIENT_SECRET) return undefined;
  return crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64");
}

export async function signUp(email, password) {
  return client.send(
    new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
      SecretHash: computeSecretHash(email),
    })
  );
}

export async function confirmSignUp(email, code) {
  return client.send(
    new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      SecretHash: computeSecretHash(email),
    })
  );
}

/**
 * Returns the authenticated user's tokens on success, or throws (e.g.
 * NotAuthorizedException for wrong password, UserNotConfirmedException
 * if they haven't entered their confirmation code yet).
 */
export async function login(email, password) {
  const secretHash = computeSecretHash(email);
  const result = await client.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        ...(secretHash ? { SECRET_HASH: secretHash } : {}),
      },
    })
  );
  return result.AuthenticationResult;
}