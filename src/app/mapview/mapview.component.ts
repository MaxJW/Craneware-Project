import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { } from 'googlemaps';
import { Subscription } from 'rxjs';

import { DataService } from '../data.service';
import { HttpService } from '../http.service';

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
  private searchDataSub: Subscription;
  locationData;
  private locationDataSub: Subscription;
  constructor(public dataService: DataService, public httpService: HttpService) { }
  distances = [];
  pos = { lat: 0, lng: 0 };

  ngOnInit(): void {

    //Get data into searchData
    this.searchData = this.dataService.getSearchData();
    this.searchDataSub = this.dataService.getSearchDataUpdateListener()
      .subscribe((searchData) => {
        this.searchData = searchData;
        //console.log(this.searchData);
        this.initMap();
      });

    this.locationData = this.dataService.getUserLocationData();
    this.locationDataSub = this.dataService.getUserLocationDataListener()
        .subscribe((locationData) => {
          this.locationData = locationData;
          //console.log(this.locationData);
          this.initMap();
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
    var resultstoget = 4000; // !!!!!!! RESULTS TO GET VALUE !!!!!!!!!

    self.distances = [];

    if (this.searchData.length < resultstoget) {
      resultstoget = this.searchData.length;
    }

    for (var loop = 0; loop < resultstoget; loop++) {
      myquery = this.searchData[loop].providerName + ', ' + this.searchData[loop].providerStreetAddress + ', ' + this.searchData[loop].providerCity + ', ' + this.searchData[loop].providerState + ' ' + this.searchData[loop].providerZipCode;
      request = {
        query: myquery,
        fields: ['name', 'geometry'],
      };

      this.createMarker(this.searchData[loop].hospital[0], this.searchData[loop]);
    }
  }

  async createGeolocationMarker() {
    var self = this;
    //Get user location
    if (this.geotoggleEnabled) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          self.pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          var image = {
            url: '/assets/icon.png',
            size: new google.maps.Size(30, 30),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 15)
          };

          var curr_location = new google.maps.Marker({
            map: self.map,
            position: new google.maps.LatLng(self.pos.lat, self.pos.lng),
            title: 'Current Location',
            icon: image,
          });

          google.maps.event.addListener(curr_location, 'click', function() {
            self.infowindow.setContent('Current Location');
            self.infowindow.open(self.map, this);
          });

          self.map.setCenter(new google.maps.LatLng(self.pos.lat, self.pos.lng));
          self.map.setZoom(5);
          self.createRadius();
        }, function() {
          self.handleLocationError(true, self.infowindow, self.map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        this.handleLocationError(false, this.infowindow, this.map.getCenter());
      }
    } else {
      var userzipcoords = await this.dataService.getUserLocationData();
      //console.log(userzipcoords);
      self.pos = {
          lat: parseFloat(userzipcoords.lat),
          lng: parseFloat(userzipcoords.lon),
      };
      //console.log(self.pos)
      var image = {
          url: '/assets/icon.png',
          size: new google.maps.Size(30, 30),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(15, 15)
        };

      var curr_location = new google.maps.Marker({
          map: self.map,
          position: new google.maps.LatLng(self.pos.lat, self.pos.lng),
          title: 'Current Location',
          icon: image,
        });

      google.maps.event.addListener(curr_location, 'click', function() {
          self.infowindow.setContent('Current Location');
          self.infowindow.open(self.map, this);
        });

      self.map.setCenter(new google.maps.LatLng(self.pos.lat, self.pos.lng));
      self.map.setZoom(5);
      self.createRadius();
      }
      //Get ZipCode Location coords
      /*self.pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var image = {
        url: '/assets/icon.png',
        size: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 15)
      };

      var curr_location = new google.maps.Marker({
        map: self.map,
        position: new google.maps.LatLng(self.pos.lat, self.pos.lng),
        title: 'Current Location',
        icon: image,
      });

      google.maps.event.addListener(curr_location, 'click', function () {
        self.infowindow.setContent('Current Location');
        self.infowindow.open(self.map, this);
      });

      self.map.setCenter(new google.maps.LatLng(self.pos.lat, self.pos.lng));
      self.map.setZoom(6);
      self.createRadius();*/
    }

  createRadius() {
    var geoCircle = new google.maps.Circle({
      strokeColor: '#70B7FF',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#70B7FF',
      fillOpacity: 0.35,
      map: this.map,
      center: this.pos,
      radius: 1609 * /*Get distance from search?*/100
    });
  }

  createMarker(location, hospital) {
    //console.log();
    var marker = new google.maps.Marker({
      map: this.map,
      position: {lat: location.lat, lng: location.lon},
      title: hospital.providerName,
      animation: google.maps.Animation.DROP,
    });

    this.counter++;
    // console.log(this.counter);

    var self = this;
    google.maps.event.addListener(marker, 'click', function() {
      self.infowindow.setContent(
        `<div class="infowindow_content">` +
        `<h3>` + hospital.providerName + `</h3><hr style="margin: 4px 0"/>` +
        `<p style="font-size: 0.9rem"><b>Uninsured Price: </b>$` + (parseFloat(hospital.averageCoveredCharges).toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + `</p>` +
        `<p style="font-size: 0.9rem"><b>Medicare Price: </b>$` + (parseFloat(hospital.averageMedicareCustomerPayments).toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + `</p>` +
        `<p style="font-size: 0.9rem"><b>Rating: </b>` + location.rating + '⭐' + `</p>` +
        `<p style="font-size: 0.9rem"><b>Distance: </b>` + ((hospital.distance).toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' miles' + `</p>` +
        `</div>`
      );
      self.infowindow.open(self.map, this);
    });
  }

  centerMapPlease(data) {
    //console.log('Centering!', data)
  }

  handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(this.map);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async calculateDistance(location, providerId, providerName) {
    var selectedHospitals = this.dataService.getSearchData();
    var currentLocation = this.pos;
    //console.log(currentLocation);
    if(!(currentLocation.lat === 0 && currentLocation.lng === 0)){
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
            if(results[0].status == 'ZERO_RESULTS'){
              return;
            }else if (results[0].status == 'OK'){
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
              //console.log(providerId + ': ' + ori[k] + ' to ' + desti[j] + ': ' + results[j].distance.text + ' in ' + results[j].duration.text);
            }
            }
            //console.log(results[0].status);
          }
        });

      }
    }
}
