var UI = require('ui');

var ajax = require('ajax');

var Vector2 = require('vector2');

// Create the Window
var watch = new UI.Window({
 fullscreen: true
});

// Create a background Rect
var bgRect = new UI.Rect({
  position: new Vector2(10, 20),
  size: new Vector2(124, 60),
  backgroundColor: 'white'
});

// Add Rect to Window
watch.add(bgRect);


var title = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Goals 2016',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
  backgroundColor:'white'
});

watch.add(title);

// Create TimeText
var timeText = new UI.TimeText({
  position: new Vector2(0, 25),
  size: new Vector2(144, 30),
  text: "%H:%M",
  font: 'bitham-42-bold',
  color: 'black',
  textAlign: 'center'
});

// Add the TimeText
watch.add(timeText);

// Show the Window
watch.show();

function displayGoals(activeGoals){

  for (var goal in activeGoals){
      
    
  var goalText = new UI.Text({
    position: new Vector2(0, 70),
    size: new Vector2(144, 168),
    text: activeGoals[goal],
    font:'GOTHIC_18',
    color:'black',
    textOverflow:'wrap',
    textAlign:'center',
    backgroundColor:'white'
  });
  
  watch.add(goalText);
  console.log("added goal ",activeGoals[goal], " to the watchface.");
  
  // Show the Window
  watch.show();
  
  }
}

var active_goals = [];
ajax({url: "http://fabien.benetou.fr/YearlyGoals/2016?action=source", type: 'json'},
function(data) {
  // FAIL console.log(JSON.parse(data));
      var goals = data[0];
      for (var goal in goals){
        active_goals.push(goals[goal]);
        // does not seem to actively split in goals...
        // JSON.parse() does not help as it fails
      }
      displayGoals(active_goals);
  },
  function(error) {
    console.log('Ajax failed: ' + error);
  }
);