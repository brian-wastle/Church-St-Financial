import { Injectable } from '@angular/core';
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
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

  // Load user from local storage and validate with AWS on first render
  public loadUserFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      const userData = {
        idToken: sessionStorage.getItem('idToken') || localStorage.getItem('idToken'),
        username: sessionStorage.getItem('username') || localStorage.getItem('username'),
        expiration: localStorage.getItem('tokenExpiration')
      };
  
      this.validateSessionWithAWS()
        .then(isValid => {
          if (isValid && this.isTokenValid(userData)) {
            this.currentUserSignal.set(userData);
          } else {
            this.clearUserData();  // Ensure the session is invalidated on Cognito logout
          }
        })
        .catch(() => {
          this.clearUserData();  // Catch the error if the session is invalid
        });
    }
  }

  // Validate the session with AWS Cognito
  public validateSession(): Promise<boolean> {
    const currentUserData = this.currentUserSignal();
    if (currentUserData && currentUserData.idToken) {
      return Promise.resolve(this.isTokenValid(currentUserData));
    }
    return this.validateSessionWithAWS();
  }

  // Validate the session with AWS Cognito
  private validateSessionWithAWS(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.cognitoUserPool.getCurrentUser();
  
      // No current user (session expired or not logged in)
      if (!cognitoUser) {
        this.clearUserData();
        return resolve(false);
      }
  
      // Validate the session with AWS Cognito
      cognitoUser.getSession((err: any, session: CognitoUserSession) => {
        if (err || !session.isValid()) {
          // If there's an error or session is invalid, clear data
          this.clearUserData();
          return reject(false);
        }
  
        // Fetch the tokens from the session
        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();
        const tokenExpiration = session.getIdToken().getExpiration();
        const username = this.getJwtPayload(idToken).sub;
  
        // Validate token expiration (ensure it's not expired)
        if (Date.now() > tokenExpiration * 1000) {
          this.clearUserData();
          return reject(false);
        }
  
        // Set the current user in the signal
        const tokens = {
          idToken,
          accessToken,
          refreshToken,
          tokenExpiration,
          username
        };
  
        // Update the currentUserSignal with the tokens
        this.currentUserSignal.set(tokens);
  
        // Successfully validated the session
        resolve(true);
      });
    });
  }
  

  // Check if token is valid
  private isTokenValid({ idToken, expiration }: { idToken: string | null, expiration: string | null }): boolean {
    if (expiration) {
      return !!(idToken && Date.now() < Number(expiration));
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

  private handleAuthSuccess(session: CognitoUserSession, username: string, rememberDevice: boolean, resolve: (value?: any) => void, reject: (reason?: any) => void): void {
    const tokens = {
      idToken: session.getIdToken().getJwtToken(),
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      tokenExpiration: session.getIdToken().getExpiration(),
    };

    const payload = this.getJwtPayload(tokens.idToken);
    const userSub = payload.sub;

    if (typeof window !== 'undefined') {
      if (rememberDevice) {
        localStorage.setItem('idToken', tokens.idToken);
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('username', userSub);
        const expirationTime = 30 * 24 * 60 * 60 * 1000; // 30 days
        localStorage.setItem('tokenExpiration', (Date.now() + expirationTime).toString());
      } else {
        sessionStorage.setItem('idToken', tokens.idToken);
        sessionStorage.setItem('accessToken', tokens.accessToken);
        sessionStorage.setItem('refreshToken', tokens.refreshToken);
        sessionStorage.setItem('username', userSub);
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

  private handleNewPassword(): void {}

  signOut(): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = this.getCurrentUser();
      if (user) {
        user.globalSignOut({
          onSuccess: () => {
            this.clearUserData();
            resolve();
          },
          onFailure: (err) => {
            console.error("Global sign out failed:", err);
            this.clearUserData();
            reject(err);
          }
        });
      } else {
        this.clearUserData();
        resolve();
      }
    });
  }

  public clearUserData(): void {
    // Clear local/session storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('tokenExpiration');
      sessionStorage.removeItem('idToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('username');
    }
  
    // Clear the user signal
    this.currentUserSignal.set(null);
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
      if (this.hasValidToken()) {
        const user = this.getCurrentUser();
        if (user) {
          const session = user.getSignInUserSession();
          if (session) {
            user.refreshSession(session.getRefreshToken(), (err, newSession) => {
              if (err) {
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
