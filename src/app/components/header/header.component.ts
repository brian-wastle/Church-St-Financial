import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { CognitoService } from '../../services/cognito/cognito.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, AuthModalComponent]
})
export class HeaderComponent {
  showAuthModal: boolean = false;

  @ViewChild(AuthModalComponent) authModal!: AuthModalComponent;

  constructor(private cognitoService: CognitoService) {}

  get isLoggedIn(): boolean {
    return this.cognitoService.hasValidToken(); // Check if the user has a valid token
  }

  logout(): void {
    if (this.isLoggedIn) {
      this.cognitoService.signOut(); // Log out the user
      // Optionally, you can trigger any additional actions, like notifying the user or redirecting
    }
  }

  toggleAuthModal(): void {
    this.showAuthModal = !this.showAuthModal; // Toggle the modal visibility
  }
}
