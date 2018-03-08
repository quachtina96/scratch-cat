/**
 * Implements integration tests modeled after the "tell a joke" use case of
 * Scratch Cat voice user interface.
 */
const test = require('tap').test;
const sc = require('../../index.js');
var request = require('request');

// TODO: Potentially Refactor the Mock Request to be made up of mul
class MockRequest {
  constructor(body) {
    this.body = body ? body : this.getFullExample();
    this.result = {};
  }

  // https://expressjs.com/en/api.html#req.get
  get(param) {
    return "dummy_header";
  }

  // Example pulled from Actions on Google documentation.
  // https://developers.google.com/actions/reference/rest/conversation-webhook
  getFullExample() {
    return {
      "user": {
          "userId": "wCBxFjVLK8I+nxIXfFOHEf/iAvvaTFuzUdBw6Gv5K3Q="
      },
      "conversation": {
          "conversationId": "1494709404186",
          "type": "NEW"
      },
      "inputs": [
          {
              "intent": "actions.intent.MAIN",
              "rawInputs": [
                  {
                      "inputType": "KEYBOARD",
                      "query": "talk to my test app"
                  }
              ]
          }
      ],
      "surface": {
          "capabilities": [
              {
                  "name": "actions.capability.AUDIO_OUTPUT"
              },
              {
                  "name": "actions.capability.SCREEN_OUTPUT"
              }
          ]
      }};
  }
}


class MockResponse {
  constructor() {
    this.body = {};
    this.header = {};
    this.statusCode = 200;
  }

  // https://expressjs.com/en/api.html#res.append
  append(headerField, value) {
    this.header[headerField] = value;
  }

  // https://expressjs.com/en/api.html#res.status
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  send(response) {
    this.body = response;
  }
}

let expectedResponseBody = {
    "id": "52a9b9c3-b5e3-42f7-a4fe-0e4410e8828c",
    "timestamp": "2018-03-08T04:48:15.705Z",
    "lang": "en",
    "result": {
      "source": "agent",
      "resolvedQuery": "hi",
      "action": "input.welcome",
      "actionIncomplete": false,
      "parameters": {},
      "contexts": [
        {
          "name": "_actions_on_google_",
          "parameters": {
            "command.original": "first, say knock knock",
            "action.original": "",
            "action": "tell me a joke",
            "command": "first, say knock knock"
          },
          "lifespan": 99
        },
        {
          "name": "discover_ability-yes-followup",
          "parameters": {
            "action.original": "",
            "command.original": "first, say knock knock",
            "action": "tell me a joke",
            "command": "first, say knock knock"
          },
          "lifespan": 1
        }
      ],
      "metadata": {
        "intentId": "b5b2b686-c7fc-4ad4-b380-bad8cd33737a",
        "webhookUsed": "false",
        "webhookForSlotFillingUsed": "false",
        "intentName": "Default Welcome Intent"
      },
      "fulfillment": {
        "speech": "Hi, I'm Scratch. You can create a program by telling me what to do.",
        "messages": [
          {
            "type": 0,
            "speech": "Hi, I'm Scratch. You can create a program by telling me what to do."
          }
        ]
      },
      "score": 1
    },
    "status": {
      "code": 200,
      "errorType": "success",
      "webhookTimedOut": false
    },
    "sessionId": "f81252dc-33eb-4396-aecc-a0f1b2ff919f"
  };

test('respond to hi', t => {
  var request = new MockRequest({
    "contexts": ["_actions_on_google_"],
    "lang": "en",
    "query": "hi",
    "sessionId": "f81252dc-33eb-4396-aecc-a0f1b2ff919f",
    "timezone": "America/New_York"
  });
  var response = new MockResponse;
  let scratch = new sc.ScratchCat(request, response);
  scratch.run();
  t.same(response.body.metadata.intentName = "Default Welcome Intent");
  t.same(response.body.speech, expectedResponseBody.result.fulfillment.speech);
  t.end();
});

test('respond to hi with real request', t => {
  // Build request
  var headers = {
    'Authorization': 'Bearer 55710394e3734fd28627df645c57d3f3'
  };

  var options = {
    url: 'https://api.dialogflow.com/v1/query?v=20170712&query=hi&lang=en&sessionId=f81252dc-33eb-4396-aecc-a0f1b2ff919f&timezone=America/New_York',
    headers: headers
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(body);
      t.same(body.fulfillment, expectedResponseBody.fulfillment);
    }
    t.end();
  }

  request(options, callback);
});