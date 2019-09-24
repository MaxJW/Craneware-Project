import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSort, MatPaginator } from '@angular/material';
import {MatTableDataSource} from '@angular/material/table';
import { Subscription } from 'rxjs';

import { DataService } from '../data.service';

@Component({
  selector: 'app-distancetable',
  templateUrl: './distancetable.component.html',
  styleUrls: ['./distancetable.component.css']
})

export class DistancetableComponent implements OnInit{
  distanceData;
  private distanceDataSub: Subscription;
  constructor(public dataService: DataService) { }

  displayedColumns: string[] = ['providerId', 'providerName', 'from', 'to', 'distance', 'duration'];
  dataSource = new MatTableDataSource(this.dataService.getDistanceData());
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  ngOnInit(){
  }
  
  ngOnDestroy() {
    this.distanceDataSub.unsubscribe();
  }

  ngAfterViewInit() {
    console.log(this.dataService.getDistanceData());
    this.dataSource.data = this.dataService.getDistanceData();
    this.distanceDataSub = this.dataService.getDistanceDataUpdateListener()
      .subscribe((distanceData) => {
        this.distanceData = distanceData;
        this.dataSource.data = this.distanceData;
      });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}


