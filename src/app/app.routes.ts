import { Routes, PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { TickerPageComponent } from './pages/ticker-page/ticker-page.component';
import { PortfolioOverviewComponent } from './pages/portfolio-overview/portfolio-overview.component';
import { TransactionsPageComponent } from './pages/transactions-page/transactions-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent }, 
    { path: 'search', component: SearchPageComponent }, 
    { path: 'sign-up', component: SignUpComponent }, 
    { path: 'stock/:ticker', component: TickerPageComponent },
    { path: 'portfolio/:ticker', component: TransactionsPageComponent },
    { path: 'portfolio', component: PortfolioOverviewComponent },
];

export const appRoutingProviders = [
    provideRouter(routes, withPreloading(PreloadAllModules))
];
 