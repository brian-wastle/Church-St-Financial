import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CognitoService } from '../../services/cognito/cognito.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { effect } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [AuthModalComponent, CommonModule]
})
export class HeaderComponent implements OnInit {
  showLoginForm: boolean = false;
  isLoggedIn: boolean = false;

  // Tracking login state through currentUserSignal
  constructor(private cognitoService: CognitoService) {
    effect(() => {
      const currentUser = this.cognitoService.currentUserSignal();
      // The component's login state depends on currentUserSignal
      this.isLoggedIn = !!currentUser && !!currentUser.idToken;
    });
  }

  ngOnInit(): void {
    this.validateSessionOnLoad();
  }
  
  validateSessionOnLoad(): void {
    // Check if session is valid on page load
    this.cognitoService.validateSession().then(isValid => {
      if (!isValid) {
        this.cognitoService.clearUserData();
      }
    }).catch(() => {
      this.cognitoService.clearUserData();
    });
  }

  logout(): void {
    if (this.isLoggedIn) {
      this.cognitoService.signOut();
    }
  }

  toggleLoginForm(): void {
    this.showLoginForm = !this.showLoginForm;
  }
}
