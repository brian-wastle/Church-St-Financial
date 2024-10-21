import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CognitoService } from '../cognito/cognito.service';
import { environment } from '../../../environments/environment';
import { StockResponse, TickerMetadata, PriceData } from '../../models/api-response.model';

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
      userID: userID // Use the actual userID if needed
    };
    const reqUrl = `${this.apiUrl}/getPortfolio`;
    return this.http.post<any>(reqUrl, body, { headers });
  }

  getSingleStock(ticker: string): Observable<StockResponse> {
    const currentUser = this.cognitoService.currentUserSignal();
    const idToken: string = currentUser?.idToken || currentUser?.refreshToken;
  
    if (!idToken) {
      throw new Error('No valid authentication token found');
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': idToken
    });
  
    const reqUrl = `${this.apiUrl}/getSingleStock?ticker=${ticker}`;
  
    return this.http.get<StockResponse>(reqUrl, { headers }).pipe(
      map((response: any) => {
        const metadataArray = response.metadata || [];
        const transformedMetadata: TickerMetadata = metadataArray.length > 0 ? {
          sector: metadataArray[0]?.sector?.S || null,
          industry: metadataArray[0]?.industry?.S || null,
          website: metadataArray[0]?.officialSite?.S || null,
          description: metadataArray[0]?.description?.S || null
        } : {};
    
        const transformedPriceData: PriceData[] = response.priceData?.map((data: any) => ({
          date: data?.date?.S || 'Unknown Date',
          name: data.name?.S || 'Error: Name Not Found',
          price: parseFloat(data?.price?.N || '0')
        })) || [];
    
        return {
          metadata: [transformedMetadata], // Wrap transformedMetadata in an array
          priceData: transformedPriceData
        };
      })
    );
  }
  

  calcHoldingValue(balance: number, price: number): number {
    return balance * price;
  }
}
