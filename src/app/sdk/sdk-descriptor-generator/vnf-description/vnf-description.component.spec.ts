import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VnfDescriptionComponent } from './vnf-description.component';

describe('VnfDescriptionComponent', () => {
  let component: VnfDescriptionComponent;
  let fixture: ComponentFixture<VnfDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VnfDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VnfDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
