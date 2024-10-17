import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component'; // Import SignUpComponent
import { TickerPageComponent } from './pages/ticker-page/ticker-page.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent }, 
    { path: 'sign-up', component: SignUpComponent }, 
    { path: 'stock/:ticker', component: TickerPageComponent },
];