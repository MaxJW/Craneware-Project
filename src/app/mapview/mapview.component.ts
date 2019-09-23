import { Component, OnInit, ViewChild } from '@angular/core';
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

  //Database get
  searchData;
  private searchDataSub: Subscription;
  constructor(public dataService: DataService) { }
  distances = [];

  ngOnInit(): void {
    //Get data into searchData
    this.searchData = this.dataService.getSearchData();
    this.searchDataSub = this.dataService.getSearchDataUpdateListener()
      .subscribe((searchData) => {
        this.searchData = searchData;
        console.log(this.searchData);
        this.initMap();
      });
    console.log(this.searchData);
    this.initMap();
  }

  ngOnDestroy() {
    this.searchDataSub.unsubscribe();
  }

  createMarker(place: any) {
    var marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
      title: place.name
    });

    var self = this;
    google.maps.event.addListener(marker, 'click', function () {
      self.infowindow.setContent(place.name);
      self.infowindow.open(self.map, this);
    });
  }

  async initMap() {
    const mapProperties = {
      center: new google.maps.LatLng(39.833333, -98.583333),
      zoom: 5,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);

    this.infowindow = new google.maps.InfoWindow();
    this.service = new google.maps.places.PlacesService(this.map);

    var self = this;

    var request;
    var myquery;
    var resultstoget = 3;
    self.distances = [];
    for (var loop = 0; loop < resultstoget; loop++) {
      console.log(self.searchData[loop].providerName);
      myquery = this.searchData[loop].providerName + ", " + this.searchData[loop].providerStreetAddress + ", " + this.searchData[loop].providerCity + ", " + this.searchData[loop].providerState + " " + this.searchData[loop].providerZipCode;
      request = {
        query: myquery,
        fields: ['name', 'geometry'],
      };
     //console.log(self.findPlaceFromQuery(request, resultstoget, loop));
     //distances.push(self.findPlaceFromQuery(request, resultstoget, loop));
     self.findPlaceFromQuery(request, resultstoget, loop)
    }
    await self.dataService.setDistanceData(self.distances);
  }

  centerMapPlease(data) {
    console.log("Centering!", data)
  }


  findPlaceFromQuery(request, resultstoget, loop){
    var self = this;
    self.service.findPlaceFromQuery(request, async function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          //console.log(results[i]);
          self.createMarker(results[i]);
          await self.calculateDistance(results[i], self.searchData[loop].providerId, self.searchData[loop].providerName);
          //console.log(await self.calculateDistance(results[i], self.searchData[loop].providerId));
        }
        self.map.setCenter(results[0].geometry.location);
      }
    });
  }

  async calculateDistance(location, providerId, providerName) {
    var selectedHospitals = this.dataService.getSearchData();
    var currentLocation = ['Fike Park, Colby, KS 67701'];

    let service = new google.maps.DistanceMatrixService();
    await service.getDistanceMatrix(
      {
        origins: currentLocation,
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
                console.log(providerId +': ' + ori[k] + ' to ' + desti[j] + ': ' + results[j].distance.text + ' in ' + results[j].duration.text);
                //this.dataService.setDistanceData(travel);
                //console.log(providerId +': ' + ori[k] + ' to ' + desti[j] + ': ' + results[j].distance.text + ' in ' + results[j].duration.text);
              }
            }
        });
    }






}
