import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CognitoService } from '../cognito/cognito.service';
import { environment } from '../../../environments/environment';
import { StockResponse, TickerMetadata, PriceData, TransactionsHistory, AccountTransactionRecord, TickerTransactionRecord } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient, private cognitoService: CognitoService) {}

  getPortfolio(): Observable<any> {
    const currentUser = this.cognitoService.currentUserSignal();
    const userID: string = currentUser?.username;
    const idToken: string = currentUser?.idToken || currentUser?.refreshToken;

    console.log(currentUser?.username);
    
    if (!idToken) {
      throw new Error('No valid authentication token found');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': idToken
    });

    const body = {
      userID: userID // Use dynamic userID for production
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
          metadata: [transformedMetadata],
          priceData: transformedPriceData
        };
      })
    );
  }

  getStockTransactions(userID: string, ticker: string): Observable<TransactionsHistory> {
    const currentUser = this.cognitoService.currentUserSignal();
    const idToken: string = currentUser?.idToken || currentUser?.refreshToken;

    if (!idToken) {
      throw new Error('No valid authentication token found');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': idToken
    });

    const reqUrl = `${this.apiUrl}/getStockTransactions?userID=${userID}&ticker=${ticker}`;
    
    return this.http.get<{ accountTransactions: AccountTransactionRecord[], tickerTransactions: TickerTransactionRecord[] }>(reqUrl, { headers }).pipe(
      map(response => {
        const accountTransactions: AccountTransactionRecord[] = response.accountTransactions.map(transaction => ({
          date: transaction.date,
          metadata: transaction.metadata,
          userID: transaction.userID,
          uuid: transaction.uuid,
          value: transaction.value
        }));

        const tickerTransactions: TickerTransactionRecord[] = response.tickerTransactions.map(transaction => ({
          balance: transaction.balance,
          date: transaction.date,
          metadata: transaction.metadata,
          units: transaction.units,
          userID: transaction.userID,
          uuid: transaction.uuid,
          value: transaction.value
        }));

        return {
          accountTransactions,
          tickerTransactions
        };
      })
    );
  }

  calcHoldingValue(balance: number, price: number): number {
    return balance * price;
  }
}
