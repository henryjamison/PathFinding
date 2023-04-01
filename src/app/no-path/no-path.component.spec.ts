import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoPathComponent } from './no-path.component';

describe('NoPathComponent', () => {
  let component: NoPathComponent;
  let fixture: ComponentFixture<NoPathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoPathComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
