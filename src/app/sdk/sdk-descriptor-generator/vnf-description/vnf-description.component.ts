import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-vnf-description',
  templateUrl: './vnf-description.component.html',
  styleUrls: ['./vnf-description.component.css']
})
export class VnfDescriptionComponent implements OnInit {

  types = ["docker", "vhd", "vmdk", "vdi", "iso", "qcow2", "ova", "ovf", "raw"]
  @Input() formControls: Array<FormControl>;

  constructor() { }

  ngOnInit() {
  }

}
