/*
Pebble app for showing the food served at verious restaurants at Chalmers University of Technology. 
This is open source, feel free to just fuck it up. No warranties for anything. At all. 

TODO:
*Add option to choose day (like show tomorrows food). Functionality is mostly already implementet into getData().
*Add more restaurants. (Can be found at mat.dtek.se).
*Clean up the code. Make more general functions. Maybe even classes if i manage to fucking grasp JS.
*Make the design bearable and not burn your eyes out. 
*Try catch the http request fails and such. 
*Show tomorrows food (when possible) if the time is after, like, 18:00
*/

//-------------------VARIABLES--------------------------

//Mandatory
var UI = require('ui');

//Everything will be on this card, but the text is updated. 
var card = new UI.Card();
card.scrollable(true);
//card.style('small');

//The main menu
var mainMenu = new UI.Menu({
  backgroundColor: 'white',
  textColor: '#000856',
  highlightBackgroundColor: '#00b1f7',
  highlightTextColor: 'black',
  sections: [{
    title: 'Restauranger',
    items: [{
      title: 'Xpress',
    }, {
      title: 'S.M.A.K'
    }, {
      title: 'Linsen'
    }, {
      title: 'Kårrestaurangen'
    }]
  }]
});


//----------------------------------------------------------------------------------


//Restaurant api links

//Standard format:
var karenURL = "http://carboncloudrestaurantapi.azurewebsites.net/api/menuscreen/getdataweek?restaurantid=5";
var xpressURL = "http://carboncloudrestaurantapi.azurewebsites.net/api/menuscreen/getdataweek?restaurantid=7";
//var lsURL = "http://carboncloudrestaurantapi.azurewebsites.net/api/menuscreen/getdataweek?restaurantid=8";
var smakURL = "http://carboncloudrestaurantapi.azurewebsites.net/api/menuscreen/getdataweek?restaurantid=42";

//Weird format:
var linsenTodayURL = "http://carboncloudrestaurantapi.azurewebsites.net/api/menuscreen/getdataday?restaurantid=33";



//Get todays date (needed to get todays lunch)
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
if(dd<10) {dd = '0'+dd;} 
if(mm<10) {mm = '0'+mm;} 
today = yyyy + '-' + mm + '-' + dd;



//-----------------------------COLLECT API DATA-------------------------------

/* This is a slightly chunky block of code. But the indexes are different in linsen
   To fix this in the future, make a more general function and put this heap of variables in an array*/
try{
//Kårresturangen (Only veg and fish for now)
var karenfood = getData(karenURL, 0, false);
var karenveg = karenfood[0].recipes[0].displayNames[0].displayName;
var karenfish = karenfood[1].recipes[0].displayNames[0].displayName;

//Express 
var xpressfood = getData(xpressURL, 0, false);
var xpressveg = xpressfood[1].recipes[0].displayNames[0].displayName;
var xpressmeat = xpressfood[0].recipes[0].displayNames[0].displayName;

//Smak 
var smakfood = getData(smakURL, 0, false);
var smakdagens = smakfood[0].recipes[0].displayNames[0].displayName;
var smakveckans = smakfood[1].recipes[0].displayNames[0].displayName;

//Linsen
var linsenfood = getData(linsenTodayURL, 0, true);
var linsendagens1 = linsenfood[0].recipes[0].displayNames[0].displayName;
var linsendagens2 = linsenfood[0].recipes[0].displayNames[1].displayName;
}catch(e){
  console.log(e.message);
  console.log("Failed to assign variables.");
  showCard (-1);
}

//-----------------RUN PROGRAM-------------------------
mainMenu.show();

// -----------------FUNCTIONS------------------------

//Event handler
mainMenu.on('select', function(e) {
  console.log('Selected item ' + e.itemIndex + ' of section ' + e.sectionIndex);
  console.log('The item is titled "' + e.item.title + '"');
  showCard(e.itemIndex);
});

//Shows card (slide = restaurant)
function showCard (slide){
  //Nah u srs? The showCard function shows carddsssss???!?!?! Fuck me...
  if (slide == 0){
    card.title('Xpress');
    card.body("Veg: " + xpressveg + "\nKött: " + xpressmeat);
  }else if (slide == 1){
    card.title('S.M.A.K');
    card.body("Dagens: " + smakdagens + "\nVeckans: " + smakveckans);
  }else if (slide == 2){
    card.title('Linsen');
    card.body("Dagens 1: " + linsendagens1 + "\nDagens 2: " + linsendagens2);
  }else if (slide == 3){
    card.title('Kårrestaurangen');
    card.body("Veg: " + karenveg + "\nFisk: " + karenfish);
  }else{
    card.title('No food found');
    card.body("Maybe it's the weekend?");
  }
  card.show();
}

//Make request for JSON data
function getData (url, day, linsen){
  
  var data;
  
  try {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    data = JSON.parse(xmlhttp.responseText); 
  }
  catch(err) {
    console.log("failed to set up http request");
    console.log(err.message);
    showCard (-1);
  }
  
  
  //If linsen (has its own format, and returns todays food)
  try{
    if (linsen){
    return data.recipeCategories;
  }
  }catch(e){
    console.log("linsen parse error");
    showCard (-1);
  }
  
  
  
  //For all restaurants, but not linsen
  //Search through the 5 days of the week
  
  try{
    for (var i = 0; i < 4; i++){
    //If todays date is found
      if (data.menus[i].menuDate == today + "T00:00:00"){
        if (day == 0){
          //If asking for todays food
          return data.menus[i].recipeCategories;
        } else {
          //If asking for tomorrows food
          return data.menus[i].recipeCategories;
        }
      }
    }   
  }catch(e){
    console.log(e.message);
    console.log("Failed to retrieve data...");
    showCard (-1);
  }
  //If todays date wasn't found
    showCard (-1);
    return data;
}
