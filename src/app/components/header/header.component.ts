import { Component } from '@angular/core';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AmplifyAuthenticatorModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  showAuthenticator = false; // Control the display of the authenticator

  constructor(public authenticator: AuthenticatorService) {}

  // Update the parameter type to match the expected event structure
  onAuthStateChange(event: { state: string }) {
    if (event.state === 'authenticated') {
      this.showAuthenticator = false; // Hide authenticator when authenticated
    } else if (event.state === 'unauthenticated') {
      this.showAuthenticator = true; // Show authenticator when unauthenticated
    }
  }

  // Sign out method
  signOut() {
    this.authenticator.signOut();
  }
}