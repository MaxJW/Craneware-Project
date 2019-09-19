import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, NgModel, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { format } from 'util';
import { trigger, state, transition, animate, style, keyframes } from '@angular/animations';
import { HttpService } from '../http.service';
import { exists } from 'fs';

@Component({
  selector: 'app-searchform',
  templateUrl: './searchform.component.html',
  styleUrls: ['./searchform.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({transform: 'translateY(-80%)'}),
        animate('80ms ease-in', style({transform: 'translateY(0%)'}))
      ])
    ]),
  ]
})
export class SearchformComponent implements OnInit {
  haha: boolean = true;
  error: string = 'false';
  myControl = new FormControl('', Validators.required);
  options: string[] = ['652 - KIDNEY TRANSPLANT', '039 - EXTRACRANIAL PROCEDURES W/O CC/MCC', '100 - SEIZURES W MCC'];
  filteredOptions: Observable<string[]>;

  constructor(public httpService: HttpService) { }

  searchPost() {
    if (this.myControl.errors == null) {
      if (this.existsInArray()) {
        this.error = 'false';
        this.httpService.sendPostRequest(this.myControl.value.substring(0, 3));
        this.setSearched()
      } else {
        this.error = 'exist';
      }
    } else {
      this.error = 'error';
    }
  }

  searchGet() {
    this.httpService.sendGetRequest();
  }

  existsInArray() {
    if (this.options.indexOf(this.myControl.value) > -1) {
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  @Output() searchToggle = new EventEmitter<boolean>();
  setSearched() {
      this.searchToggle.emit(true);
  }
}
