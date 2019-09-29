import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSort, MatPaginator } from '@angular/material';
import {MatTableDataSource} from '@angular/material/table';
import { Subscription } from 'rxjs';

import { DataService } from '../data.service';

@Component({
  selector: 'app-tableview',
  templateUrl: './tableview.component.html',
  styleUrls: ['./tableview.component.css']
})

export class TableviewComponent implements OnInit {
  searchData;
  private searchDataSub: Subscription;
  constructor(public dataService: DataService) { }

  displayedColumns: string[] = ['providerName', 'providerStreetAddress', 'providerCity', 'providerState', 'providerZipCode', 'hospital[0].rating', 'averageCoveredCharges', 'averageMedicareCustomerPayments'];
  dataSource = new MatTableDataSource(this.dataService.getSearchData());
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  ngOnInit(){
    this.dataSource.data = this.dataService.getSearchData();
    this.searchDataSub = this.dataService.getSearchDataUpdateListener()
      .subscribe((searchData) => {
        this.searchData = searchData;
        this.dataSource.data = this.searchData;
      });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.searchDataSub.unsubscribe();
  }

  testingFunc(data) {
    console.log(data.providerName + " selected!");
  }

  @Output() mapSelection = new EventEmitter<string>();
  setSearched(data) {
      this.mapSelection.emit(data);
  }
}
