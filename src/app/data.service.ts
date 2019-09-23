import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DataService{
  private searchData;
  private searchDataUpdated = new Subject();
  private distanceData;
  private distanceDataUpdated = new Subject();

  setSearchData(response){
    this.searchData = response;
    this.searchDataUpdated.next([...this.searchData]);
  }

  getSearchData(){
    return [...this.searchData];
  }

  getSearchDataUpdateListener() {
    // return an onject that we can listen but not emitt
    return this.searchDataUpdated.asObservable();
  }

  setDistanceData(distance){
    this.distanceData = distance;
    this.distanceDataUpdated.next(this.distanceData);
  }

  getDistanceData(){
    return this.distanceData;
  }

  getDistanceDataUpdateListener() {
    // return an onject that we can listen but not emitt
    return this.distanceDataUpdated.asObservable();
  }
}
