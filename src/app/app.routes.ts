import { Routes } from '@angular/router';
import { SignUpPageComponent } from './components/sign-up-page/sign-up-page.component';
import { SignInPageComponent } from './components/sign-in-page/sign-in-page.component';
import { PortfolioHomeComponent } from './components/portfolio-home/portfolio-home.component';

export const routes: Routes = [

    { path: '', component: SignInPageComponent },
    { path: 'signup', component: SignUpPageComponent },
    { path: 'portfolio', component: PortfolioHomeComponent },
];
