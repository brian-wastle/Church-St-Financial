import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component'; // Import SignUpComponent
import { TickerPageComponent } from './pages/ticker-page/ticker-page.component';
import { PortfolioOverviewComponent } from './pages/portfolio-overview/portfolio-overview.component';
import { TransactionsPageComponent } from './pages/transactions-page/transactions-page.component';
import { SearchComponent } from './components/search-component/search.component';

export const routes: Routes = [
    { path: '', component: PortfolioOverviewComponent }, 
    { path: 'search', component: SearchComponent }, 
    { path: 'sign-up', component: SignUpComponent }, 
    { path: 'stock/:ticker', component: TickerPageComponent },
    { path: 'portfolio/:ticker', component: TransactionsPageComponent },
    { path: 'portfolio', component: PortfolioOverviewComponent },
];