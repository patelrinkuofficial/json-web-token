# json-web-token
This was developed against draft-ietf-oauth-json-web-token-08. It makes use of node-jws

Install
$ npm install jsonwebtoken
Migration notes
From v7 to v8
Usage
jwt.sign(payload, secretOrPrivateKey, [options, callback])
(Asynchronous) If a callback is supplied, the callback is called with the err or the JWT.

(Synchronous) Returns the JsonWebToken as string

payload could be an object literal, buffer or string representing valid JSON.

Please note that exp or any other claim is only set if the payload is an object literal. Buffer or string payloads are not checked for JSON validity.

If payload is not a buffer or a string, it will be coerced into a string using JSON.stringify.

secretOrPrivateKey is a string, buffer, or object containing either the secret for HMAC algorithms or the PEM encoded private key for RSA and ECDSA. In case of a private key with passphrase an object { key, passphrase } can be used (based on crypto documentation), in this case be sure you pass the algorithm option.

options:

algorithm (default: HS256)
expiresIn: expressed in seconds or a string describing a time span zeit/ms.
Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

notBefore: expressed in seconds or a string describing a time span zeit/ms.
Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

audience
issuer
jwtid
subject
noTimestamp
header
keyid
mutatePayload: if true, the sign function will modify the payload object directly. This is useful if you need a raw reference to the payload after claims have been applied to it but before it has been encoded into a token.
There are no default values for expiresIn, notBefore, audience, subject, issuer. These claims can also be provided in the payload directly with exp, nbf, aud, sub and iss respectively, but you can't include in both places.

Remember that exp, nbf and iat are NumericDate, see related Token Expiration (exp claim)

The header can be customized via the options.header object.

Generated jwts will include an iat (issued at) claim by default unless noTimestamp is specified. If iat is inserted in the payload, it will be used instead of the real timestamp for calculating other things like exp given a timespan in options.expiresIn.

Synchronous Sign with default (HMAC SHA256)

var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
Synchronous Sign with RSA SHA256

// sign with RSA SHA256
var privateKey = fs.readFileSync('private.key');
var token = jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256'});
Sign asynchronously

jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' }, function(err, token) {
  console.log(token);
});
Backdate a jwt 30 seconds

var older_token = jwt.sign({ foo: 'bar', iat: Math.floor(Date.now() / 1000) - 30 }, 'shhhhh');
Token Expiration (exp claim)
The standard for JWT defines an exp claim for expiration. The expiration is represented as a NumericDate:

A JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds. This is equivalent to the IEEE Std 1003.1, 2013 Edition [POSIX.1] definition "Seconds Since the Epoch", in which each day is accounted for by exactly 86400 seconds, other than that non-integer values can be represented. See RFC 3339 [RFC3339] for details regarding date/times in general and UTC in particular.

This means that the exp field should contain the number of seconds since the epoch.

Signing a token with 1 hour of expiration:

jwt.sign({
  exp: Math.floor(Date.now() / 1000) + (60 * 60),
  data: 'foobar'
}, 'secret');
Another way to generate a token like this with this library is:

jwt.sign({
  data: 'foobar'
}, 'secret', { expiresIn: 60 * 60 });
 
//or even better:
 
jwt.sign({
  data: 'foobar'
}, 'secret', { expiresIn: '1h' });
jwt.verify(token, secretOrPublicKey, [options, callback])
(Asynchronous) If a callback is supplied, function acts asynchronously. The callback is called with the decoded payload if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will be called with the error.

(Synchronous) If a callback is not supplied, function acts synchronously. Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will throw the error.

token is the JsonWebToken string

secretOrPublicKey is a string or buffer containing either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA. If jwt.verify is called asynchronous, secretOrPublicKey can be a function that should fetch the secret or public key. See below for a detailed example

As mentioned in this comment, there are other libraries that expect base64 encoded secrets (random bytes encoded using base64), if that is your case you can pass Buffer.from(secret, 'base64'), by doing this the secret will be decoded using base64 and the token verification will use the original random bytes.

options

algorithms: List of strings with the names of the allowed algorithms. For instance, ["HS256", "HS384"].
audience: if you want to check audience (aud), provide a value here. The audience can be checked against a string, a regular expression or a list of strings and/or regular expressions.
Eg: "urn:foo", /urn:f[o]{2}/, [/urn:f[o]{2}/, "urn:bar"]

complete: return an object with the decoded { payload, header, signature } instead of only the usual content of the payload.
issuer (optional): string or array of strings of valid values for the iss field.
ignoreExpiration: if true do not validate the expiration of the token.
ignoreNotBefore...
subject: if you want to check subject (sub), provide a value here
clockTolerance: number of seconds to tolerate when checking the nbf and exp claims, to deal with small clock differences among different servers
maxAge: the maximum allowed age for tokens to still be valid. It is expressed in seconds or a string describing a time span zeit/ms.
Eg: 1000, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

clockTimestamp: the time in seconds that should be used as the current time for all necessary comparisons.
nonce: if you want to check nonce claim, provide a string value here. It is used on Open ID for the ID Tokens. (Open ID implementation notes)
// verify a token symmetric - synchronous
var decoded = jwt.verify(token, 'shhhhh');
console.log(decoded.foo) // bar
 
// verify a token symmetric
jwt.verify(token, 'shhhhh', function(err, decoded) {
  console.log(decoded.foo) // bar
});
 
// invalid token - synchronous
try {
  var decoded = jwt.verify(token, 'wrong-secret');
} catch(err) {
  // err
}
 
// invalid token
jwt.verify(token, 'wrong-secret', function(err, decoded) {
  // err
  // decoded undefined
});
 
// verify a token asymmetric
var cert = fs.readFileSync('public.pem');  // get public key
jwt.verify(token, cert, function(err, decoded) {
  console.log(decoded.foo) // bar
});
 
// verify audience
var cert = fs.readFileSync('public.pem');  // get public key
jwt.verify(token, cert, { audience: 'urn:foo' }, function(err, decoded) {
  // if audience mismatch, err == invalid audience
});
 
// verify issuer
var cert = fs.readFileSync('public.pem');  // get public key
jwt.verify(token, cert, { audience: 'urn:foo', issuer: 'urn:issuer' }, function(err, decoded) {
  // if issuer mismatch, err == invalid issuer
});
 
// verify jwt id
var cert = fs.readFileSync('public.pem');  // get public key
jwt.verify(token, cert, { audience: 'urn:foo', issuer: 'urn:issuer', jwtid: 'jwtid' }, function(err, decoded) {
  // if jwt id mismatch, err == invalid jwt id
});
 
// verify subject
var cert = fs.readFileSync('public.pem');  // get public key
jwt.verify(token, cert, { audience: 'urn:foo', issuer: 'urn:issuer', jwtid: 'jwtid', subject: 'subject' }, function(err, decoded) {
  // if subject mismatch, err == invalid subject
});
 
// alg mismatch
var cert = fs.readFileSync('public.pem'); // get public key
jwt.verify(token, cert, { algorithms: ['RS256'] }, function (err, payload) {
  // if token alg != RS256,  err == invalid signature
});
 
// Verify using getKey callback
// Example uses https://github.com/auth0/node-jwks-rsa as a way to fetch the keys.
var jwksClient = require('jwks-rsa');
var client = jwksClient({
  jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json'
});
function getKey(header, callback){
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
 
jwt.verify(token, getKey, options, function(err, decoded) {
  console.log(decoded.foo) // bar
});
 
jwt.decode(token [, options])
(Synchronous) Returns the decoded payload without verifying if the signature is valid.

Warning: This will not verify whether the signature is valid. You should not use this for untrusted messages. You most likely want to use jwt.verify instead.

token is the JsonWebToken string

options:

json: force JSON.parse on the payload even if the header doesn't contain "typ":"JWT".
complete: return an object with the decoded payload and header.
Example

// get the decoded payload ignoring signature, no secretOrPrivateKey needed
var decoded = jwt.decode(token);
 
// get the decoded payload and header
var decoded = jwt.decode(token, {complete: true});
console.log(decoded.header);
console.log(decoded.payload)
Errors & Codes
Possible thrown errors during verification. Error is the first argument of the verification callback.

TokenExpiredError
Thrown error if the token is expired.

Error object:

name: 'TokenExpiredError'
message: 'jwt expired'
expiredAt: [ExpDate]
jwt.verify(token, 'shhhhh', function(err, decoded) {
  if (err) {
    /*
      err = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
        expiredAt: 1408621000
      }
    */
  }
});
JsonWebTokenError
Error object:

name: 'JsonWebTokenError'
message:
'jwt malformed'
'jwt signature is required'
'invalid signature'
'jwt audience invalid. expected: [OPTIONS AUDIENCE]'
'jwt issuer invalid. expected: [OPTIONS ISSUER]'
'jwt id invalid. expected: [OPTIONS JWT ID]'
'jwt subject invalid. expected: [OPTIONS SUBJECT]'
jwt.verify(token, 'shhhhh', function(err, decoded) {
  if (err) {
    /*
      err = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed'
      }
    */
  }
});
NotBeforeError
Thrown if current time is before the nbf claim.

Error object:

name: 'NotBeforeError'
message: 'jwt not active'
date: 2018-10-04T16:10:44.000Z
jwt.verify(token, 'shhhhh', function(err, decoded) {
  if (err) {
    /*
      err = {
        name: 'NotBeforeError',
        message: 'jwt not active',
        date: 2018-10-04T16:10:44.000Z
      }
    */
  }
});
