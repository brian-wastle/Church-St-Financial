import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component'; // Import SignUpComponent
import { TickerPageComponent } from './pages/ticker-page/ticker-page.component';
import { PortfolioOverviewComponent } from './pages/portfolio-overview/portfolio-overview.component';
import { TransactionsHistoryOverview } from './components/transactions-history-overview/transactions-history-overview.component';

export const routes: Routes = [
    { path: '', component: PortfolioOverviewComponent }, 
    { path: 'sign-up', component: SignUpComponent }, 
    { path: 'stock/:ticker', component: TickerPageComponent },
    { path: 'portfolio/:ticker', component: TransactionsHistoryOverview },
    { path: 'portfolio', component: PortfolioOverviewComponent },
];