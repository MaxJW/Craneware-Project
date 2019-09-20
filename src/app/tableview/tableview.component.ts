import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material';
import {MatTableDataSource} from '@angular/material/table';
import { Subscription } from 'rxjs';

import { DataService } from '../data.service';

export interface Condition {
  drgCode: string,
  drgDefinition: string,
  providerName: string,
  providerStreetAddress: string,
  providerCity: string,
  providerState: string,
  providerZipCode: string,
  averageTotalPayments: string
}

const CONDITION_DATA: Condition[] = [
  {drgCode: '293', drgDefinition: 'Fractured Tibia', providerName: 'Cerys Memorial Hospital', providerStreetAddress: 'Hospital Street', providerCity: 'Ceryshire', providerState: 'Kelly', providerZipCode: "111111", averageTotalPayments: '£1000000'},
  {drgCode: '001', drgDefinition: 'Broken Heart', providerName: 'Lucy Memorial Hospital', providerStreetAddress: 'Healing Road', providerCity: 'Lucyshire', providerState: 'Taylor', providerZipCode: "222222", averageTotalPayments: '£999999'},
];

@Component({
  selector: 'app-tableview',
  templateUrl: './tableview.component.html',
  styleUrls: ['./tableview.component.css']
})

export class TableviewComponent implements OnInit {
  searchData;
  private searchDataSub: Subscription;
  constructor(public dataService: DataService) { }

  displayedColumns: string[] = ['drgCode', 'drgDefinition', 'providerName', 'providerStreetAddress', 'providerCity', 'providerState', 'providerZipCode', 'averageTotalPayments'];
  dataSource = new MatTableDataSource(this.dataService.getSearchData());
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  ngOnInit(){
    this.dataSource.data = this.dataService.getSearchData();
    this.searchDataSub = this.dataService.getSearchDataUpdateListener()
      .subscribe((searchData) => {
        this.searchData = searchData;
        this.dataSource.data = this.searchData;
      });
    this.dataSource.sort = this.sort;

  }

  ngOnDestroy() {
    this.searchDataSub.unsubscribe();
  }

}



//export class TableviewComponent implements OnInit {
//  displayedColumns: string[] = ['drgCode', 'drgDefinition', 'providerName', 'providerStreetAddress', 'providerCity', 'providerState', 'providerZipCode', 'averageTotalPayments'];
//  dataSource = new MatTableDataSource(CONDITION_DATA);
//  @ViewChild(MatSort, {static: true}) sort: MatSort;
//  ngOnInit(){this.dataSource.sort = this.sort;}
//}
