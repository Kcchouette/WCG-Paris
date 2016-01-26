/* Wikidata for Paris Location Request */
var requestWikidata = "PREFIX wd: <http://www.wikidata.org/entity/>PREFIX wdt: <http://www.wikidata.org/prop/direct/>PREFIX wikibase: <http://wikiba.se/ontology#>PREFIX p: <http://www.wikidata.org/prop/>PREFIX v: <http://www.wikidata.org/prop/statement/>PREFIX q: <http://www.wikidata.org/prop/qualifier/>PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>PREFIX ps: <http://www.wikidata.org/prop/statement/>PREFIX psv: <http://www.wikidata.org/prop/statement/value/>SELECT ?lat ?long WHERE { wd:Q90 p:P625/psv:P625/wikibase:geoLatitude ?lat. wd:Q90 p:P625/psv:P625/wikibase:geoLongitude ?long .}";

/* All Data Location Request with Datalift */
var data = [{
	"name": "wifi",
	"sparql": "PREFIX dsiw: <http://localhost:9091/siw/liste-des-sites-des-hotspots-paris-wifi-csv#> SELECT ?nom ?adresse ?arrondissement ?code ?geoPoint WHERE { ?resource dsiw:nom-du-site ?nom . ?resource dsiw:adresse ?adresse . ?resource dsiw:arrondissement ?arrondissement .?resource dsiw:code-site ?code .   ?resource dsiw:geo-point-2d ?geoPoint}",
	"baseUrl": "http://localhost:9091/sparql/data",
	"url": "http://opendata.paris.fr/explore/dataset/liste_des_sites_des_hotspots_paris_wifi/informations/",
	"icon": "fa-wifi",
	"title": "hotspots place in Paris"
}, {
	"name": "coffee",
	"sparql": "PREFIX dsiw: <http://localhost:9091/siw/liste-des-cafes-a-un-euro-csv#> SELECT ?nom ?adresse ?arrondissement ?geoPoint WHERE { ?resource dsiw:nom-du-cafe ?nom . ?resource dsiw:adresse ?adresse . ?resource dsiw:arrondissement ?arrondissement . ?resource dsiw:geoloc ?geoPoint}",
	"baseUrl": "http://localhost:9091/sparql/data",
	"url": "http://opendata.paris.fr/explore/dataset/liste-des-cafes-a-un-euro/informations/",
	"icon": "fa-coffee",
	"title": "coffee for one euro in Paris"
}, {
	"name": "green_places",
	"sparql": "PREFIX dsiw: <http://localhost:9091/siw/parcsetjardinsparis2010-csv#> SELECT ?nom ?adresse ?arrondissement ?anneeOuverture ?statut ?surface ?geoPoint WHERE { ?resource dsiw:nom-ev ?nom . ?resource dsiw:adresse ?adresse . ?resource dsiw:arrondissement ?arrondissement . ?resource dsiw:annee-ouverture ?anneeOuverture . ?resource dsiw:statut ?statut . ?resource dsiw:surface-administrative-m2 ?surface . ?resource dsiw:geo-point ?geoPoint . FILTER (?statut = \"O\")}",
	"baseUrl": "http://localhost:9091/sparql/data",
	"url": "http://opendata.paris.fr/explore/dataset/parcsetjardinsparis2010/informations/",
	"icon": "fa-tree",
	"title": "green places in Paris"
}];

/* Global Function */
function writeDataInnerHtml(id, data) {
	var selectedElement = document.getElementById(id);
	var newSelectedElement = selectedElement.cloneNode(false);
	newSelectedElement.innerHTML = data;
	selectedElement.parentNode.replaceChild(newSelectedElement, selectedElement);
}

/* Begin Script */
//init layout
var wifi = L.layerGroup();
var coffee = L.layerGroup();
var green_places = L.layerGroup();

//init custom marker
var wifiIcon = L.icon({
    iconUrl: 'img/wi-fi-2.png',
    iconSize:     [24, 28], // size of the icon
    iconAnchor:   [12, 28], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -25] // point from which the popup should open relative to the iconAnchor
});
var coffeeIcon = L.icon({
    iconUrl: 'img/coffee.png',
    iconSize:     [24, 28], // size of the icon
    iconAnchor:   [12, 28], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -25] // point from which the popup should open relative to the iconAnchor
});
var green_placesIcon = L.icon({
    iconUrl: 'img/forest2.png',
    iconSize:     [24, 28], // size of the icon
    iconAnchor:   [12, 28], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -25] // point from which the popup should open relative to the iconAnchor
});

//init map
var map = L.map('map', {
	layers: [coffee]
});
//add auto-locate button
var lc = L.control.locate({
	keepCurrentZoomLevel: true,//do not zoom. If false, init - locateOptions:{maxZoom: 17}
  strings: {
        title: "Where I am?",
    }
	}).addTo(map);

	map.on('locationfound', function(e) {
		routeControl.spliceWaypoints(0, 1, e.latlng); 	//Set start point of routing machine
});

//add search button
map.addControl(new L.Control.Search({
			layer: coffee,
			initial: false,
			jsonpParam: 'json_callback',
			propertyLoc: ['lat','lon'],
			autoType: false,
			autoCollapse: true,
			zoom: 17,
		}));

//add control
var overlayMaps = {
	"<img src='img/wi-fi-2.png' height='28'>&nbsp;Wifi": wifi,
	"<img src='img/coffee.png' height='28'>&nbsp;Coffees": coffee,
	"<img src='img/forest2.png' height='28'>&nbsp;Green places": green_places

};

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
	var isCollapsed = true;
} else {
	var isCollapsed = false;
}

L.control.layers(null, overlayMaps, {
  collapsed: isCollapsed
}).addTo(map);


//Init routing machine
var routeControl = L.Routing.control({
	router: L.Routing.osrm({ serviceUrl:"https://router.project-osrm.org/viaroute"} )
}).addTo(map);


//Do wikidata request
AjaxGetRequest("https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=" + encodeURIComponent(requestWikidata));

//Do request
document.getElementById('DataSparql').innerHTML = '';
var dataShowSource = '';
for(var i = 0; i < data.length; ++i) {
	AjaxPostRequest(data[i].baseUrl, data[i].sparql, data[i].name);
	dataShowSource += '<li><a href="' + data[i].url + '" target="_blank" data-toggle="collapse" data-target=".navbar-collapse.in"><i class="fa ' + data[i].icon + '"></i>&nbsp;&nbsp;' + data[i].title + '</a></li>';
}
writeDataInnerHtml('DataSparql', dataShowSource);


//http://www.openjs.com/articles/ajax_xmlhttp_using_post.php
function AjaxPostRequest(link, requeteSparql, type) {
	var req = new XMLHttpRequest();

	req.open('POST', link, true); //true for asynchronous
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); //pour encoder l'url

	req.onreadystatechange = function () {
		if (req.readyState == 4) { //4 == XMLHttpRequest.DONE ie8+
			if((req.status == 200) || (req.status == 304)) {
				console.log(req.responseXML);
				xmlParser(req.responseXML, type);
			}
			else {
			}
		}
	};
	req.send("query=" + requeteSparql + "&format=application/xml");
}

function AjaxGetRequest(link) {
	var req = new XMLHttpRequest();

	req.open('GET', link, true); //true for asynchronous

	req.onreadystatechange = function () {
		if (req.readyState == 4) { //4 == XMLHttpRequest.DONE ie8+
			if((req.status == 200) || (req.status == 304)) {
				console.log(req.responseXML);
				initMap(req.responseXML)
			}
			else {
			}
		}
	};
	req.send(null);
}

var paris_coord;

function initMap(responseXML){
	for (var i = 0; i < responseXML.getElementsByTagName("variable").length; i++){
		switch (responseXML.getElementsByTagName("variable")[i].getAttribute("name")) {
			case "lat":
				var indiceLat = i;
				break;
			case "long":
				var indiceLong = i;
				break;
			default:

		}
	}

	var baseLat = responseXML.getElementsByTagName("literal")[indiceLat].childNodes[0].nodeValue;
	var baseLong = responseXML.getElementsByTagName("literal")[indiceLong].childNodes[0].nodeValue;

	paris_coord = [baseLat, baseLong];
  	map.setView(paris_coord, 13);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

function xmlParser(responseXML, type){
	for (var i = 0; i < responseXML.getElementsByTagName("variable").length; i++){
		switch (responseXML.getElementsByTagName("variable")[i].getAttribute("name")) {
			case "nom":
				var indiceNom = i;
				break;
			case "adresse":
				var indiceAdresse = i;
				break;
			case "arrondissement":
				var indiceArrondissement = i;
				break;
			case "code":
				var indiceCode = i;
				break;
			case "anneeOuverture":
				var indiceAnneeOuverture = i;
				break;
			case "surface":
				var indiceSurface = i;
				break;
			case "geoPoint":
				var indiceGeoPoint = i;
				break;
			case "geoShape":
				var indiceGeoShape = i;
				break;
			default:

			}
	}

	for (var i = 0; i < responseXML.getElementsByTagName("result").length; i++) {
		var nom = responseXML.getElementsByTagName("result")[i].getElementsByTagName("literal")[indiceNom].childNodes[0].nodeValue;
		var adresse = responseXML.getElementsByTagName("result")[i].getElementsByTagName("literal")[indiceAdresse].childNodes[0].nodeValue;
		var arrondissement = responseXML.getElementsByTagName("result")[i].getElementsByTagName("literal")[indiceArrondissement].childNodes[0].nodeValue;
		var geoPoint = responseXML.getElementsByTagName("result")[i].getElementsByTagName("literal")[indiceGeoPoint].childNodes[0].nodeValue;
		var coordonee = geoPoint.split(",");

		if (type === "wifi") {
			var code = responseXML.getElementsByTagName("result")[i].getElementsByTagName("literal")[indiceCode].childNodes[0].nodeValue;
			wifi.addLayer(L.marker([coordonee[0], coordonee[1]], {title: nom, icon: wifiIcon})
	    		.bindPopup(nom + "<br> Adress: " + adresse + " " + arrondissement + " Paris<br>" + "Site code: " + code + "<br><center><button onclick='destPoint([" + coordonee[0] + "," + coordonee[1] + "]);'>Go to this location</button></center>")
		   		.openPopup());
		}
		if (type === "coffee") {
			coffee.addLayer(L.marker([coordonee[0], coordonee[1]], {title: nom, icon: coffeeIcon})
	    		.bindPopup("<b>" + nom + "</b><br> Adress: " + adresse + " " + arrondissement + " Paris<br><center><button onclick='startPoint([" + coordonee[0] + "," + coordonee[1] + "]);'>Start from this location</button><button onclick='destPoint([" + coordonee[0] + "," + coordonee[1] + "]);'>Go to this location</button></center>")
	    		.openPopup());
		}
		if (type === "green_places") {
			var anneeOuverture = responseXML.getElementsByTagName("result")[i].getElementsByTagName("literal")[indiceAnneeOuverture].childNodes[0].nodeValue;
			var surface = responseXML.getElementsByTagName("result")[i].getElementsByTagName("literal")[indiceSurface].childNodes[0].nodeValue;
			green_places.addLayer(L.marker([coordonee[0], coordonee[1]], {title: nom, icon: green_placesIcon})
		    	.bindPopup("<b>" + nom + "</b><br> Adress: " + adresse + " " + arrondissement + " Paris<br>Opening year: " + anneeOuverture + "<br>Area: " + surface + " m2" + "<br><center><button onclick='destPoint([" + coordonee[0] + "," + coordonee[1] + "]);'>Go to this location</button></center>")
		    	.openPopup());
		}
  }
}

function startPoint(coordonee) {
    //Event, it replace start position
   	routeControl.spliceWaypoints(0, 1, [coordonee[0], coordonee[1]]);
   	lc.stop();
   	map.setView(coordonee);
 	map.setZoom(17);
   	wifi.addTo(map);
   	green_places.addTo(map);
	map.closePopup();
}

function destPoint(coordonee) {
	//Event, it replace end position
   	routeControl.spliceWaypoints(routeControl.getWaypoints().length - 1, 1, [coordonee[0], coordonee[1]]);
	map.closePopup();
}

var popup = L.popup();

function createButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    return btn;
}

function onMapClick(e) {

	//Create popup for change start or end point of routing machine
    var container = L.DomUtil.create('div'),
        startBtn = createButton('Start from this location', container),
        destBtn = createButton('Go to this location', container);

    L.popup()
        .setContent(container)
        .setLatLng(e.latlng)
        .openOn(map);


    //Event, it replace start position
    L.DomEvent.on(startBtn, 'click', function() {
        routeControl.spliceWaypoints(0, 1, e.latlng);
        map.setView(e.latlng);
	 	map.setZoom(17);
        lc.stop();
        map.closePopup();
    });

    //Event, it replace end position
    L.DomEvent.on(destBtn, 'click', function() {
				routeControl.spliceWaypoints(routeControl.getWaypoints().length - 1, 1, e.latlng);
        map.closePopup();
    });

}

map.on('click', onMapClick);
