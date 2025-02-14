import { MDCRipple } from "@material/ripple";
const fabRipple = new MDCRipple(document.querySelector(".mdc-fab"));

var access_token = process.env.MAPBOX_GL_ACCESS_TOKEN;
var style_uri = process.env.MAPBOX_STYLE_URI;
var geojson_source = process.env.GEOJSON_DATA_SOURCE;

mapboxgl.accessToken = access_token;

var map = new mapboxgl.Map({
  container: "map",
  style: style_uri,
  center: [24.689824, -28.725478],
  zoom: 5.13
});

map.on("load", function() {
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  map.addSource("locations", {
    type: "geojson",
    // Point to GeoJSON data.
    data: geojson_source,
    cluster: true,
    generateId: true
    // clusterMaxZoom: 14, // Max zoom to cluster points on
    // clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "locations",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#8187ff",
        10,
        // "#83b9ff",
        "#6200ee",
        50,
        "#448aff"
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
      "circle-opacity": 0.8
    }
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "locations",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
      "text-size": 15
    }
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "locations",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 6,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff"
    }
  });

  // inspect a cluster on click
  map.on("click", "clusters", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"]
    });
    var clusterId = features[0].properties.cluster_id;
    map
      .getSource("locations")
      .getClusterExpansionZoom(clusterId, function(err, zoom) {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
  });

  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  map.on("mouseenter", "unclustered-point", function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var desc = e.features[0].properties.description;
    var name = e.features[0].properties.name;
    var address = e.features[0].properties.address;
    var location = e.features[0].properties.location;
    var telephone = e.features[0].properties.telephone;
    // var eligibility_screening = e.features[0].properties.eligibility_screening;
    var referral_required = e.features[0].properties.referral_required;
    var appointment_required = e.features[0].properties.appointment_required;
    var drivethru = e.features[0].properties.drivethru;

    // Ensure that if the map is zoomed out such that
    // multiple copies of the feature are visible, the
    // popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        "<h3>" +
          name +
          "</h3><p>" +
          address +
          "<br><a href='tel:" +
          telephone +
          "'>" +
          telephone +
          "</a><br><a href='" +
          location +
          "'>Directions</a><br><br>Doctor's note required? <strong>" +
          referral_required +
          "</strong><br>Appointment required? <strong>" +
          appointment_required +
          "</strong><br>Drive-through facilty? <strong>" +
          drivethru +
          "</strong></p>"
      )
      .addTo(map);
  });

  // map.on("mouseleave", "unclustered-point", function() {
  //   map.getCanvas().style.cursor = "";
  //   popup.remove();
  // });

  map.on("mouseenter", "clusters", function() {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", function() {
    map.getCanvas().style.cursor = "";
  });
});

map.addControl(new mapboxgl.NavigationControl());
