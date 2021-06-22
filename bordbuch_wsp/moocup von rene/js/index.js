/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

appVersion = "0.1.1";

// titleLayerLand = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
titleLayerLand = 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png';

// Maximale Gültigkeit der Session in Minuten
maxSessionLimit = 60;
ajaxToken = '15b8aaaf134831b5401c9745d562c0271ab206bed361568d30178f83947e9d80';

// Server für Ajax-Requests
// LDAP-Auth, DB Query
webServerHostUrl = 'http://kabeldoku.poldom.local/pdfisierung/';
// webServerHostUrl = 'http://10.10.10.12/pdfisierung/';
// webServerHostUrl = 'https://ext-webapp-1-v.int.polizei.berlin.de/pdfisierung/';

var app = {
    // Application Constructor
    initialize: function() {
		document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		document.addEventListener('deviceready', onDeviceReady, false);
		document.addEventListener('offline', onOffline, false);
		// document.addEventListener('online', onOnline, false);
    }, 

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
		this.receivedEvent('deviceready');
	},

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


function getDateTime() {
	var d = new Date();
	var d_month = d.getMonth();
	d_month++;
	if(d_month < 10) d_month = "0" + d_month;
	var now = d.getFullYear() + '-' + d_month + '-' + d.getDate() + 'T' + d.getHours() + ':' + d.getMinutes();
	return now;
}


function onDeviceReady() {
	// checkOffline();

	// Prüfen ob Sessionlänge noch nicht erreicht ist
	// ggf. Verlängerung der Session
	/*
	if(checkLocalAuth() == true) {
		// Loginform aus- und Upload einblenden:
		toggleLoginView('upload');
	} else {
		toggleLoginView('login');
	}
	*/


	$('#page_view_login').removeClass('d-none').addClass('d-block');
	// $('#page_view_test1').removeClass('d-none').addClass('d-block');
	// $('#footerVersion').text("Version: " + appVersion);
	$('#inputTime').val(getDateTime());
};


function checkOffline() {
	var networkState = navigator.connection.type;
	if (networkState === 'none') {
		alert('ACHTUNG, das Gerät ist offline! Die App funktioniert nur mit aktiver Internetverbindung. #1');
	}
}


function onOffline() {
	// Handle the offline event
    alert('ACHTUNG, das Gerät ist offline! Die App funktioniert nur mit aktiver Internetverbindung. #2');
};


// debug:
/*
function onOnline() {
	// Handle the online event
    var networkState = navigator.connection.type;
    alert('Connection type: ' + networkState);
    // console.log("lost connection");
};
*/


// Allen ajax-Requests einen Token hinzufügen, da dieser vom Server (PHP) abgefragt wird.
$.ajaxSetup({
	headers : {
		'app-token': ajaxToken
	},
	beforeSend: function() { $('#ajax-loader').removeClass('d-none').addClass('d-block'); },
	complete: function() { $('#ajax-loader').removeClass('d-block').addClass('d-none'); }
});


function navGoToList() {
	if(checkLocalAuth() == true) {
		window.location.href="list.html";
	} else {
		alert('Fehler, bitte zuerst einloggen.');
	}
}


// Login-Formular absenden
/*
$("#form_login").submit(function(e) {
	console.log('DEBUG: Login-Formular absenden');
	e.preventDefault();
	var username = $('#login_form_input_username').val();
	var password = $('#login_form_input_password').val();
	$('#login_form_input_username').val('');
	$('#login_form_input_password').val('');
	ajaxCheckAuth(username, password);
});
*/

// Passwort bei Bedarf für 2 Sekunden einblenden.
// Erneutes Antippen verdeckt das PW wieder sofort.
$('#login_form_input_password_toggle').click(function() {
	if($('#login_form_input_password').attr('type') === 'password') {
		$('#login_form_input_password').attr('type', 'text');
		setTimeout("$('#login_form_input_password').attr('type', 'password');", 2000);
	} else {
		$('#login_form_input_password').attr('type', 'password');
	}
});

// Logout-Prozedur starten
$('#navMenuLogout').click(function() {
	logoutAndClear();
});

//DEBUG:
$('#login_form_input_debug_1').click(function() {
	$('#login_form_input_username').val(24000001);
	$('#login_form_input_password').val('Pa$$w0rd');
});
//


// scan:
$('#ship_qrcode_button').click(function() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if(!result.cancelled)
            {
                if(result.format == "QR_CODE")
                {
					// alert("Scan: " + result.text);
					$("#ship_qrcode_form_input_ship > option").each(function() {
						// alert($(this).text() + " : " + $(this).val());
						if($(this).text() == result.text) {
							$("#ship_qrcode_form_input_ship option[value='" + result.text + "']").attr('selected',true);
							return false;
						}
					});
                } else {
					alert("Ungültiges Format: " + result.format);
				}
            } else {
				alert("Scan abgebrochen!");
			}
        },
        function (error) {
            alert("Scanning failed: " + error);
        }
   );
});
//

// Wechsel zwischen Login-Form und PDF-Upload-Form
function toggleView(view, navid) {
	$('[id^=page_view_]').each(function() {
		$(this).removeClass('d-block').addClass('d-none');
	});
	$('#'+view).removeClass('d-none').addClass('d-block');

	$('[id^=navitemtop_]').each(function() {
		$(this).removeClass('navbartopactive');
	});
	$('#'+navid).addClass('navbartopactive');
	
}


/* Nav Bar Bottom: */

$('#login_button_submit').click(function() {
	toggleView('page_view_ship_qrcode', 'navitemtop_bordbuchwahl');
});

$('#ship_qrcode_button_back').click(function() {
	toggleView('page_view_login', '');
});
$('#ship_qrcode_button_submit').click(function() {
	toggleView('page_view_zweck', 'navitemtop_zweck');
});

$('#zweck_button_back').click(function() {
	toggleView('page_view_ship_qrcode', 'navitemtop_bordbuchwahl');
});
$('#zweck_button_submit').click(function() {
	toggleView('page_view_crew', 'navitemtop_besatzung');
});

$('#crew_button_back').click(function() {
	toggleView('page_view_zweck', 'navitemtop_zweck');
});
$('#crew_button_submit').click(function() {
	toggleView('page_view_eingaben', 'navitemtop_eingaben');
});

$('#eingaben_button_back').click(function() {
	toggleView('page_view_crew', 'navitemtop_besatzung');
});
$('#eingaben_button_submit').click(function() {
	toggleView('page_view_maengel', 'navitemtop_maengel');
});

$('#maengel_button_back').click(function() {
	toggleView('page_view_eingaben', 'navitemtop_eingaben');
});
$('#maengel_button_submit').click(function() {
	toggleView('page_view_hinweise', 'navitemtop_hinweise');
});

$('#hinweise_button_back').click(function() {
	toggleView('page_view_maengel', 'navitemtop_maengel');
});
$('#hinweise_button_submit').click(function() {
	toggleView('page_view_map', 'navitemtop_map');
});

$('#map_button_back').click(function() {
	toggleView('page_view_hinweise', 'navitemtop_hinweise');
});
$('#map_button_submit').click(function() {
	// toggleView('page_view_map', 'navitemtop_map');
	// alert("Fahrt beenden. Sync starten. Abmeldung?");
});

// end nav


doGeoLog = false;
$('#map_button_startend').click(function() {
	if(doGeoLog == false) {
		doGeoLog = true;
		$(this).html('Fahrt beenden');
		$(this).removeClass('btn-secondary').addClass('btn-danger');
	} else {
		alert("Fahrt beenden. Sync starten. Abmeldung?");
	}
});






personNumber = 0;
$('#crew_add').click(function() {
	// var now = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss");
	// var temp = getDateTime();
	// alert(temp);
	var personHTML = `
		<div class="form-group">
			<label for="inputGroupPers[` + personNumber + `]">Person ` + (personNumber+1) + `</label>
			<input type="number" class="form-control" id="inputGroupPers[` + personNumber + `]" name="inputGroupPers[` + personNumber + `]" placeholder="PersNr">
		</div>
		<div class="input-group mb-3">
			<input class="form-control" type="datetime-local" id="inputPersTime[` + personNumber + `]" name="inputPersTime[` + personNumber + `]">
			<div class="input-group-append">
				<select class="custom-select" id="inputGroupBord[` + personNumber + `]" name="inputGroupBord[` + personNumber + `]">
					<option selected>wählen</option>
					<option value="1">an Bord</option>
					<option value="2">von Bord</option>
				</select>
			</div>
		</div>
	`;

	$('#crew_list').append(personHTML);
	personNumber++;
});

// take photo: https://stackoverflow.com/questions/10335563/capturing-and-storing-a-picture-taken-with-the-camera-into-a-local-database-ph

// KARTE:
/*
var map = L.map('map').fitWorld();

L.tileLayer(titleLayerLand, {
	maxZoom: 18,
	attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
}).addTo(map);

function onLocationFound(e) {
	alert("e.latlng: " + e.latlng); //LatLng(52.24244, 12.4545774)
	var radius = e.accuracy / 2;

	L.marker(e.latlng).addTo(map)
		.bindPopup("aktuelle Position (auf " + radius + " Meter genau)").openPopup();

	L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
	alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.locate({setView: true, maxZoom: 16});
map.setZoom(16);
*/


var map = L.map('map').fitWorld();
L.tileLayer(titleLayerLand, {
	maxZoom: 18,
	attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
}).addTo(map);

var onGeoLocationSuccess = function(position) {
	//alert('Latitude: '        + position.coords.latitude          + '\n' +
	//	'Longitude: '         + position.coords.longitude         + '\n' +
	//	'Altitude: '          + position.coords.altitude          + '\n' +
	//	'Accuracy: '          + position.coords.accuracy          + '\n' +
	//	'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
	//	'Heading: '           + position.coords.heading           + '\n' +
	//	'Speed: '             + position.coords.speed             + '\n' +
	//	'Timestamp: '         + position.timestamp                + '\n');
	
	var radius = position.coords.accuracy / 2;
	// LatLng(52.24244, 12.4545774)
	// var latlng = position.coords.latitude + ", " + position.coords.longitude;

	// L.marker(latlng).addTo(map)
	L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)
		.bindPopup("aktuelle Position (auf " + radius + " Meter genau)");

	L.circle([position.coords.latitude, position.coords.longitude], radius).addTo(map);
	map.setView([position.coords.latitude, position.coords.longitude], 18);
	map.invalidateSize();

};




// onError Callback receives a PositionError object
//
function onGeoLocationError(error) {
	alert('code: '    + error.code    + '\n' +
		  'message: ' + error.message + '\n');
}

navigator.geolocation.getCurrentPosition(onGeoLocationSuccess, onGeoLocationError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
// map.on('locationfound', onLocationFound);

// map.locate({setView: true, maxZoom: 16});




app.initialize();