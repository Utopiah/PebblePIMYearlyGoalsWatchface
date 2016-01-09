/******************************* timeline lib *********************************/

console.log("Loading the timeline lib");

// The timeline public URL root
var API_URL_ROOT = 'https://timeline-api.getpebble.com/';

/**
 * Send a request to the Pebble public web timeline API.
 * @param pin The JSON pin to insert. Must contain 'id' field.
 * @param type The type of request, either PUT or DELETE.
 * @param topics Array of topics if a shared pin, 'null' otherwise.
 * @param apiKey Timeline API key for this app, available from dev-portal.getpebble.com
 * @param callback The callback to receive the responseText after the request has completed.
 */
function timelineRequest(pin, type, topics, apiKey, callback) {
  // User or shared?
  var url = API_URL_ROOT + 'v1/' + ((topics != null) ? 'shared/' : 'user/') + 'pins/' + pin.id;

  // Create XHR
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    console.log('timeline: response received: ' + this.responseText);
    callback(this.responseText);
  };
  xhr.open(type, url);

  // Set headers
  xhr.setRequestHeader('Content-Type', 'application/json');
  if(topics != null) {
    xhr.setRequestHeader('X-Pin-Topics', '' + topics.join(','));
    xhr.setRequestHeader('X-API-Key', '' + apiKey);
  }

  // Get token
  Pebble.getTimelineToken(function(token) {
    // Add headers
    xhr.setRequestHeader('X-User-Token', '' + token);

    // Send
    xhr.send(JSON.stringify(pin));
    console.log('timeline: request sent.');
  }, function(error) { console.log('timeline: error getting timeline token: ' + error); });
}

/**
 * Insert a pin into the timeline for this user.
 * @param pin The JSON pin to insert.
 * @param callback The callback to receive the responseText after the request has completed.
 */
function insertUserPin(pin, callback) {
  timelineRequest(pin, 'PUT', null, null, callback);
}

/**
 * Delete a pin from the timeline for this user.
 * @param pin The JSON pin to delete.
 * @param callback The callback to receive the responseText after the request has completed.
 */
function deleteUserPin(pin, callback) {
  timelineRequest(pin, 'DELETE', null, null, callback);
}

/**
 * Insert a pin into the timeline for these topics.
 * @param pin The JSON pin to insert.
 * @param topics Array of topics to insert pin to.
 * @param apiKey Timeline API key for this app, available from dev-portal.getpebble.com
 * @param callback The callback to receive the responseText after the request has completed.
 */
function insertSharedPin(pin, topics, apiKey, callback) {
  timelineRequest(pin, 'PUT', topics, apiKey, callback);
}

/**
 * Delete a pin from the timeline for these topics.
 * @param pin The JSON pin to delete.
 * @param topics Array of topics to delete pin from.
 * @param apiKey Timeline API key for this app, available from dev-portal.getpebble.com
 * @param callback The callback to receive the responseText after the request has completed.
 */
function deleteSharedPin(pin, topics, apiKey, callback) {
  timelineRequest(pin, 'DELETE', topics, apiKey, callback);
}

/****************************** end timeline lib ******************************/

console.log("Loading the main file");


var TestPinSend = false;

var UI = require('ui');

var ajax = require('ajax');

var Vector2 = require('vector2');

var configured = localStorage.getItem(0);

var d = new Date();
var day = d.getDate();
var month = d.getMonth(); 

// Create the Window
var watch = new UI.Window({
  backgroundColor: 'pastelYellow',
  //color found via https://developer.getpebble.com/more/color-picker/
  fullscreen: true
});

function GoalVizMonthlyTick(window, offset, color){
  var width = 3; //(close to 200 entire screen / 3 goals /12 months);
  var height = 170;
  for (var i=0;i<12;i++){
    // Create a background Rect  
    var monthlyBar = new UI.Rect({
      position: new Vector2(offset + width*i,0),
      size: new Vector2(width, height),
      backgroundColor: color,
      borderColor: color
    });
    window.add(monthlyBar);
  }
}

function GoalVizMonthlyTickPos(window, offset){
  var width = 3; //(close to 200 entire screen / 3 goals /12 months);
  var height = 170;
  var pos = Math.round(day*height/31);
  for (var i=0;i<12;i++){
    if (i==month){
      var nowRect = new UI.Rect({
        position: new Vector2(offset + width*i, pos),
        size: new Vector2(width, Math.round(height/31)),
        backgroundColor: 'white',
        borderColor: 'white'
      });
      window.add(nowRect);
    }
  }
}

var title = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Goals 2016',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
});

// Create TimeText
var timeText = new UI.TimeText({
  position: new Vector2(0, 32),
  size: new Vector2(144, 30),
  text: "%H:%M",
  font: 'bitham-42-bold',
  color: 'black',
  textAlign: 'center'
});

var start = 16;
var columnWidth = 37;
var columnColors = ['orange', 'rajah', 'chromeYellow'];
for (var i=0;i<3;i++){
  GoalVizMonthlyTick(watch, start+columnWidth*i, columnColors[i]);
}

watch.add(title);
// Add the TimeText
watch.add(timeText);

// added separately in order to be over the time
for (var i=0;i<3;i++){
  GoalVizMonthlyTickPos(watch, start+columnWidth*i);
}

// Show the Window
watch.show();


function displayGoals(activeGoals){

  for (var goal in activeGoals){ 
      
    var goalText = new UI.Text({
      position: new Vector2(0, 90),
      size: new Vector2(144, 168),
      text: activeGoals[goal],
      font:'GOTHIC_18',
      color:'black',
      textOverflow:'wrap',
      textAlign:'center'
    });
  
  watch.add(goalText);
  // buggy since it was moved to local storage, maybe called once per character!
    
  // Show the Window
  watch.show();
  
  }
}

var activeGoals = [];
if (configured) {
  activeGoals.push(localStorage.getItem(1));
  displayGoals(activeGoals);
  
} else {
  ajax({url: "http://fabien.benetou.fr/YearlyGoals/2016?action=source", type: 'json'},
  function(data) {
      var goals = data[0];
      for (var goal in goals){
        activeGoals.push(goals[goal]);
        console.log("added goal ",goals[goal], " to the watchface.");
        }
    localStorage.setItem(1, activeGoals);
    
    localStorage.setItem(0, true);
    // assuming it all went well
    displayGoals(activeGoals);
  },
  function(error) {
    console.log('Ajax failed: ' + error);
  }
);
}

var apiKey = "SBbx5vva1z9tener0syhwwmlhni9yx81";
var topics = ["AllTopics"];

if (!TestPinSend) { sendingTestSharedPin(); TestPinSend = true; }

// https://dev-portal.getpebble.com/applications/568413ac55484b7dd1000029/timeline
// getWatchToken
// timelineSubscribe
// timelineUnsubscribe
// timelineSubscriptions
// API token SBbx5vva1z9tener0syhwwmlhni9yx81 	Sandbox
// https://developer.getpebble.com/guides/timeline/timeline-js/

/*
Pebble.timelineSubscribe('AllTopic', 
  function () { 
    console.log('Subscribed to AllTopic');
  }, 
  function (errorString) { 
    console.log('Error subscribing to topic: ' + errorString);
  }
);

Pebble.timelineSubscriptions(
  function (topics) {
    console.log('Subscribed to ' + topics.join(', '));
  },
  function (errorString) {
    console.log('Error getting subscriptions: ' + errorString);
  }
);
*/

// Push a pin when the app starts
Pebble.addEventListener('ready', function() {
  console.log('PebbleKit JS ready!');

  if (!TestPinSend) { sendingTestSharedPin(); TestPinSend = true; }
  
});

function sendingTestSharedPin(){
  
    // An hour ahead
  var date = new Date();
  date.setHours(date.getHours() + 2);

  // Create the pin
  var pin = {
    "id": "pin-" + Math.round((Math.random() * 100000)),
    "time": date.toISOString(),
    "layout": {
      "type": "genericPin",
      "title": "Example of Shared Pin (sent via timeline.js)",
      "tinyIcon": "system://images/SCHEDULED_EVENT"
    }
  };
  
  if (Pebble.getAccountToken() == "0123456789abcdef0123456789abcdef"){
      pin.layout.subtitle = "(pin sent from CloudPebble)";    
  } else {
      pin.layout.subtitle = "(pin sent from an actual watch)";        
  }
  console.log('Inserting SHARED pin in the future: ' + JSON.stringify(pin));

  // Push the shared pin
  insertSharedPin(pin, topics, apiKey, function(responseText) { 
    console.log('Result for shared pin: ' + responseText + " in topics " + topics);
  });

}
