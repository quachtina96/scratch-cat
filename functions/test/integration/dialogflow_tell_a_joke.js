/**
 * Implements integration tests modeled after the "tell a joke" use case of
 * Scratch Cat voice user interface.
 */
const test = require('tap').test;
const sc = require('../../index.js');
var request = require('request');
var AUTHORIZATION = 'Bearer 55710394e3734fd28627df645c57d3f3';

var getRequestUrl = function(query) {
  return 'https://api.dialogflow.com/v1/query?v=20170712&query=' + query + '&lang=en&sessionId=f81252dc-33eb-4396-aecc-a0f1b2ff919f&timezone=America/New_York'
};

var getRequest = function(query, authorization) {
  // Build request
  var headers = {
    'Authorization': authorization
  };

  var options = {
    url: getRequestUrl('hi'),
    headers: headers
  };

  return options;
}

test('hi', t => {
  // Build request
  var options = getRequest('hi', AUTHORIZATION);

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonBody = JSON.parse(body);
      t.same(jsonBody.result.fulfillment.speech,
        "Hi, I'm Scratch. You can create a program by telling me what to do.");
    }
    t.end();
  }

  request(options, callback);
});

