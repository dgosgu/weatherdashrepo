const BARLOVENTO = [18.4769, -66.2796];

const map = L.map("map").setView(BARLOVENTO, 15);

// dark map theme
L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
  maxZoom: 20,
  attribution: '&copy; OpenStreetMap contributors &copy; Stadia Maps'
}).addTo(map);

// custom beach icon
const beachIcon = L.divIcon({
  html: "🌊",
  className: "beach-icon",
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

// main marker
L.marker(BARLOVENTO, { icon: beachIcon })
  .addTo(map)
  .bindPopup("<b>Barlovento Beach</b><br>Dorado Beach");

// nearby spots
const spots = [
  {
    name: "Barlovento / GoodWinds",
    coords: [18.4769, -66.2796],
    emoji: "🌊"
  },
  {
    name: "Dorado Beach",
    coords: [18.4729, -66.2781],
    emoji: "🏖️"
  },
  {
    name: "Playa Sardinera",
    coords: [18.4715, -66.2725],
    emoji: "📍"
  }
];

spots.forEach(spot => {
  const icon = L.divIcon({
    html: spot.emoji,
    className: "beach-icon",
    iconSize: [35, 35],
    iconAnchor: [17, 17]
  });

  L.marker(spot.coords, { icon })
    .addTo(map)
    .bindPopup(`<b>${spot.name}</b>`);
});

// user location button
L.control.locateButton = function() {
  const control = L.control({ position: "topright" });

  control.onAdd = function() {
    const button = L.DomUtil.create("button", "locate-btn");
    button.innerHTML = "📍";
    button.onclick = function() {
      map.locate({ setView: true, maxZoom: 15 });
    };
    return button;
  };

  return control;
};

L.control.locateButton().addTo(map);

map.on("locationfound", function(e) {
  L.marker(e.latlng)
    .addTo(map)
    .bindPopup("You are here")
    .openPopup();
});