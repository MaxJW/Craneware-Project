import { BrowserModule} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatPaginatorModule, MatSortModule} from '@angular/material';
import { NgxLoadingModule, ngxLoadingAnimationTypes  } from 'ngx-loading';
import { KeyboardShortcutsModule } from "ng-keyboard-shortcuts";
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SearchformComponent } from './searchform/searchform.component';
import { MapviewComponent } from './mapview/mapview.component';
import { TableviewComponent } from './tableview/tableview.component';
import { DistancetableComponent } from './distancetable/distancetable.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchformComponent,
    MapviewComponent,
    TableviewComponent,
    DistancetableComponent,
    AdminLoginComponent
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
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    AppRoutingModule,
    KeyboardShortcutsModule,
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.circleSwish,
      backdropBackgroundColour: 'rgba(0,0,0,0.5)',
      backdropBorderRadius: '4px',
      primaryColour: '#ffffff'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
