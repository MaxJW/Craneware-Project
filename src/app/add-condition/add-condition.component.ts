import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, NgModel, FormGroup, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-add-condition',
  templateUrl: './add-condition.component.html',
  styleUrls: ['./add-condition.component.css']
})
export class AddConditionComponent implements OnInit {

  addConditionForm;

  constructor(private formBuilder: FormBuilder) { 
    this.addConditionForm = this.formBuilder.group({
      drgCode: ['', Validators.required],
      drgDefinition: ['', Validators.required],
      providerId: ['', Validators.required],
      providerName: ['', Validators.required],
      providerStreetAddress: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  onSubmit(data) {
    // Process form data here
    console.log('New condition submitted', data);

    this.addConditionForm.reset();
  }

}
