import { Injectable } from '@angular/core';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  private cognitoUserPool: CognitoUserPool;
  public currentUserSignal = signal<any>(null); // Signal for current user

  constructor() {
    this.cognitoUserPool = new CognitoUserPool({
      UserPoolId: environment.USER_POOL_ID,
      ClientId: environment.APP_CLIENT_ID
    });

    this.loadUserFromLocalStorage();
  }

  private loadUserFromLocalStorage(): void {
    if (typeof window !== 'undefined') { // Ensure it's in a browser
      const idToken = localStorage.getItem('idToken');
      if (idToken) {
        this.currentUserSignal.set({ idToken });
      }
    }
  }

  signIn(username: string, password: string): Promise<any> {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password
    });
  
    const user = new CognitoUser({
      Username: username,
      Pool: this.cognitoUserPool
    });
  
    return new Promise((resolve, reject) => {
      user.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          this.handleAuthSuccess(session);
          resolve(session);
        },
        onFailure: (err) => {
          console.error("Authentication failed:", err.message);
          this.handleAuthFailure(err);
          reject(err);
        }
      });
    });
  }
  
  private handleAuthSuccess(session: any): void {
    const tokens = {
      idToken: session.getIdToken().getJwtToken(),
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken()
    };
    
    localStorage.setItem('idToken', tokens.idToken);
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    
    this.currentUserSignal.set(tokens); // Update the signal with user tokens
  }

  private handleAuthFailure(err: any): void {
    console.error("Authentication failed:", err.message);
    this.currentUserSignal.set(null); // Clear user signal on failure
  }

  signOut(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  hasValidToken(): boolean {
    return !!this.currentUserSignal(); // Check if the user has a valid token
  }

  getCurrentUser() {
    return this.currentUserSignal(); 
  }

};