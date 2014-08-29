'use strict';
var MAP;
//var COORDS;
var ITEM_KEY = "x-platform-js/mapItems";
var mapItems = [];

var config = {
  enableHighAccuracy: false, // set to true if you want to wait
  maximumAge: 60000,
  timeout: 30000,
};

var logCoordinates = function(position) {
//  debugger;
  console.log("Lat:  " + position.coords.latitude);
  console.log("Long: " + position.coords.longitude);
};

var logError = function(error) {
  console.log("whoops: " + error.code + " " + error.message);
};

var getMapSize = function(mapcontainer) {
  var height = Math.max(document.documentElement.clientHeight, window.innerHeight) || 400;
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth) / 4 || 600;
  mapcontainer.style.height =  height - 300 + "px";
  mapcontainer.style.width =  (width * 3) + "px";
};

var drawMap = function(position) {
  var mapcontainer = document.createElement('div');
  var MAP_ID = "my_google_map";
  mapcontainer.id = MAP_ID;
  mapcontainer.className = "container form-group";
  
  getMapSize(mapcontainer);

  document.body.appendChild(mapcontainer);
  
  var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  
  // options - https://developers.google.com/maps/documentation/javascript/controls
  var options = {
    zoom: 15,
    center: coords,
  };
  
  MAP = new google.maps.Map(document.getElementById(MAP_ID), options);
};

var markPosition = function(position, text, markerType) {
  var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  
  var marker = new google.maps.Marker({
    position: coords,
    map: MAP,
    title: text || 'You are here!',
    icon: markerType, 
  });
  
  var infoWindow = new google.maps.InfoWindow({
    content: "<div style='min-width: 100px; overflow: auto;'>" + marker.title + "</div>",
  });
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.open(MAP, marker);
  });
  
  MAP.setCenter(coords);
};

var gpsForAddress = function (inputAddress, cb) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    address: inputAddress
  }, function (results) {
    if (cb) {
      cb(results[0].geometry.location);
    }
  });
};

var positionForGPS = function(gps) {
  return {
    coords: {
      latitude: gps.k,
      longitude: gps.B,
    }
  }
};

var dropPinForAddress = function(address, text, markerColor, markerLetter) {
  var marker = "default";
  if (typeof markerColor != "undefined") {
    marker = "images/markers/" + markerColor + "_Marker";
  }
  //if (typeof markerLetter != "undefined") {
  if (markerLetter != "default") {
    marker = marker + markerLetter;
  }
  if (marker != "default") {
    marker = marker + ".png";
  }
  gpsForAddress(address, function(gps) {
    var item = {};
    item.gps = gps;
    item.text = text;
    item.marker = marker;
    mapItems.push(item);
    localStorage.setItem(ITEM_KEY, JSON.stringify(mapItems));
    markPosition(positionForGPS(gps), text, marker);
  });
};

var loadMapItems = function() {
  var items;
  try {
    items = JSON.parse(localStorage.getItem(ITEM_KEY));
  } catch(e) {
    console.log(e);
  }
  items = items || [];
  return items;
};

// Create the map
navigator.geolocation.getCurrentPosition(function(position) {
  drawMap(position);
  mapItems = loadMapItems();
  markPosition(position, "This is me!");
  mapItems.forEach(function(item) {
    markPosition(positionForGPS(item.gps), item.text, item.marker);
  });
}, logError, config);

// tell the map to redraw when resized
var resizeTimeout; 
google.maps.event.addDomListener(window, "resize", function() { 
  if (resizeTimeout) { 
    clearTimeout(resizeTimeout); 
  } 
  resizeTimeout = setTimeout(function() {
    var mapcontainer = document.querySelector("#my_google_map");
    //var center = MAP.getCenter();
    getMapSize(mapcontainer);
    // I was reseting the map on the last marker, but maybe the user doesn't want that...
    //MAP.setCenter(COORDS);
  }, 250); 
});