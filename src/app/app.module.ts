import 'hammerjs';
import { BrowserModule} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatPaginatorModule, MatSortModule, MatMenuModule, MatExpansionModule, MatSlideToggleModule} from '@angular/material';
import { NgxLoadingModule, ngxLoadingAnimationTypes  } from 'ngx-loading';
import { KeyboardShortcutsModule } from "ng-keyboard-shortcuts";
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppComponent } from './app.component';
import { SearchformComponent } from './searchform/searchform.component';
import { MapviewComponent } from './mapview/mapview.component';
import { TableviewComponent } from './tableview/tableview.component';
import { LoginformComponent } from './loginform/loginform.component';
import {MatCardModule} from '@angular/material/card';
import { AddConditionComponent } from './add-condition/add-condition.component';
import {MatSelectModule} from '@angular/material/select';
import { HelpButtonComponent } from './help-button/help-button.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchformComponent,
    MapviewComponent,
    TableviewComponent,
    LoginformComponent,
    AddConditionComponent,
    HelpButtonComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatExpansionModule,
    HttpClientModule,
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
