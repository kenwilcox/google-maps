'use strict';
var MAP;

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

var drawMap = function(position) {
  var mapcontainer = document.createElement('div');
  var MAP_ID = "my_google_map";
  mapcontainer.id = MAP_ID;
  mapcontainer.className = "container form-group";
  debugger;
  //mapcontainer.style.height = '400px';
  //mapcontainer.style.width = '600px';
  var height = Math.max(document.documentElement.clientHeight, window.innerHeight) || 400;
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth) / 4 || 600;
  mapcontainer.style.height =  height - 300 + "px";
  mapcontainer.style.width =  (width * 3) + "px";
  
  document.body.appendChild(mapcontainer);
  
  var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  
  // options - https://developers.google.com/maps/documentation/javascript/controls
  var options = {
    zoom: 15,
    center: coords,
  };
  
  MAP = new google.maps.Map(document.getElementById(MAP_ID), options);
};

var markPosition = function(position, text) {
  var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  
  var marker = new google.maps.Marker({
    position: coords,
    map: MAP,
    title: text || 'You are here!',
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

var dropPinForAddress = function(address, text) {
  gpsForAddress(address, function(gps) {
    markPosition(positionForGPS(gps), text);
  });
};

navigator.geolocation.getCurrentPosition(function(position) {
  drawMap(position);
  markPosition(position, "This is me!");
}, logError, config);

