import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, NgModel, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { format } from 'util';
import { RequireMatch as RequireMatch } from '../requireMatch';

import { HttpService } from '../http.service';

@Component({
  selector: 'app-searchform',
  templateUrl: './searchform.component.html',
  styleUrls: ['./searchform.component.css']
})
export class SearchformComponent implements OnInit {
  myControl = new FormControl('', Validators.required);
  options: string[] = ['652 - KIDNEY TRANSPLANT', '039 - EXTRACRANIAL PROCEDURES W/O CC/MCC', '100 - SEIZURES W MCC'];
  filteredOptions: Observable<string[]>;

  constructor(public httpService: HttpService) {}

  searchPost(){
    if (this.myControl.errors == null) {
      this.httpService.sendPostRequest(this.myControl.value);
    }
  }

  searchGet(){
    this.httpService.sendGetRequest();
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
    if (this.myControl.errors == null) {
      this.searchToggle.emit(true);
    }
  }
}
