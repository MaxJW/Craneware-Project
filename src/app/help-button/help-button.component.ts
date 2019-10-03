import { Component } from '@angular/core';

@Component({
  selector: 'app-help-button',
  templateUrl: './help-button.component.html',
  styleUrls: ['./help-button.component.css']
})
export class HelpButtonComponent {
  showHelp: boolean = false;

  enableShow(val: boolean) {
    this.showHelp = val;
  }
}
