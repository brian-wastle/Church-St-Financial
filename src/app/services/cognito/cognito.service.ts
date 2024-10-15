import { Injectable } from '@angular/core';
import { CognitoUserPool, CognitoUser, CognitoUserSession, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  private cognitoUserPool: CognitoUserPool;
  public currentUserSignal = signal<any>(null);

  constructor() {
    this.cognitoUserPool = new CognitoUserPool({
      UserPoolId: environment.USER_POOL_ID,
      ClientId: environment.APP_CLIENT_ID
    });

    if (this.isBrowser()) {
      this.loadUserFromStorage();
      this.validateTokenWithAWS();
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser()) {
      return;
    }
    const userDataFromStorage = {
      idToken: localStorage.getItem('idToken') || sessionStorage.getItem('idToken'),
      username: localStorage.getItem('username') || sessionStorage.getItem('username'),
      tokenExpiration: localStorage.getItem('tokenExpiration') || sessionStorage.getItem('tokenExpiration')
    };
    if (this.isTokenValid(userDataFromStorage)) {
      this.currentUserSignal.set(userDataFromStorage);
    } else {
      this.clearUserData();
    }
  }

  private isTokenValid({ idToken, tokenExpiration }: { idToken: string | null, tokenExpiration: string | null }): boolean {
    return !!(idToken && tokenExpiration && Date.now() < Number(tokenExpiration) * 1000);
  }

  public validateTokenWithAWS(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.cognitoUserPool.getCurrentUser();

      if (!cognitoUser) {
        return resolve(false);
      }

      cognitoUser.getSession((err: any, session: CognitoUserSession) => {
        if (err || !session.isValid()) {
          this.clearUserData();
          return resolve(false);
        }

        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();
        const tokenExpiration = session.getIdToken().getExpiration();
        const username = this.getJwtPayload(idToken).sub;

        if (Date.now() > tokenExpiration * 1000) {
          this.clearUserData();
          return resolve(false);
        }

        this.currentUserSignal.set({ idToken, accessToken, refreshToken, tokenExpiration, username });
        this.storeUserData({ idToken, accessToken, refreshToken, tokenExpiration, username });
        resolve(true);
      });
    });
  }

  public validateSession(): Promise<boolean> {
    const currentUserData = this.currentUserSignal();
    return currentUserData?.idToken ? 
      Promise.resolve(this.isTokenValid(currentUserData)) : 
      this.validateSessionWithAWS();
  }

  // Validate session with AWS Cognito
  private validateSessionWithAWS(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.cognitoUserPool.getCurrentUser();

      if (!cognitoUser) return resolve(false);

      cognitoUser.getSession((err: any, session: CognitoUserSession) => {
        if (err || !session.isValid()) return resolve(false);

        const idToken = session.getIdToken().getJwtToken();
        const accessToken = session.getAccessToken().getJwtToken();
        const refreshToken = session.getRefreshToken().getToken();
        const tokenExpiration = session.getIdToken().getExpiration();
        const username = this.getJwtPayload(idToken).sub;

        if (Date.now() > tokenExpiration * 1000) return resolve(false);

        this.currentUserSignal.set({ idToken, accessToken, refreshToken, tokenExpiration, username });
        this.storeUserData({ idToken, accessToken, refreshToken, tokenExpiration, username });
        resolve(true);
      });
    });
  }

  // Sign in method
  public signIn(username: string, password: string, rememberDevice: boolean): Promise<any> {
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

    this.storeUserData({ ...tokens, username }, rememberDevice);
    this.currentUserSignal.set({ ...tokens, username });
    resolve(session);
  }

  private handleAuthFailure(err: any, reject: (reason?: any) => void): void {
    console.error("Authentication failed:", err.message);
    this.clearUserData();
    reject(err);
  }

  private handleNewPassword(): void {
    // Handle new password logic if needed
  }

  // Store user data in session or local storage based on user preference
  private storeUserData(user: { idToken: string, accessToken: string, refreshToken: string, tokenExpiration: number, username: string }, rememberDevice = false): void {
    const storage = rememberDevice ? localStorage : sessionStorage;
    storage.setItem('idToken', user.idToken);
    storage.setItem('accessToken', user.accessToken);
    storage.setItem('refreshToken', user.refreshToken);
    storage.setItem('username', user.username);
    storage.setItem('tokenExpiration', user.tokenExpiration.toString());
  }

  // Get JWT payload to extract user data
  private getJwtPayload(token: string): any {
    return JSON.parse(atob(token.split('.')[1]));
  }

  // Sign out globally and clear user data
  public signOut(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.cognitoUserPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.globalSignOut({
          onSuccess: () => {
            this.clearUserData();
            resolve();
          },
          onFailure: (err) => {
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
    if (!this.isBrowser()) {
      return;
    }
    localStorage.clear();
    sessionStorage.clear();
    this.currentUserSignal.set(null);
  }

  // Sign up method
  public signUp(
    email: string,
    password: string,
    givenName: string,
    familyName: string,
    birthdate: string,
    address: string,
    nickname: string,
    phone_number?: string
  ): Promise<any> {
    const signUpAttributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'given_name', Value: givenName }),
      new CognitoUserAttribute({ Name: 'family_name', Value: familyName }),
      new CognitoUserAttribute({ Name: 'birthdate', Value: birthdate }),
      new CognitoUserAttribute({ Name: 'address', Value: address }),
      new CognitoUserAttribute({ Name: 'nickname', Value: nickname }),
    ];

    if (phone_number) {
      signUpAttributes.push(new CognitoUserAttribute({ Name: 'phone_number', Value: phone_number }));
    }

    return new Promise((resolve, reject) => {
      this.cognitoUserPool.signUp(email, password, signUpAttributes, [], (err, data) => {
        if (err) {
          console.error("Sign-up failed:", err.message);
          reject(err);
        } else {
          console.log("Sign-up successful:", data);
          // Move to verification step
          resolve(data);
        }
      });
    });
  }
  

  public verifyUser(confirmationCode: string, email: string, password: string): Promise<any> {
    // Initialize Cognito User Pool with the required poolId and clientId
    const poolData = {
      UserPoolId: environment.USER_POOL_ID, // Use environment variables
      ClientId: environment.APP_CLIENT_ID,
    };
    const userPool = new CognitoUserPool(poolData);
  
    // Create a CognitoUser object using the email (Username) and the User Pool
    const userData = {
      Username: email,
      Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);
  
    return new Promise((resolve, reject) => {
      // First, confirm the user's registration with the verification code
      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          console.error("Verification failed:", err.message);
          reject(err);
          return;
        }
  
        console.log("Verification successful:", result);
  
        // After successful verification, log the user in automatically
        const authenticationDetails = new AuthenticationDetails({
          Username: email,
          Password: password,
        });
  
        // Recreate the CognitoUser object to be used for authentication
        const cognitoUserForLogin = new CognitoUser({
          Username: email,
          Pool: userPool,
        });
  
        // Authenticate the user with the provided credentials
        cognitoUserForLogin.authenticateUser(authenticationDetails, {
          onSuccess: (session) => {
            console.log("Login successful:", session);
  
            // Store the session and user data
            const tokens = {
              idToken: session.getIdToken().getJwtToken(),
              accessToken: session.getAccessToken().getJwtToken(),
              refreshToken: session.getRefreshToken().getToken(),
              tokenExpiration: session.getIdToken().getExpiration(),
              username: email,
            };
  
            // Store in session or local storage based on preference
            this.storeUserData(tokens, true); // Assuming `true` for "remember device"
            this.currentUserSignal.set(tokens);
  
            resolve(session);
          },
          onFailure: (authError) => {
            console.error("Login failed:", authError.message);
            reject(authError);
          },
        });
      });
    });
  }
}
