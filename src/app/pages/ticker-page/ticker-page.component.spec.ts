import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TickerPageComponent } from './ticker-page.component';

describe('TickerPageComponent', () => {
  let component: TickerPageComponent;
  let fixture: ComponentFixture<TickerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TickerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TickerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
