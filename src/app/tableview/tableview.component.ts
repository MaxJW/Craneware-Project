import { Component } from '@angular/core';

export interface Condition {
  code: number,
  condition: string,
  hospital: string
}

const CONDITION_DATA: Condition[] = [
  {code: 6294, condition: 'Broken leg', hospital: 'Random'},
  {code: 6294, condition: 'Broken leg', hospital: 'Random'},
  {code: 6294, condition: 'Broken leg', hospital: 'Random'},
];

@Component({
  selector: 'app-tableview',
  templateUrl: './tableview.component.html',
  styleUrls: ['./tableview.component.css']
})
export class TableviewComponent {
  displayedColumns: string[] = ['code', 'condition', 'hospital'];
  dataSource = CONDITION_DATA;
}
