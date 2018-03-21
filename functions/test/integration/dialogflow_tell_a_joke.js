/**
 * Implements integration tests modeled after the "tell a joke" use case of
 * Scratch Cat voice user interface.
 */
const t = require('tap');
const test = require('tap').test;
const sc = require('../../index.js');
var request = require('request-promise');
var AUTHORIZATION = 'Bearer 55710394e3734fd28627df645c57d3f3';
var SESSION_ID = 'tina-t';

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


/**
hi
Hi, I'm Scratch. You can create a program by telling me what to do.
can you tell me a joke?
I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?
sure
What should I do first?
first, say knock knock
What should I do next?
then, say who's there?
Okay, doing say who's there next.
then, say King Tut
Okay, doing say King Tut next.
**/
test('flow 1', t => {
  // Build request
  var options = getRequest('hi', AUTHORIZATION);
  return request(options).then(parsedBody => {
      t.same(parsedBody.result.fulfillment.speech,
        "Hi, I'm Scratch. You can create a program by telling me what to do.");
      return t;
    }).then(t => {
      var options = getRequest("can you tell me a joke?", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.fulfillment.speech,
            "I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?");
          t.same(getSortedContexts(parsedBody), ["_actions_on_google_", 'call_command']);
          return t;
        });
    }).then(t => {
      var options = getRequest("sure", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.action, "define_program");
          t.same(parsedBody.result.fulfillment.speech, "What should I do first?");
          return t;
        });
    }).then(t => {
      var options = getRequest("first, say knock knock", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.action, "define_program");
          t.same(parsedBody.result.fulfillment.speech, "When you say 'tell me a joke', I'll first, say knock knock. What should I do next?");
          return t;
        });
    }).then(t => {
      var options = getRequest("then, say who's there?", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.contexts[0].name, "add_to_program");
          // TODO: improve the speech below with fulfillment
          t.same(parsedBody.result.fulfillment.speech, "Okay, I will say who's there next.");
          return t;
        });
    }).then(t => {
      var options = getRequest("then, say King Tut", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.metadata.intentName, "add_to_program_again");
          // TODO: improve the speech below with fulfillment
          t.same(parsedBody.result.fulfillment.speech, "Okay, I will say King Tut next.");
          t.end();
          return t;
         });
    }).catch(handleError);
});

/**
hi
Hi, I'm Scratch. You can create a program by telling me what to do.
tell me a joke
I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?
sure
What should I do first?
first, say knock knock
What should I do next?
then, say who's there?
Okay, doing say who's there next.
then, say King Tut
Okay, doing say King Tut next.
**/
test('flow 2', t => {
  // Build request
  var options = getRequest('hi', AUTHORIZATION);
  return request(options).then(parsedBody => {
      t.same(parsedBody.result.fulfillment.speech,
        "Hi, I'm Scratch. You can create a program by telling me what to do.");
      return t;
    }).then(t => {
      var options = getRequest("tell me a joke", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.fulfillment.speech,
            "I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?");
          t.same(getSortedContexts(parsedBody), ["_actions_on_google_", 'call_command']);
          return t;
        });
    }).then(t => {
      var options = getRequest("sure", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.action, "define_program");
          t.same(parsedBody.result.fulfillment.speech, "What should I do first?");
          return t;
        });
    }).then(t => {
      var options = getRequest("first, say knock knock", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.action, "define_program");
          t.same(parsedBody.result.fulfillment.speech, "When you say 'tell me a joke', I'll first, say knock knock. What should I do next?");
          return t;
        });
    }).then(t => {
      var options = getRequest("then, say who's there?", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.contexts[0].name, "add_to_program");
          // TODO: improve the speech below with fulfillment
          t.same(parsedBody.result.fulfillment.speech, "Okay, I will say who's there next.");
          return t;
        });
    }).then(t => {
      var options = getRequest("then, say King Tut", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.metadata.intentName, "add_to_program_again");
          // TODO: improve the speech below with fulfillment
          t.same(parsedBody.result.fulfillment.speech, "Okay, I will say King Tut next.");
          t.end();
          return t;
        });
    }).catch(handleError);
});

test('flow 3', t => {
  // Build request
  var options = getRequest('hi', AUTHORIZATION);
  return request(options).then(parsedBody => {
      t.same(parsedBody.result.fulfillment.speech,
        "Hi, I'm Scratch. You can create a program by telling me what to do.");
      return t;
    }).then(t => {
      var options = getRequest("tell me a joke", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.fulfillment.speech,
            "I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?");
          t.same(getSortedContexts(parsedBody), ["_actions_on_google_", 'call_command']);
          return t;
        });
    }).then(t => {
      var options = getRequest("no", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.fulfillment.speech, "Okay, but if you teach me I will know what to do when you say tell me a joke.");
          t.end();
          return t;
        });
    }).catch(handleError);
});

/**
hi
Hi, I'm Scratch. You can create a program by telling me what to do.
tell me a joke
I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?
sure
What should I do first?
first, say knock knock
What should I do next?
when I say who's there, you say King Tut
Okay, I will say King Tut when you say who's there // add_to_program_fulfillment
**/
test('flow 3', t => {
  // Build request
  var options = getRequest('hi', AUTHORIZATION);
  return request(options).then(parsedBody => {
      t.same(parsedBody.result.fulfillment.speech,
        "Hi, I'm Scratch. You can create a program by telling me what to do.");
      return t;
    }).then(t => {
      var options = getRequest("tell me a joke", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.fulfillment.speech,
            "I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?");
          t.same(getSortedContexts(parsedBody), ["_actions_on_google_", 'call_command']);
          return t;
        });
    }).then(t => {
      var options = getRequest("no", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.fulfillment.speech, "Okay, but if you teach me I will know what to do when you say tell me a joke.");
          t.end();
          return t;
        });
    }).catch(handleError);
});


test('defining a program with an unsupported instruction', t => {
  // Build request
  var options = getRequest('hi', AUTHORIZATION);
  return request(options).then(parsedBody => {
      t.same(parsedBody.result.fulfillment.speech,
        "Hi, I'm Scratch. You can create a program by telling me what to do.");
      return t;
    }).then(t => {
      var options = getRequest("tell me a joke", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.fulfillment.speech,
            "I don't know how to do that. Can you teach me what I should when you say 'tell me a joke'?");
          t.same(getSortedContexts(parsedBody), ["_actions_on_google_", 'call_command']);
          return t;
        });
    }).then(t => {
      var options = getRequest("first, you boop!", AUTHORIZATION);
      return request(options)
        .then(parsedBody => {
          t.same(parsedBody.result.fulfillment.speech, "Okay, but if you teach me I will know what to do when you say tell me a joke.");
          t.end();
          return t;
        });
    }).catch(handleError);
});
