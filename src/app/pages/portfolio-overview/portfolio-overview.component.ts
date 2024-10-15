import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CognitoService } from '../../services/cognito/cognito.service';
import { PortfolioDisplayList } from "../../components/porfolio-display-list/porfolio-display-list.component";

@Component({
  selector: 'app-portfolio-overview',
  standalone: true,
  imports: [CommonModule, PortfolioDisplayList],
  templateUrl: './portfolio-overview.component.html',
  styleUrl: './portfolio-overview.component.scss'
})
export class PortfolioOverviewComponent {
  constructor(public cognitoService: CognitoService) {}
}
