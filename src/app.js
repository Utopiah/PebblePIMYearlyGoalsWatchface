var UI = require('ui');

var ajax = require('ajax');

var Vector2 = require('vector2');

// Create the Window
var watch = new UI.Window();

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
  position: new Vector2(0, 40),
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


var active_goals = [];
ajax({url: "http://fabien.benetou.fr/YearlyGoals/2016?action=source", type: 'json'},
function(data) {
    // Data is supplied here
      //var goals = JSON.parse(data);
      var goals = data;
      console.log("goals:", goals);
      for (var goal in goals){
        console.log(goals[goal]);
        active_goals.push(goals[goal]);
      }
  },
  function(error) {
    console.log('Ajax failed: ' + error);
  }
);