import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkDescriptorGeneratorComponent } from './sdk-descriptor-generator.component';

describe('SdkDescriptorGeneratorComponent', () => {
  let component: SdkDescriptorGeneratorComponent;
  let fixture: ComponentFixture<SdkDescriptorGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SdkDescriptorGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SdkDescriptorGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
