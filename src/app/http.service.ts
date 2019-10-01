import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { DataService } from './data.service';
import { AddConditionComponent } from './add-condition/add-condition.component';

@Injectable({providedIn: 'root'})
export class HttpService{
  searchDrgUrl: string = 'http://104.248.165.91:8000/api/searchDRG';
  searchDrgLatestYearUrl: string = 'http://104.248.165.91:8000/api/searchDRGLatestYear';
  searchDRGLatestYearWithHospitalLocationsAndFiltering: string = 'http://104.248.165.91:8000/api/searchDRGLatestYearWithHospitalLocationsAndFiltering';
  //addNewCondition: string = 'http://104.248.165.91:8000/api/addNewCondition';
  addNewCondition: string = 'http://localhost:8000/api/addNewCondition';
  getbaseUrl: string = 'http://104.248.165.91:8000/';

  public responce: any;

  constructor(private http: HttpClient, public dataService: DataService) { }

  sendPostRequest(data: string) {
    console.log("sending req")
    const headers = new HttpHeaders()
      .set('cache-control', 'no-cache')
      .set('content-type', 'application/x-www-form-urlencoded');

    const body = new HttpParams({
      fromObject: {
        drg: data,
      }
    });

    return this.http
      .post(this.searchDrgLatestYearUrl, body, { headers }).toPromise().then(res => { this.responce = res, this.dataService.setSearchData(this.responce); } );
      // .subscribe(res => this.responce = res);
  }

  sendGetRequest() {
    return this.http
      .get(this.getbaseUrl).toPromise().then(res => console.log(res));
      // .subscribe(res => console.log(res));
  }

  createCondition(data){
    return this.http.post<any>(this.addNewCondition, data)
  }

  sendPostGetAllData(data, distance, price, rating, zipCode, userLat, userLon) {
    console.log("sending req")
    const headers = new HttpHeaders()
      .set('cache-control', 'no-cache')
      .set('content-type', 'application/x-www-form-urlencoded');

    if(distance === undefined){
      distance = null;
    }
    if(price === undefined){
      price = null;
    }
    if(rating === undefined){
      rating = null;
    }
    if(zipCode === undefined){
      zipCode = null;
    }
    const body = new HttpParams({
      fromObject: {
        drg: data,
        distanceFlter: distance,
        priceFilter: price,
        ratingFilter: rating,
        zip: zipCode,
        lat: userLat,
        lon: userLon,
      }
    });

    return this.http
      .post(this.searchDRGLatestYearWithHospitalLocationsAndFiltering, body, { headers }).toPromise().then(res => { this.responce = res, this.dataService.setSearchData(this.responce); } );
      // .subscribe(res => this.responce = res);
  }

}
