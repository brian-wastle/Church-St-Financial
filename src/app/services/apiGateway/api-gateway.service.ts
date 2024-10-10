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

  getData(): Observable<any> {
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
      userID: userID
    };
    const reqUrl = `${this.apiUrl}/getPortfolio`; // Removed trailing slash
    console.log('Request URL:', reqUrl);
    console.log('Request Headers:', headers);
    console.log('Request Body:', body);
    return this.http.post<any>(reqUrl, body, { headers });
  }
}
