import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DataService{
  private searchData;
  private searchDataUpdated = new Subject();
  private userLocationData;
  private userLocationDataUpdated = new Subject();

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

  setUserLocationData(response){
    this.userLocationData = response;
    this.userLocationDataUpdated.next([...this.userLocationData]);
  }

  getUserLocationData(){
    return [...this.userLocationData];
  }

  getUserLocationDataListener() {
    // return an onject that we can listen but not emitt
    return this.userLocationDataUpdated.asObservable();
  }
  
}
