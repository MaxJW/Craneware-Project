import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { } from 'googlemaps';
import { Subscription } from 'rxjs';

import { DataService } from '../data.service';

@Component({
  selector: 'app-mapview',
  templateUrl: './mapview.component.html',
  styleUrls: ['./mapview.component.css']
})
export class MapviewComponent implements OnInit {
  //TODO - CENTER MAP: map.setCenter(results[0].geometry.location);
  //Put this into table so when option clicked, it centers on the chosen pin?
  //Currently displays top 5 results from search, searches through google maps using place address (street, state, zipcode), then places pins on map
  //InfoWindow only contains name of pin
  //Maps
  @ViewChild('map', { static: true }) mapElement: any;
  map: google.maps.Map;
  service: google.maps.places.PlacesService;
  infowindow: google.maps.InfoWindow;
  @Input() geotoggleEnabled;
  counter: number = 0;
  //Database get
  searchData;
  distanceData;
  private searchDataSub: Subscription;
  private distanceDataSub: Subscription;
  constructor(public dataService: DataService) { }
  distances = [];
  pos = { lat: 0, lng: 0 };

  ngOnInit(): void {

    //Get data into searchData
    this.searchData = this.dataService.getSearchData();
    this.searchDataSub = this.dataService.getSearchDataUpdateListener()
      .subscribe((searchData) => {
        this.searchData = searchData;
        console.log(this.searchData);
        this.initMap();
      });

    this.distanceData = this.dataService.getDistanceData();
    this.distanceDataSub = this.dataService.getDistanceDataUpdateListener()
      .subscribe((distanceData) => {
        this.distanceData = distanceData;
      });

    this.initMap();
  }

  ngOnDestroy() {
    this.searchDataSub.unsubscribe();
  }

  async initMap() {
    const mapProperties = {
      center: new google.maps.LatLng(39.833333, -98.583333),
      zoom: 4,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);

    this.infowindow = new google.maps.InfoWindow();
    this.service = new google.maps.places.PlacesService(this.map);

    this.createGeolocationMarker();

    var self = this;
    //Search for first three received hospitals and place markers on map
    var request;
    var myquery;
    var resultstoget = 3; // !!!!!!! RESULTS TO GET VALUE !!!!!!!!!
    self.distances = [];
    for (var loop = 0; loop < resultstoget; loop++) {
      myquery = this.searchData[loop].providerName + ", " + this.searchData[loop].providerStreetAddress + ", " + this.searchData[loop].providerCity + ", " + this.searchData[loop].providerState + " " + this.searchData[loop].providerZipCode;
      request = {
        query: myquery,
        fields: ['name', 'geometry'],
      };
      //console.log(self.findPlaceFromQuery(request, resultstoget, loop));
      //distances.push(self.findPlaceFromQuery(request, resultstoget, loop));
      self.findPlaceFromQuery(request, resultstoget, loop)
    }
    self.dataService.setDistanceData(self.distances);
  }

  createGeolocationMarker() {
    var self = this;

    //Get user location
    if (this.geotoggleEnabled) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          self.pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          var image = {
            url: 'https://i.imgur.com/CHjBsrd.png',
            size: new google.maps.Size(30, 30),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 15)
          };

          var curr_location = new google.maps.Marker({
            map: self.map,
            position: new google.maps.LatLng(self.pos.lat, self.pos.lng),
            title: "Current Location",
            icon: image,
          });

          google.maps.event.addListener(curr_location, 'click', function () {
            self.infowindow.setContent("Current Location");
            self.infowindow.open(self.map, this);
          });

          self.map.setCenter(new google.maps.LatLng(self.pos.lat, self.pos.lng));
          self.map.setZoom(6);
        }, function () {
          self.handleLocationError(true, self.infowindow, self.map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        this.handleLocationError(false, this.infowindow, this.map.getCenter());
      }
    }
  }

  createMarker(place: any, result: any) {
    var marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
      title: place.name,
      animation: google.maps.Animation.DROP,
    });

    this.counter++;
    console.log(this.counter);
    
    var self = this;
    google.maps.event.addListener(marker, 'click', function () {
      self.infowindow.setContent(
        `<div class="infowindow_content">` +
        `<h3>` + self.searchData[result].providerName + `</h3><hr style="margin: 4px 0"/>` +
        `<p style="font-size: 0.9rem"><b>Price: </b>` + self.searchData[result].averageTotalPayments + `</p>` +
        `<p style="font-size: 0.9rem"><b>Distance: </b>` + self.distanceData[result].distance + `</p>` +
        `</div>`
      );
      self.infowindow.open(self.map, this);
    });
  }

  centerMapPlease(data) {
    console.log("Centering!", data)
  }

  handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(this.map);
  }

  findPlaceFromQuery(request, resultstoget, loop) {
    var self = this;
    self.service.findPlaceFromQuery(request, async function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          //console.log(results[i]);
          self.createMarker(results[i], loop);
          await self.calculateDistance(results[i], self.searchData[loop].providerId, self.searchData[loop].providerName);
          //console.log(await self.calculateDistance(results[i], self.searchData[loop].providerId));
        }
      }
    });
  }

  async calculateDistance(location, providerId, providerName) {
    var selectedHospitals = this.dataService.getSearchData();
    var currentLocation = this.pos;

    let service = new google.maps.DistanceMatrixService();
    await service.getDistanceMatrix(
      {
        origins: [currentLocation],
        destinations: [location.geometry.location],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
      }, (response: any) => {
        let ori = response.originAddresses;
        let desti = response.destinationAddresses;
        for (let k = 0; k < ori.length; k++) {
          let results = response.rows[k].elements;
          //console.log(results);
          for (let j = 0; j < results.length; j++) {
            const travel = {
              providerId: providerId,
              providerName: providerName,
              from: ori[k],
              to: desti[j],
              distance: results[j].distance.text,
              duration: results[j].duration.text
            };
            this.distances.push(travel);
            console.log(providerId + ': ' + ori[k] + ' to ' + desti[j] + ': ' + results[j].distance.text + ' in ' + results[j].duration.text);
            //this.dataService.setDistanceData(travel);
            //console.log(providerId +': ' + ori[k] + ' to ' + desti[j] + ': ' + results[j].distance.text + ' in ' + results[j].duration.text);
          }
        }
      });
  }
}
