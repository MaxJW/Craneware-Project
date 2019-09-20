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

  initMap() {
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
    for (var loop = 0; loop < resultstoget; loop++) {
      console.log(this.searchData[loop].providerName);
      myquery = this.searchData[loop].providerName + ", " + this.searchData[loop].providerStreetAddress + ", " + this.searchData[loop].providerCity + ", " + this.searchData[loop].providerState + " " + this.searchData[loop].providerZipCode;
      request = {
        query: myquery,
        fields: ['name', 'geometry'],
      };

      this.service.findPlaceFromQuery(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            self.createMarker(results[i]);
          }
          self.map.setCenter(results[0].geometry.location);
        }
      });
    }
  }
}
