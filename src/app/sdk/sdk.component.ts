import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-sdk',
  templateUrl: './sdk.component.html',
  styleUrls: ['./sdk.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SdkComponent implements OnInit {
  section: string;

  constructor() { }

  ngOnInit() {
    this.section = 'sdk-descriptor-generator'
  }

}
