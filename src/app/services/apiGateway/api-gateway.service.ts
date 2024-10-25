import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CognitoService } from '../cognito/cognito.service';
import { environment } from '../../../environments/environment';
import { 
  StockResponse, 
  TickerMetadata, 
  PriceData, 
  TransactionsHistory, 
  TransactionRecord,
  AccountTransactionRecord, 
  TickerTransactionRecord
} from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient, private cognitoService: CognitoService) {}


  getPortfolio(): Observable<any> {
    const currentUser = this.cognitoService.currentUserSignal();
    let userID: string = currentUser?.username;
    userID ='94b8a4d8-20b1-7002-c209-5b0f15ba6d94';                                               //remove for production
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

        const orderedPriceData: PriceData[] = response.priceData?.reverse();
        const transformedPriceData: PriceData[] = orderedPriceData?.map((data: any) => ({
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

  getStockTransactions(ticker: string): Observable<TransactionsHistory> {
    const currentUser = this.cognitoService.currentUserSignal();
    let userID: string = currentUser?.username;
    userID ='94b8a4d8-20b1-7002-c209-5b0f15ba6d94';                                               //remove for production
    const idToken: string = currentUser?.idToken || currentUser?.refreshToken;
  
    if (!idToken) {
      throw new Error('No valid authentication token found');
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': idToken
    });
  
    const reqUrl = `${this.apiUrl}/getStockTransactions?userID=${userID}&ticker=${ticker}`;
  
    return this.http.get<TransactionsHistory>(reqUrl, { headers });
  }

mergeTransactions(accountTransactions: AccountTransactionRecord[], tickerTransactions: TickerTransactionRecord[]): TransactionRecord[] {
    const mergedTransactions: TransactionRecord[] = [];

    accountTransactions.forEach(accountTx => {
      const matchingTickerTx = tickerTransactions.find(tickerTx => tickerTx.uuid === accountTx.uuid);
      if (matchingTickerTx) {
        mergedTransactions.push({
          uuid: accountTx.uuid,
          accountTransaction: accountTx,
          tickerTransaction: matchingTickerTx
        });
      }
    });

    return mergedTransactions;
  }

  calcHoldingValue(balance: number, price: number): number {
    return balance * price;
  }
}
