export interface ILineItem {
    description: string;
}

export interface IReceiptLineItem extends ILineItem {
    amount: number;
}

export class LineItem implements ILineItem {
    description: string;

    constructor(description: string) {
        this.description = description;
    }
}

export class ReceiptLineItem extends LineItem implements IReceiptLineItem {
    amount: number;

    constructor(description: string, amount: number) {
        super(description);
        this.amount = amount;
    }
}

