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