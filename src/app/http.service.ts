import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class HttpService{
  searchDrgUrl: string = 'http://104.248.165.91:8000/api/searchDRG';
  getbaseUrl: string = 'http://104.248.165.91:8000/';

  constructor(private http: HttpClient) { }

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
      .post(this.searchDrgUrl, body, { headers })
      .subscribe(res => console.log(res));
  }

  sendGetRequest() {
    return this.http
      .get(this.getbaseUrl)
      .subscribe(res => console.log(res));
  }
}
