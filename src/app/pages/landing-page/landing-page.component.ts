

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CognitoService } from '../../services/cognito/cognito.service';
import { PortfolioDisplayList } from "../../components/porfolio-display-list/porfolio-display-list.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, PortfolioDisplayList],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  constructor(public cognitoService: CognitoService) {}
}