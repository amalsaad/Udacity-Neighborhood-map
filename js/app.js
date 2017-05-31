
var locations = [
{ name: "King Khalid International Airport - RUH", lat: 24.9594395, long: 46.7069971 },
{ name: "King Fahd International Airport - KFIA", lat: 26.4683689, long: 49.8146732 },
{ name: "Prince Nayef Bin Abdulaziz International Airport - ELQ", lat: 26.3051734, long: 43.7686247 },
{ name: "Prince Mohammad Bin Abdulaziz International Airport - MED", lat: 24.5537422, long: 39.7150786 },
{ name: "King Abdulaziz International Airport - JED", lat: 21.7027188, long: 39.2327382 },
 
];

var map;
var marker;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 24.7249316, lng: 47.102722 },
        zoom: 7
    });

    var self = this;
    this.searchIn = ko.observable("");

    // holds places array, infowindow, markers, and all other info
    self.placeList = ko.observableArray([]);

    // to knockout
    locations.forEach(function (Items) {
        self.placeList.push(new GetLocation(Items));
    });

    this.placeArray = ko.computed(function () {
        var filterSearch = self.searchIn().toLowerCase();
        if (filterSearch) {
            return ko.utils.arrayFilter(self.placeList(), function (Items) {
                var name = Items.name.toLowerCase();
                var result = (name.search(filterSearch) >= 0);
                Items.visible(result);
                return result;
            });
        } else {
            self.placeList().forEach(function (Items) {
                Items.visible(true);
            });
            return self.placeList();
        }
    }, self);

}


function initLocations() {
    ko.applyBindings(new initMap());
}

function onError() {
    alert("failed to load, something went wronge.");
}

var GetLocation = function (data) {

    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.phone = "";
    this.state = "";
    this.twitter = "";

    self.visible = ko.observable(true);

    // foursquare api 

    var fourSquareApi = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=OV0ZUND2P3CMRZFLF10UVF3S4GGL4XLXEKHBFKMKQFEGMQMP&client_secret=15KNS3XRLU4HUCWU2ZU5I1MGTJIG50VWJHECLDTDLONAG55M&v=20170519&query=' + this.name;

    // ajax get venue name, phone number, state and twitter

    $.getJSON(fourSquareApi).done(function (data) {

        console.log("success");

        var responseApi = data.response.venues[0];

        self.phone = responseApi.contact.formattedPhone;
        self.twitter = responseApi.contact.twitter;
        self.state = responseApi.location.state;


        if (self.phone !== undefined) {
            self.phone;
        } else {
            self.phone = "";
        }

        console.log(self.phone + self.state + self.twitter);
    }).fail(function () {
        alert("Error! can't connect to Foursquare API.");
    });

    // infowindow to display content

    this.infoWindowContent = '<div><div>' + data.name + '</div><div>twitter:' + self.twitter + '</div><div>' + self.phone + '</div><div>state:' + self.state + '</div></div>';

    this.infoWindow = new google.maps.InfoWindow({ content: self.infoWindowContent });

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        title: data.name
    });

    //show and hide markers while search

    this.showMarker = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    // open infowindow on click marker

    this.marker.addListener('click', function () {

        self.infoWindowContent = '<div><div>' + data.name + '</div><div>twitter:' + self.twitter + '</div><div>' + self.phone + '</div><div>state:' + self.state + '</div></div>';

        self.infoWindow.setContent(self.infoWindowContent);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);

        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 1450);
    });

    this.bounce = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };

};

