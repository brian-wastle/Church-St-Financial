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

  public loadUserFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      const userData = {
        idToken: sessionStorage.getItem('idToken') || localStorage.getItem('idToken'),
        username: sessionStorage.getItem('username') || localStorage.getItem('username'),
        expiration: localStorage.getItem('tokenExpiration'), // Only applicable to localStorage
      };
  
      if (this.isTokenValid(userData)) {
        console.log("UserData:", userData);
        this.currentUserSignal.set(userData);
      } else {
        this.clearUserData();
      }
    }
  }

  private isTokenValid({ idToken, expiration }: { idToken: string | null, expiration: string | null }): boolean {
    if (localStorage.getItem('tokenExpiration')) {
      return !!(idToken && expiration && Date.now() < Number(expiration));
    }
    return !!idToken;
  }

  signIn(username: string, password: string, rememberDevice: boolean): Promise<any> {
    const user = new CognitoUser({ Username: username, Pool: this.cognitoUserPool });
    const authenticationDetails = new AuthenticationDetails({ Username: username, Password: password });
  
    return new Promise((resolve, reject) => {
      user.authenticateUser(authenticationDetails, {
        onSuccess: (session) => this.handleAuthSuccess(session, username, rememberDevice, resolve, reject),
        onFailure: (err) => this.handleAuthFailure(err, reject),
        newPasswordRequired: () => this.handleNewPassword()
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
  
    // Extract the "sub" from the ID token
    const payload = this.getJwtPayload(tokens.idToken);
    const userSub = payload.sub;
  
    if (typeof window !== 'undefined') {
      if (rememberDevice) {
        // Store tokens in localStorage for 30 days
        localStorage.setItem('idToken', tokens.idToken);
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('username', userSub);
        
        const expirationTime = 30 * 24 * 60 * 60 * 1000; // 30 days
        localStorage.setItem('tokenExpiration', (Date.now() + expirationTime).toString());
      } else {
        // Store tokens in sessionStorage for current session only
        sessionStorage.setItem('idToken', tokens.idToken);
        sessionStorage.setItem('accessToken', tokens.accessToken);
        sessionStorage.setItem('refreshToken', tokens.refreshToken);
        sessionStorage.setItem('username', userSub);
        
        // No need for token expiration in sessionStorage since it lasts only for the session
      }
    }
  
    this.currentUserSignal.set({ ...tokens, username: userSub });
    resolve(session);
  }
  

  private getJwtPayload(token: string): any {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
  }

  private handleAuthFailure(err: any, reject: (reason?: any) => void): void {
    console.error("Authentication failed:", err.message);
    this.clearUserData();
    reject(err);
  }

  private handleNewPassword(): void {

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
          resolve(); 
        }
      } else {
        console.warn("No valid token found. Clearing user data.");
        this.clearUserData();
        resolve(); 
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
