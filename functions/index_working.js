'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');


exports.scratchCat = functions.https.onRequest((request, response) => {
  const app = new App({request: request, response: response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));


// c. The function that generates the silly name
  function makeName (app) {
    app.tell('discover ability');
  // d. build an action map, which maps intent names to functions
  }
  
  let actionMap = new Map();
  actionMap.set('discover_ability', makeName);


app.handleRequest(actionMap);
});



