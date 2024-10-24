
//Ticker Browse
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


//Portfolio
export interface AccountTransactionRecord {
  balance: number;
  metadata: string;
  userID: string;
  date: number;
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

export interface TransactionRecord {
  uuid: string;
  accountTransaction: AccountTransactionRecord;
  tickerTransaction: TickerTransactionRecord;
}

export interface InvestmentPerformance {
  totalSpent: number;  
  totalEarned: number;  
  netProfitLoss: number; 
  currentInvestmentValue: number;
  roi: number;
}

export interface PortfolioItem {
  ticker: string;
  balance: number;
  price: number;
  totalValue: number;
  chartData?: ChartData;
  name?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill?: boolean;
    borderColor?: string;
    backgroundColor?: string;
  }[];
}
