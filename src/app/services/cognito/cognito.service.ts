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
    if (typeof window !== 'undefined') {
      const userData = {
        idToken: localStorage.getItem('idToken'),
        username: localStorage.getItem('username'),
        expiration: localStorage.getItem('tokenExpiration'),
      };

      if (this.isTokenValid(userData)) {
        this.currentUserSignal.set(userData);
      } else {
        this.clearUserData();
      }
    }
  }

  private isTokenValid({ idToken, expiration }: { idToken: string | null, expiration: string | null }): boolean {
    return !!(idToken && expiration && Date.now() < Number(expiration));
  }

  signIn(username: string, password: string, rememberDevice: boolean): Promise<any> {
    const user = new CognitoUser({ Username: username, Pool: this.cognitoUserPool });
    const authenticationDetails = new AuthenticationDetails({ Username: username, Password: password });

    return new Promise((resolve, reject) => {
      user.authenticateUser(authenticationDetails, {
        onSuccess: (session) => this.handleAuthSuccess(session, username, rememberDevice, resolve, reject),
        onFailure: (err) => this.handleAuthFailure(err, reject),
        newPasswordRequired: () => {
          // Handle new password required case if needed
        }
      });
    });
  }

  private handleAuthSuccess(session: any, username: string, rememberDevice: boolean, resolve: (value?: any) => void, reject: (reason?: any) => void): void {
    const tokens = {
      idToken: session.getIdToken().getJwtToken(),
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      tokenExpiration: session.getIdToken().getExpiration(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('idToken', tokens.idToken);
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('username', username);

      if (rememberDevice) {
        const expirationTime = 30 * 24 * 60 * 60 * 1000; // 30 days
        localStorage.setItem('tokenExpiration', (Date.now() + expirationTime).toString());
      }
    }
    this.currentUserSignal.set(tokens);
    resolve(session);
  }

  private handleAuthFailure(err: any, reject: (reason?: any) => void): void {
    console.error("Authentication failed:", err.message);
    this.clearUserData();
    reject(err);
  }

  signOut(): Promise<void> {
    return new Promise((resolve) => {
      if (this.hasValidToken()) { // Check if there is a valid token
        const user = this.getCurrentUser(); // Get the user object

        if (user) {
          user.getSession((err: any, session: any) => {
            if (err || !session.isValid()) {
              this.clearUserData();
            } else {
              user.globalSignOut({
                onSuccess: () => this.clearUserData(),
                onFailure: (err: any) => console.error("Global sign out failed:", err)
              });
            }
            resolve();
          });
        } else {
          console.warn("No current user found. Clearing user data.");
          this.clearUserData();
          resolve(); // No user to sign out
        }
      } else {
        console.warn("No valid token found. Clearing user data.");
        this.clearUserData();
        resolve(); // No valid session to sign out
      }
    });
}

  private clearUserData(): void {
    this.currentUserSignal.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('tokenExpiration');
    }
  }

  hasValidToken(): boolean {
    const currentUserData = this.currentUserSignal();
    return currentUserData && currentUserData.idToken && Date.now() < this.getTokenExpiration(currentUserData.idToken);
  }

  getCurrentUser(): CognitoUser | null {
    const currentUserData = this.currentUserSignal();
    if (currentUserData && currentUserData.idToken) {
      return new CognitoUser({ Username: currentUserData.username, Pool: this.cognitoUserPool });
    }
    return null;
  }

  private getTokenExpiration(token: string): number {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  }

  refreshToken(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (this.hasValidToken()) { // Check if there is a valid token
            const user = this.getCurrentUser(); // Get the user object

            if (user) {
                const session = user.getSignInUserSession();
                if (session) {
                    user.refreshSession(session.getRefreshToken(), (err, newSession) => {
                        if (err) {
                            console.error("Session refresh failed:", err);
                            reject(err);
                        } else {
                            const username = localStorage.getItem('username');
                            if (username) {
                                this.handleAuthSuccess(newSession, username, false, resolve, reject);
                            } else {
                                reject(new Error("Username not found in local storage"));
                            }
                        }
                    });
                } else {
                    reject(new Error("No valid session available"));
                }
            } else {
                reject(new Error("No user session available"));
            }
        } else {
            reject(new Error("No valid token available"));
        }
    });
}

}
