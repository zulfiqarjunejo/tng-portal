import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-sdk-descriptor-generator',
  templateUrl: './sdk-descriptor-generator.component.html',
  styleUrls: ['./sdk-descriptor-generator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SdkDescriptorGeneratorComponent implements OnInit {
  options: FormGroup;

  author = new FormControl('');
  vendor = new FormControl('');
  serviceName = new FormControl('');
  serviceDescription = new FormControl('');
  vnfs = [];

  constructor(fb: FormBuilder) {
    this.options = fb.group({
      hideRequired: false,
      floatLabel: 'auto',
    });

    this.vnfs.push([new FormControl(), new FormControl()]);
  }

  ngOnInit() {
  }

  addVnf() {
    this.vnfs.push([new FormControl(), new FormControl()]);
  }

  generate() {
    console.log(this.author.value);
    console.log(this.vendor.value);
    console.log(this.serviceName.value);
    console.log(this.serviceDescription.value);
    this.vnfs.forEach(vnf => {
      console.log(vnf[0].value + "  " + vnf[1].value);
    })
  }

}
