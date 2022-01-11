// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  console.log(data);

  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}<hr>\
                        Magnitude:${feature.properties.mag}  &nbsp;  &nbsp; Depth:${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });
  // return color based on value
  function getcolor(x) {
    return x < -10 ? "#ff99cc" :
           x < 0  ? "#ff9999" :
           x < 1 ? "#ff9966" :
           x < 2 ? "#ff9933" :
           x < 4 ? "#cc6600" :
           x < 8 ? "#cc3300" :
           x < 16 ? "#cc2200" :
             "#cc1100";
  }

  function getradius(x){
      return(x*5)
  }

  function style(feature) {
    return {
      "color": getcolor(feature.geometry.coordinates[2]),
      "fillcolor":getcolor(feature.geometry.coordinates[2]),
      fillOpacity: 0.75,
      "radius":getradius(feature.properties.mag),
      "stroke": false

    };
  }
 
  var dat = L.geoJson(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, style(feature));
    }
  });
 // dat.addTo(myMap);







  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes,dat);
}

function createMap(earthquakes,layd) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  
/*   var tectonicLayer = L.layerGroup();
  tectonic_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
  d3.json(tectonic_url).then(function (data) {
      var mystyle = {
          "color": "#ff7800",
          "weight": 4,
          "opacity": 0.9
      };
  
      L.geoJSON(data, {
          style: mystyle,
          onEachFeature: function (feature, layer) {
              layer.bindPopup("<h3><u>plate name</u>: " + feature.properties.Name + "</h3>");
              layer.on({
                  "mouseover": highlightFeature,
                  "mouseout": resetFeature
              });
              tectonicLayer.addLayer(layer);
          }
      });
  });
   */


  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });


  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 

  layd.addTo(myMap);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ["-10","0","1","2","4","8","16"];
    var limitColors=["#ff9999","#ff9966","#ff9933","#cc6600","#cc3300","#cc2200","#cc1100"];
    var labels=[]

    // Add the minimum and maximum.
    var legendInfo = "<h1>Depth</h1>" +
      "<div class=\"labels\">" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit ,index) {
//      labels.push("<li " +"&nbsp;&nbsp; style=\"background-color: " + limitColors[index] + "\></li>");
      if (index ==0 ){
        labels.push("<li style=\"background-color: " + limitColors[index] + '\"> &lt;'+limits[index]+"</li>");
      }
      else if (index==6){
        labels.push("<li style=\"background-color: " + limitColors[index] + '\"> &gt;' +limits[index]+"</li>");
      }
      else{
        labels.push("<li style=\"background-color: " + limitColors[index] + '\">'+limits[index]+"</li>");      
      }
//      labels.push("<li style=\"background-color: " + limitColors[index] + "\"></li>");      
//      labels.push("<li style=\"background-color: " + limitColors[index] + '\">'+limits[index]+"</li>");      
      console.log(labels);
    });
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);
 



}
