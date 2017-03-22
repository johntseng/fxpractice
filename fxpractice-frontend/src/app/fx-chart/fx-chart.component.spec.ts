/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FxChartComponent } from './fx-chart.component';

describe('FxChartComponent', () => {
  let component: FxChartComponent;
  let fixture: ComponentFixture<FxChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FxChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FxChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
