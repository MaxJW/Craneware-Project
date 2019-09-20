import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DataService{
  private searchData;
  private searchDataUpdated = new Subject();

  setSearchData(responce){
    this.searchData = responce;
    this.searchDataUpdated.next([...this.searchData]);
  }

  getSearchData(){
    return [...this.searchData];
  }

  getSearchDataUpdateListener() {
    // return an onject that we can listen but not emitt
    return this.searchDataUpdated.asObservable();
  }
}
