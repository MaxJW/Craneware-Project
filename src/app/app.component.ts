import { Component } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({transform: 'translateY(150%)'}),
        animate('700ms ease-in', style({transform: 'translateY(0%)'}))
      ])
    ]),
    trigger('slideAdjust', [
      transition('false=>true', [
        style({transform: 'translateY(200%)'}),
        animate('60ms ease-in', style({transform: 'translateY(0%)'}))
      ])
    ]),
  ]
})
export class AppComponent { 
  hasSearched: boolean = false;

  toggleSearched(val: boolean) {
    this.hasSearched = val;
  }
}
