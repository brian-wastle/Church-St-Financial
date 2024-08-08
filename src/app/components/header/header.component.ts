import { Component } from '@angular/core';
import {AmplifyAuthenticatorModule} from '@aws-amplify/ui-angular'
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'], // Fixed typo from styleUrl to styleUrls
})
export class HeaderComponent {
  showAuthenticator = false; // Control the display of the authenticator

  async signOut() {
    try {
      await Auth.signOut();
      console.log('Signed out successfully');
      this.showAuthenticator = false; // Hide authenticator on sign out
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }

  onAuthStateChange(authState: string) {
    if (authState === 'authenticated') {
      this.showAuthenticator = false; // Hide authenticator when authenticated
    }
  }
}