import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CognitoService } from '../cognito/cognito.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.API_URL; // Your actual API endpoint

  constructor(private http: HttpClient, private cognitoService: CognitoService) {}

  getPortfolio(): Observable<any> {
    const currentUser = this.cognitoService.currentUserSignal(); // Get current user data
    const userID: string = currentUser?.username; // Extract user ID
    const idToken: string = currentUser?.idToken || currentUser?.refreshToken;

    if (!idToken) {
      throw new Error('No valid authentication token found');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': idToken
    });

    const body = {
      userID: '94b8a4d8-20b1-7002-c209-5b0f15ba6d94'
    };
    const reqUrl = `${this.apiUrl}/getPortfolio`; // Removed trailing slash
    return this.http.post<any>(reqUrl, body, { headers });
  }

  getSingleStock(ticker: string): Observable<any> {
    const currentUser = this.cognitoService.currentUserSignal(); // Get current user data
    const userID: string = currentUser?.username; // Extract user ID
    const idToken: string = currentUser?.idToken || currentUser?.refreshToken;
  
    if (!idToken) {
      throw new Error('No valid authentication token found');
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': idToken
    });
  
    const reqUrl = `${this.apiUrl}/getSingleStock?ticker=${ticker}`;
  
    return this.http.get<any>(reqUrl, { headers });
  }

  calcHoldingValue(balance: number, price: number): number {
    return balance * price;
  }

}
