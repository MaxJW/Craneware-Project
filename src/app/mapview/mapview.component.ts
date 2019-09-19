import { Component, OnInit, ViewChild } from '@angular/core';
import { } from 'googlemaps';

@Component({
  selector: 'app-mapview',
  templateUrl: './mapview.component.html',
  styleUrls: ['./mapview.component.css']
})
export class MapviewComponent implements OnInit {
  @ViewChild('map', { static: true }) mapElement: any;
  map: google.maps.Map;
  infowindow: google.maps.InfoWindow;
  service: google.maps.places.PlacesService;

  constructor() { }

  ngOnInit(): void {
    const mapProperties = {
      center: new google.maps.LatLng(35.2271, -80.8431),
      zoom: 15,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
  }

  createMarker(place: any) {
    var marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
      this.infowindow.setContent(place.name);
      this.infowindow.open(this.map, this);
    });
  }
}
