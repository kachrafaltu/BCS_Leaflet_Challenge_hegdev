// we use the maps that are subscription free

var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
var tectonic_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
function getColor(x) {
  return x < -10 ? "#ff99cc" :
         x < 0  ? "#ff9999" :
         x < 1 ? "#ff9966" :
         x < 2 ? "#ff9933" :
         x < 4 ? "#cc6600" :
         x < 8 ? "#cc3300" :
         x < 16 ? "#cc2200" :
           "#cc1100";
}


function getRadius(d) {
  // remember the radius in L.circle is in the unit of meters
  return 30000 * d;
  // The radius in L.circleMarker is in pixels - 
  // return 3*d;
}

console.log('Starting up');
// Perform a GET request to the query URL
d3.json(queryUrl).then(function (earthquakeData) {
  // Once we get a response, 
  // perform a second json query to get the plates 
  console.log(earthquakeData);
  d3.json(tectonic_url).then(function (tectonicData) {
    // send the data.features object to the createFeatures function
    console.log(tectonicData);
    createFeatures(earthquakeData.features, tectonicData.features);
  });
});

function createFeatures(earthquakeData, tectonicData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the pointToLayer function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {

      // magnitude determines the color
      var color = getColor(feature.geometry.coordinates[2]);

      // Add circles to map
      return L.circle(latlng, {
        weight: 1,
        opacity: 0.75,
        fillOpacity: 0.75,
        color: getColor(feature.geometry.coordinates[2]),
        fillColor: getColor(feature.geometry.coordinates[2]),
        // Adjust radius
        radius: getRadius(feature.properties.mag)
      }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}<hr>\
      Magnitude:${feature.properties.mag}  &nbsp;  &nbsp; Depth:${feature.geometry.coordinates[2]}</p>`);
    } // end pointToLayer

  });

  var plates = L.geoJSON(tectonicData, {
    style: function (feature) {
      return {
        color: "blue",
        weight: 1
      };
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });;



  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street": street,
    "Topo": topo
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    'Earthquakes': earthquakes,
    'Plate boundaries': plates
  };

  // Create our map, giving it the topo and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes, plates]
  });

  var legend = L.control({
    position: 'bottomright'
  });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    var depths = ["-10","0","1","2","4","8","16"];
    depthColors=["#ff9999","#ff9966","#ff9933","#cc6600","#cc3300","#cc2200","#cc1100"];
    var depths = ['<10', '-10 - 0','0-1','1-2', '2-4', '4-8', '8-16', '>16'];

    // loop through our depth intervals and generate a label with a colored square for each interval
    var legendInfo = "<h1>Depth</h1>" +
      "<div class=\"labels\">" +
      "</div>";
    div.innerHTML = legendInfo;

    labels = [];
    depths.forEach(function(depth ,index) {
        labels.push("<li style=\"background-color: " + depthColors[index] + '\">'+depths[index]+"</li>");      
        console.log(labels);
    });
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
      




  }; // end legend.onAdd

  legend.addTo(myMap);


  myMap.on('overlayremove', function (eventLayer) {
    if (eventLayer.name === 'Earthquakes') {
      this.removeControl(legend);
    }
  });

  myMap.on('overlayadd', function (eventLayer) {
    // Turn on the legend...
    if (eventLayer.name === 'Earthquakes') {
      legend.addTo(this);
    }
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}