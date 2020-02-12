if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('service worker registered'))
        .catch(err => console.log('service worker not registered', err));
}

// FUNCTIONS
function addURLParams(currentURL, paramKey, paramValue) {
    let tempArray = currentURL.split("?");
    let baseURL = tempArray[0];
    let params = tempArray[1];
    let newUrl = "";
    let last = "";
    
    if (params) {
        let check = false;
        tempArray = params.split("&");
        for (let tuple of tempArray) {
            let tupleVal = tuple.split("=");
            if (tupleVal[0] == paramKey) {
                newUrl += last + paramKey + "=" + paramValue;
                check = true;
            } else {
                newUrl += last + tuple;
            }
            last = "&";
        }
        if (check == false) {
            newUrl += last + paramKey + "=" + paramValue;
        }
    } else {
        newUrl = paramKey + "=" + paramValue;
    }
    
    return baseURL + "?" + newUrl;
}

function removeURLParams(currentURL, paramKey) {
    let tempArray = currentURL.split("?");
    let baseURL = tempArray[0];
    let params = tempArray[1];
    let newUrl = "";
    let last = "";
    
    if (params) {
        tempArray = params.split("&");
        for (let tuple of tempArray) {
            let tupleVal = tuple.split("=");
            if (tupleVal[0] != paramKey) {
                newUrl += last + tuple;
            }
            last = "&";
        }
    }
    if (newUrl != "") {
        newUrl = "?" + newUrl;
    }
    return baseURL + newUrl;
}

function getParameterValue(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getUserLanguage() {
    let currentLang = getParameterValue("lang");
    if ((currentLang != null) && (currentLang != "")) {
        return currentLang;
    }
    return "lv";
}

function changeLanguage(selectedLanguage) {
    let newUrl = addURLParams(window.location.href, "lang", selectedLanguage);
    newUrl = addURLParams(newUrl, "coordinates", JSON.stringify(map.getCenter()));
    newUrl = addURLParams(newUrl, "zoom", JSON.stringify(map.getZoom()));
    window.location.href = newUrl;
}

function postSnackbar(message) {
    var toast = document.getElementById("toast");
    toast.innerHTML = message;
    toast.className = "show";

    setTimeout(function () {
        toast.className = toast.className.replace("show", "");
    }, 4000);
}

function getStartingView() {
    let defaultValues =  {
        "coordinates": [56.41, 24.188],
        "zoom": 14
    };
    let newUrl = window.location.href;
    let changed = false;
    let lastCoordinates = getParameterValue("coordinates");
    if ((lastCoordinates != null) && (lastCoordinates != "")) {
        lastCoordinates = JSON.parse(lastCoordinates)
        defaultValues.coordinates = [lastCoordinates.lat, lastCoordinates.lng];
        newUrl = removeURLParams(newUrl, "coordinates");
        changed = true;
    }
    let lastZoom = getParameterValue("zoom");
    if ((lastZoom != null) && (lastZoom != "")) {
        defaultValues.zoom = JSON.parse(lastZoom);
        newUrl = removeURLParams(newUrl, "zoom");
        changed = true;
    }
    if (changed) {
        history.pushState({
            page: 'homepage'
        }, 'BauskaTour', newUrl);
    }
    return defaultValues;
}

// CHECK IF IMAGE EXISTS
function imageExists(image_url) {
    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    http.send();

    return http.status != 404;
}

// LEAFLET LOCATION FUNCTION OVERRIDE
function onLocationErrorOverride(err, lang) {
    postSnackbar(langData['user_location_error'][lang]);
}

function onLocationOutsideMapBoundsOverride(control, lang) {
    control.stop();
    postSnackbar(langData['user_not_in_bauska_location'][lang]);
}

// INITIAL VARIABLE SETUP
let pageLang = getUserLanguage();

// MAP SETUP
let northEast = L.latLng(56.5, 24.5),
    southWest = L.latLng(56.3, 23.9),
    bounds = L.latLngBounds(southWest, northEast);

let startingView = getStartingView();

let map = L.map('map', {
    minZoom: 14,
    maxZoom: 18,
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
}).setView(startingView.coordinates, startingView.zoom);

map.zoomControl.setPosition('bottomright');

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3Jpc2phbmlzMjAwMCIsImEiOiJjazI2NHowdDkwdWc0M2RwOTdpYzRvenVjIn0.l8eJ9WC6kcGE6rDwaUXd7Q', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener">Improve this map</a></strong>',
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoia3Jpc2phbmlzMjAwMCIsImEiOiJjazI2NHowdDkwdWc0M2RwOTdpYzRvenVjIn0.l8eJ9WC6kcGE6rDwaUXd7Q'
}).addTo(map);

map.addControl(L.languageSelector({
    languages: new Array(
        L.langObject('lv', 'Latviešu', './data/flag_icons/lv.png'),
        L.langObject('en', 'English', './data/flag_icons/gb.png')
    ),
    hideSelected: true, // this is modified not to hide the current language but to put a black border under its flag
    initialLanguage: pageLang,
    callback: changeLanguage
}));

L.control.locate({
    "position": "bottomright",
    "showCompass": true,
    "showPopup": false,
    "clickBehavior": {
        inView: 'setView',
        outOfView: 'setView',
        inViewNotFollowing: 'setView'
    },
    "onLocationError": function(e){
        onLocationErrorOverride(e, pageLang);
    },
    "onLocationOutsideMapBounds": function(e){
        onLocationOutsideMapBoundsOverride(e, pageLang);
    }
}).addTo(map);

// POPUP WINDOW
let popupWindow = document.getElementById('popupWindow');
let popupContent = document.getElementById("popupContent");
let closePopup = document.getElementById('closePopup');
let closePopupBackground = document.getElementById('closePopupBackground');
// POPUP WINDOW DATA
let popupTitle = document.getElementById('popupTitle');
let popupDescription = document.getElementById('popupDescription');
let popupAdditionalInfo = document.getElementById('popupAdditionalInfo');
let popupAmenities = document.getElementById('popupAmenities');
let popupPrice = document.getElementById('popupPrice');
let popupCellphone = document.getElementById('popupCellphone');
let popupAddress = document.getElementById('popupAddress');
let popupOpeningTimes = document.getElementById('popupOpeningTimes');
let popupUrl = document.getElementById('popupUrl');


// IMPORTANT MARKER FUNCTIONS
function createMarkers(type) {
    for (let object of Object.keys(jsonData)) {
        let objType = jsonData[object]["type_"+pageLang];
        if (objType == type) {
            let title = object;
            let coordinates = jsonData[object].coordinates;
            let mData = jsonData[object];
            
            // if (!imageExists("./data/object_icons/" + jsonData[object].icon)) {
            //     jsonData[object].icon = "template.svg";
            // }

            let icon = L.icon({
                iconUrl: "./data/object_icons/" + jsonData[object].icon,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [20, 0]
            });

            let markerIcon = L.marker(coordinates, { icon: icon, markerTitle: title, markerData: mData, markerType : objType, isData : true }).addTo(map);
            
            markerIcon.on('click', function() {
                let urlParams = addURLParams("", "place", this.options.markerTitle);
                history.pushState({
                    page: urlParams
                }, this.options.markerTitle, urlParams);
                displayInfoPopup(this.options);
            });
		
	    markerIcon.bindTooltip(title);
        }
    }
}

function createLayer(type, child, parent) {
    let extraStyle = (child) ? "child" : "";
    if (parent != undefined) {
        parent = parent.replace(" ", "_");
    }
    let parentAttribute = (child) ? "data-parent="+parent : "";
    let layerControlTable = document.getElementById("layerControlTable");
    let currentInnerHTML = layerControlTable.innerHTML;
    let typeId = type.replace(" ", "_");

    if (!imageExists("./data/simple_icons/" + dataIcons[pageLang][type])) {
            dataIcons[pageLang][type] = "template.svg";
    }

    let newInnerHTML = `
        <tr>
            <td class='${extraStyle}'>
                <input type='checkbox' name='${type}' id='${typeId}Layer' 
                    class='layerCheckbox noselect' value='${type}'
                    onchange='updateMarkers(this);' ${parentAttribute} checked>
                <label for='${typeId}Layer' class='layerCheckboxLabel noselect'>
                    <div class='image' style="background: ${dataColor[pageLang][type]};" color-data='${dataColor[pageLang][type]}'>
                        <img src='./data/simple_icons/${dataIcons[pageLang][type]}' alt=''>
                    </div>
                    <div class='name'>
                        ${type}
                    </div>
                </label>
            </td>
        </tr>`;
    layerControlTable.innerHTML = currentInnerHTML + newInnerHTML;
}

$(function () {
    $('td:first-child input').change(function () {
        let parent = this.getAttribute('data-parent');
        if (parent != null) {
            let allUnchecked = true;
            let listOfChildren = $("input[data-parent='" + parent + "']");
            for (let i of listOfChildren) {
                if (i.checked) {
                    allUnchecked = false;
                }
            }
            parent += "Layer";
            let elemInput = $("#" + parent);
            let imageElem = elemInput.parent().find('div.image');
            let elemColor = imageElem.attr("color-data");
            if (allUnchecked) {
                imageElem.css("background", "white");
                elemInput.prop("checked", false);
            } else {
                imageElem.css("background", elemColor);
                elemInput.prop("checked", true);
            }
        } else {
            let currentName = this.id.replace("Layer", "");
            if (this.checked) {
                let listOfChildren = $("input[data-parent='" + currentName + "']");
                if (listOfChildren.length != 0) {
                    for (let i of listOfChildren) {
                        i.checked = true;
                        let iElem = $(i).parent().find('div.image');
                        let iElemColor = iElem.attr("color-data");
                        iElem.css("background", iElemColor);
                        updateMarkers(i);
                    }
                }
            } else {
                let listOfChildren = $("input[data-parent='" + currentName + "']");
                if (listOfChildren.length != 0) {
                    for (let i of listOfChildren) {
                        i.checked = false;
                        $(i).parent().find('div.image').css("background", "white");
                        updateMarkers(i);
                    }
                }
            }
        }
        let elem = $(this).parent().find('div.image');
        let elemColor = elem.attr("color-data");
        if (this.checked) {
            elem.css("background", elemColor);
        } else {
            elem.css("background", "white");
        }
    });
});

function removeMarkers(type) {
    map.eachLayer(function (layer) {
        if (layer.options.isData) {
            if (layer.options.markerType == type) {
                map.removeLayer(layer);
            }
        }
    });
}

function updateMarkers(elem) {
    if (elem.checked) {
        createMarkers(elem.value);
    } else {
        removeMarkers(elem.value);
    }
};

// CREATE ALL MARKERS
for (type of dataTypes[pageLang]) {
    createMarkers(type);
}

// CREATE ALL LAYERS
for (parent of parentsList[pageLang]) {
    if (hierarchyDict[pageLang][parent] == "") {
        createLayer(parent);
    } else {
        createLayer(parent);
        for (type of hierarchyDict[pageLang][parent]) {
            createLayer(type, true, parent);
        }
    }
}
// LAYER CONTAINER FUNCTIONS ON MOBILE
function openLayerContainer() {
    $("#layerContainer").show("fast");
    $("#layerClose").show();
}

function closeLayerContainer() {
    $("#layerContainer").hide("fast");
    $("#layerClose").hide();
}

// INFO POPUP FUNCTIONS
function displayInfoPopup(data) {
    popupWindow.style.display = "block";
    closePopupBackground.style.display = "block";

    popupTitle.innerHTML = "<br />" + data.markerTitle;
    popupDescription.innerHTML = (data.markerData["description_" + pageLang] != "" && data.markerData["description_" + pageLang] != null) ? data.markerData["description_" + pageLang] : "";
    popupAdditionalInfo.innerHTML = (data.markerData["additional_info_"+pageLang] != "" && data.markerData["additional_info_"+pageLang] != null) ? data.markerData["additional_info_"+pageLang] : "";
    popupAmenities.innerHTML = (data.markerData.amenities != "" && data.markerData.amenities != null) ? "<b>" + langData["amenities"][pageLang] + "</b>" + data.markerData.amenities : "";
    popupPrice.innerHTML = (data.markerData.price != "" && data.markerData.price != null) ? "<b>" + langData["price"][pageLang] + "</b>" + data.markerData.price : "";
    popupCellphone.innerHTML = (data.markerData.cellphone != "" && data.markerData.cellphone != null) ? "<b>Tel: </b>" + data.markerData.cellphone : "";
    popupAddress.innerHTML = (data.markerData.address != "" && data.markerData.address != null) ? "<b>" + langData["address"][pageLang] + "</b>" + data.markerData.address : "";
    // popupUrl.innerHTML = (data.markerData.url != "" && data.markerData.url != null) ? "<a href='" + data.markerData.url + "' target='_blank'>" + langData["more_info"][pageLang] + "</a>" : "";
    popupPhotos = data.markerData["photos"];
    popupReferences = data.markerData["references"];
    popupReferencesImages = data.markerData["referencesImages"];
    popupReferencesImagesTitles = data.markerData["referencesImagesTitles"];
    popupReferencesTitles = data.markerData["referencesTitles"];
   
    // Clean images and references fields before adding new ones
    document.querySelector("#popup-carousel-inner").innerHTML = "";
    document.querySelector("#popup-carousel-indicators").innerHTML = "";
    document.querySelector("#referencesInPopup").innerHTML = "";


    // Add Reference Title if exists references
    if ((popupReferences != null && popupReferences != "") || (popupReferencesImages != null && popupReferencesImages != "")) {
        document.querySelector("#referencesInPopup").innerHTML += "Avoti: ";
	// Fast Bug fix
	if (popupAddress.innerHTML != null && popupAddress.innerHTML != "") {
	    popupAddress.innerHTML += "<br />";
	}
    }
	


    // Add References (for text)
	if (popupReferences != null && popupReferences != "") {
		popupReferences = popupReferences.split(",");
		popupReferencesTitles = popupReferencesTitles.split(",");
		for (let i = 0; i < popupReferences.length; i++) {
			// Fast Bug fix
			if (popupAddress.innerHTML != null && popupAddress.innerHTML != "") {
			    popupAddress.innerHTML += "<br />";
			}
			document.querySelector("#referencesInPopup").innerHTML += "" +
			"<div class=\"referencesText\"><a target=\"a_blank\" href=" + popupReferences[i] + " </a> " + popupReferencesTitles[i] + " </a></div>";
		}
	}

	// Add References (for images)
	if (popupReferencesImages != null && popupReferencesImages != "") {
		popupReferencesImages = popupReferencesImages.split(",");
		popupReferencesImagesTitles = popupReferencesImagesTitles.split(",");
		for (let i = 0; i < popupReferencesImages.length; i++) {
			// Fast Bug fix
			if (popupAddress.innerHTML != null && popupAddress.innerHTML != "") {
			    popupAddress.innerHTML += "<br />";
			}
			document.querySelector("#referencesInPopup").innerHTML += "" +
			"<div class=\"referencesText\"><a target=\"a_blank\" href=" + popupReferencesImages[i] + " </a> " + popupReferencesImagesTitles[i] + " </a></div>";
		}
	}


    // Loop through photo items and add them to the carousel
    if (popupPhotos != null && popupPhotos != "") {
        let carouselCounter = 0;
        for (let item of popupPhotos.split(",")) {

            // Add images
            item = item.trim();
            if (carouselCounter == 0) { // Only for first image to make it active
                document.querySelector("#popup-carousel-inner").innerHTML += "" +
                    "<div class=\"item active\">\n" +
                    "<img class=\"imagePartImage\" src=\"./data/object_image/" + item + ".jpg\" alt=" + item + " style=\"width:100%;\">\n" +
                    "</div>\n";
            } else {
                document.querySelector("#popup-carousel-inner").innerHTML += "" +
                    "<div class=\"item\">\n" +
                    "<img class=\"imagePartImage\" src=\"./data/object_image/" + item + ".jpg\" alt=" + item + " style=\"width:100%;\">\n" +
                    "</div>\n";
            }

            // Add indicators
            if (carouselCounter == 0) { // Only for first image to make it active
                document.querySelector("#popup-carousel-indicators").innerHTML += "" +
                    "<div class=\"numberCircle active\" data-target=\"#myCarousel\" data-slide-to=" + carouselCounter + ">" + (parseInt(carouselCounter) + 1) + " </div>"
            } else {
                document.querySelector("#popup-carousel-indicators").innerHTML += "" +
                    "<div class=\"numberCircle\" data-target=\"#myCarousel\" data-slide-to=" + carouselCounter + ">" + (parseInt(carouselCounter) + 1) + " </div>"
            }

            carouselCounter++;
        }

        // Add event listeners to change "active" status of images
        let indicators = document.querySelectorAll(".numberCircle");
        for (let indicator of indicators) {
            indicator.addEventListener("click", function (ev) {
                let isActive = ev.target.classList.contains("active");
                if (!isActive) {
                    document.querySelector(".numberCircle.active").classList.remove("active");
                    ev.target.classList.add("active");
                }
            });
        }
    }

    // Add textual information 
    let popupOpeningTimesVal = "";
    if (data.markerData.opening_times != "" && data.markerData.opening_times != null) {
        popupOpeningTimesVal += `
            <tr>
                <th>${langData["opening_times"][pageLang]}</th>
                <th></th>
            </tr>`;
        for (let key of Object.keys(data.markerData.opening_times)) {
            popupOpeningTimesVal += `
                <tr>
                    <td>${langData[key][pageLang]}</td>
                    <td>${((data.markerData.opening_times[key] == "closed") ? langData["closed"][pageLang] : data.markerData.opening_times[key])}</td>
                </tr>`;
        }
    }
    // popupOpeningTimes.innerHTML = popupOpeningTimesVal;

    let cHeight = popupWindow.offsetHeight - popupTitle.offsetHeight - 32;
    popupContent.style.height = cHeight + "px";
}

function closeInfoPopup() {
    popupWindow.style.display = "none";
    closePopupBackground.style.display = "none";
    let newUrl = removeURLParams(window.location.href, "place");
    history.pushState({
        page: 'homepage'
    }, 'BauskaTour', newUrl);
}

// Close popup on ESC
document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        closeInfoPopup();
    }
};

// OPEN POPUP IF QUERY STRING PASSED
let place = getParameterValue("place");
if ((place != null) && (place != "")) {
    let placeData = jsonData[place];
    if (placeData != undefined) {
        let returnData = {};
        returnData.markerTitle = place;
        returnData.markerData = placeData;
        displayInfoPopup(returnData);
    }
}

// BACK BUTTON ACTION
let open = (getParameterValue("place") != null && getParameterValue("place") != "") ? true : false;
window.onpopstate = function(e) {
    let place = getParameterValue("place", window.location.href);
    if ((place != null) && (place != "")) {
        this.open = true;
        console.log("first");
        let placeData = jsonData[place];
        if (placeData != undefined) {
            let returnData = {};
            returnData.markerTitle = place;
            returnData.markerData = placeData;
            displayInfoPopup(returnData);
        }
    } else if (this.open) {
        closeInfoPopup();
        this.open = false;
    } else {
        this.history.back();
    }
};
