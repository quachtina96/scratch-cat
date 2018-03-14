/**
 * Implements integration tests modeled after the "tell a joke" use case of
 * Scratch Cat voice user interface.
 */
const t = require('tap');
const test = require('tap').test;
const sc = require('../../index.js');
var request = require('request');
var AUTHORIZATION = 'Bearer 55710394e3734fd28627df645c57d3f3';
var SESSION_ID = 'f81252dc-33eb-4396-aecc-a0f1b2ff919f';

var getRequestUrl = function(query) {
  return 'https://api.dialogflow.com/v1/query?v=20170712&query=' + encodeURIComponent(query) + '&lang=en&sessionId=' + SESSION_ID + '&timezone=America/New_York'
};

var getRequest = function(query, authorization) {
  // Build request
  var headers = {
    'Authorization': authorization
  };

  var options = {
    url: getRequestUrl(query),
    headers: headers
  };

  return options;
};

var getRequestWithURL = function(url, authorization) {
  // Build request
  var headers = {
    'Authorization': authorization
  };

  var options = {
    url: url,
    headers: headers
  };

  return options;
}

var getSortedContexts = function(jsonBody) {
  return jsonBody.result.contexts.map(context => context.name).sort();
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
}).then(t => {
  // Build request
  var options = getRequest('can you tell me a joke?', AUTHORIZATION);

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonBody = JSON.parse(body);
      t.same(jsonBody.result.fulfillment.speech,
        "I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?");
    t.same(getSortedContexts(jsonBody), ["_actions_on_google_", 'call_command']);
    } else {
      t.ok(false);
    }
  }

  return t.test('can you tell me a joke', t => {
    request(options, callback);
    t.end();
  });
}).then(t => {
  // Build request
  var options = getRequest('sure', AUTHORIZATION);
  // var url = 'https://api.dialogflow.com/v1/query?v=20170712&query=sure&lang=en&sessionId=40aafa7f-27be-4e96-8921-a4fedfd9ab77&timezone=America/New_York';
  // var options = getRequestWithURL(url, AUTHORIZATION);

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonBody = JSON.parse(body);
      t.same(jsonBody.result.action, "define_program");
      t.same(jsonBody.result.fulfillment.speech,
        "What should I do first?");
    } else {
      t.ok(false);
    }
    t.end();
  }

  request(options, callback);
}).catch(t.threw)
