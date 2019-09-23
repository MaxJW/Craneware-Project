import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistancetableComponent } from './distancetable.component';

describe('DistancetableComponent', () => {
  let component: DistancetableComponent;
  let fixture: ComponentFixture<DistancetableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistancetableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistancetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
