import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { DataService } from './data.service';

@Injectable({providedIn: 'root'})
export class HttpService{
  searchDrgUrl: string = 'http://104.248.165.91:8000/api/searchDRG';
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
      .post(this.searchDrgUrl, body, { headers }).toPromise().then(res => { this.responce = res, this.dataService.setSearchData(this.responce); } );
      //.subscribe(res => this.responce = res);
  }

  sendGetRequest() {
    return this.http
      .get(this.getbaseUrl).toPromise().then(res => console.log(res));
      //.subscribe(res => console.log(res));
  }
}
