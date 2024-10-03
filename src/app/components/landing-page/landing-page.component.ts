import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CognitoService } from '../../services/cognito/cognito.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LandingPageComponent  {
  constructor(public cognitoService: CognitoService) {}
}