// Interface definition
export interface MarketDataResponse {
    Exch: string;
    ExchType: string;
    High: number;
    LastRate: number;
    Low: number;
    Message: string;
    PClose: number;
    Status: number;
    TickDt: string;
    Time: number;
    Token: number;
    TotalQty: number;
}