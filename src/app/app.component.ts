import { Component, ViewChild } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { ShortcutInput, ShortcutEventOutput } from 'ng-keyboard-shortcuts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({transform: 'translateY(100%)'}),
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
  adminControl: boolean = false;
  mapSelect: any;
  shortcuts: ShortcutInput[] = [];

  toggleSearched(val: boolean) {
    this.hasSearched = val;
  }
  
  mapSelected(data) {
    this.mapSelect = data;
  }

  ngAfterViewInit()
  {
    this.shortcuts.push
    (
      {
        key: ["up up down down left right left right b a enter"],
        label: "AdminPanel",
        description: "AdminTest",
        command: (output: ShortcutEventOutput) => this.adminControl = true
      }
    );
  }
}
