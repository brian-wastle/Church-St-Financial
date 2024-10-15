import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component'; // Import SignUpComponent

export const routes: Routes = [
    { path: '', component: LandingPageComponent },  // Existing route for the landing page
    { path: 'sign-up', component: SignUpComponent }, // New route for the sign-up page
];