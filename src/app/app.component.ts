import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DatePipe]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  title = 'Church-St-Financial';
  disableClose: boolean = true;  // Determines if the sidenav can be closed (useful for full screen)
  sidenavOpened: boolean = true; // Controls the opened state of the sidenav

  constructor() {}

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      this.setSidenavBehavior();
      window.addEventListener('resize', this.setSidenavBehavior.bind(this));
    }
  }

  // Adjust the sidenav behavior based on the screen size
  setSidenavBehavior() {
    const isMobile = window.innerWidth <= 768;
    this.disableClose = !isMobile;
    this.sidenavOpened = !isMobile;
  }

  // Toggle the sidenav on mobile
  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
    if (this.sidenavOpened) {
      this.sidenav.open();
    } else {
      this.sidenav.close();
    }
  }

  // Helper function to check if the view is mobile
  isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }
}
