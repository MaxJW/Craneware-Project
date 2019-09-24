import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loginform',
  templateUrl: './loginform.component.html',
  styleUrls: ['./loginform.component.css']
})
export class LoginformComponent implements OnInit {

  constructor() { }

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
  
      alert("Error: Invalid Login");
  
    }
  }

}