import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule} from '@angular/material';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card'; 
import { AppComponent } from './app.component';
import { SearchformComponent } from './searchform/searchform.component';
import { MapviewComponent } from './mapview/mapview.component';
import { TableviewComponent } from './tableview/tableview.component';
import { LoginformComponent } from './loginform/loginform.component';
import { LoginbuttonComponent } from './loginbutton/loginbutton.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchformComponent,
    MapviewComponent,
    TableviewComponent,
    LoginformComponent,
    LoginbuttonComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
