import type { FundSource, OwnedBy } from "@prisma/client";

// Interface definition
export type BuyEntry = {
    ifinId: string;
    scripsId: string;
    buyQuantity: number;
    buyPrice: number;
    buyValue: number;
    buyDate: Date;
    openQuantity: number;
    ownedBy: OwnedBy;
    sourceOfFunds: FundSource;
    fromDate: Date;
    toDate: Date;
};