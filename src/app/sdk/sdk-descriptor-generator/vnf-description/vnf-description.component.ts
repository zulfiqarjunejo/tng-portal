import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-vnf-description',
  templateUrl: './vnf-description.component.html',
  styleUrls: ['./vnf-description.component.css']
})
export class VnfDescriptionComponent implements OnInit {
  @Input() formControls: Array<FormControl>;

  constructor() { }

  ngOnInit() {
    this.formControls[0].setValue('ubuntu:16.04');
    this.formControls[1].setValue('docker');
  }

}
