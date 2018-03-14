/**
 * Implements integration tests modeled after the "tell a joke" use case of
 * Scratch Cat voice user interface.
 */
const t = require('tap');
const test = require('tap').test;
const sc = require('../../index.js');
var request = require('request-promise');
var AUTHORIZATION = 'Bearer 55710394e3734fd28627df645c57d3f3';
var SESSION_ID = 'tina_test2';

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
    headers: headers,
    json: true
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
};

var getSortedContexts = function(jsonBody) {
  return jsonBody.result.contexts.map(context => context.name).sort();
};

var handleError = function (err) {
  console.log('FAILED');
  console.log(err);
};

test('hi', t => {
  // Build request
  var options = getRequest('hi', AUTHORIZATION);
  return request(options).then(function (parsedBody) {
      t.same(parsedBody.result.fulfillment.speech,
        "Hi, I'm Scratch. You can create a program by telling me what to do.");
      return t;
    }).then(t => {
      var options = getRequest("can you tell me a joke?", AUTHORIZATION);
      return request(options)
        .then(function (parsedBody) {
          t.same(parsedBody.result.fulfillment.speech,
            "I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?");
          t.same(getSortedContexts(parsedBody), ["_actions_on_google_", 'call_command']);
          return t;
        });
    }).then(t => {
      var options = getRequest("sure", AUTHORIZATION);
      return request(options)
        .then(function (parsedBody) {
          t.same(parsedBody.result.action, "define_program");
          t.same(parsedBody.result.fulfillment.speech, "What should I do first?");
          return t;
        });
    }).then(t => {
      t.end();
    }).catch(handleError);
});

