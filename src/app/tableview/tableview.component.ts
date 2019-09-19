import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material';
import {MatTableDataSource} from '@angular/material/table';

export interface Condition {
  code: number,
  condition: string,
  hospital: string
}

const CONDITION_DATA: Condition[] = [
  {code: 6293, condition: 'Fractured Tibia', hospital: 'Cerys Memorial Hospital'},
  {code: 6294, condition: 'Broken leg', hospital: 'Random'},
  {code: 6294, condition: 'Broken leg', hospital: 'Random'},
];

@Component({
  selector: 'app-tableview',
  templateUrl: './tableview.component.html',
  styleUrls: ['./tableview.component.css']
})
export class TableviewComponent implements OnInit {
  displayedColumns: string[] = ['code', 'condition', 'hospital'];
  dataSource = new MatTableDataSource(CONDITION_DATA);
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  ngOnInit(){this.dataSource.sort = this.sort;}
}
