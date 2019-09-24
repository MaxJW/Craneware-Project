import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-loginform',
  templateUrl: './loginform.component.html',
  styleUrls: ['./loginform.component.css']
})
export class LoginformComponent implements OnInit {

  constructor(private snackBar: MatSnackBar) { }

  username: string;
  password: string;

  ngOnInit() 
  {}

  login() : void 
  {

    if(this.username == 'Administrator' && this.password == 'hackerman0451')
    {
  
     /** Navigate To Page After Login Page */
     
  
    }
    else 
    {
  
      this.snackBar.open("Invalid Login", "Dismiss")
  
    }
  }

}