export interface TickerMetadata {
  sector?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export interface PriceData {
  date: string;
  name: string;
  price: number;
}

export interface StockResponse {
  priceData: PriceData[];
  metadata: TickerMetadata[];
}

export interface AccountTransactionRecord {
  date: string;
  metadata: string;
  userID: string;
  uuid: string;
  value: number;
}

export interface TickerTransactionRecord {
  balance: number;
  date: string;
  metadata: string;
  units: number;
  userID: string;
  uuid: string;
  value: number;
}

export interface TransactionsHistory {
  accountTransactions: AccountTransactionRecord[];
  tickerTransactions: TickerTransactionRecord[];
}