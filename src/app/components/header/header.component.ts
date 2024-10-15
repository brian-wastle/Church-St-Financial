import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CognitoService } from '../../services/cognito/cognito.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { ButtonModule } from 'primeng/button';
import { effect } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    AuthModalComponent, 
    ButtonModule]
})
export class HeaderComponent implements OnInit {
  showLoginForm: boolean = false;
  isLoggedIn: boolean = false;

  constructor(private cognitoService: CognitoService) {
    effect(() => {
      const currentUser = this.cognitoService.currentUserSignal();
      this.isLoggedIn = !!currentUser?.idToken;
    });
  }

  ngOnInit(): void {
    this.validateTokenWithAWS();
  }

  private validateTokenWithAWS(): void {
    this.cognitoService.validateTokenWithAWS()
      .then(isValid => {
        if (!isValid) {
          this.cognitoService.clearUserData();
          this.isLoggedIn = false;
        } else {
          const currentUser = this.cognitoService.currentUserSignal();
          this.isLoggedIn = !!currentUser?.idToken;
        }
      })
      .catch(() => {
        this.cognitoService.clearUserData();
        this.isLoggedIn = false;
      });
  }

  public logout(): void {
    if (this.isLoggedIn) {
      this.cognitoService.signOut();
    }
  }

  public toggleLoginForm(): void {
    this.showLoginForm = !this.showLoginForm;
  }
}
