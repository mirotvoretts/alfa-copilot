export type PaymentChannel = 'mPOS' | 'QR-СБП' | 'AlfaPay';

export type TransactionCategory =
  'услуга' | 'чаевые' | 'расход_оборудование' | 'расход_аренда' | 'расход_материалы';

export interface Transaction {
  readonly date: string;
  readonly amount: number;
  readonly channel: PaymentChannel;
  readonly category: TransactionCategory;
}

export interface DailyBalance {
  readonly date: string;
  readonly balance: number;
}
