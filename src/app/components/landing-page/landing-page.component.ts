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
export class LandingPageComponent implements OnInit {
  userData: any = null;

  constructor(private cognitoService: CognitoService) {}

  ngOnInit(): void {
    // Set initial user data from the currentUserSignal
    this.userData = this.cognitoService.currentUserSignal();
  }
}
