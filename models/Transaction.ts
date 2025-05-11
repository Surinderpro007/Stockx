import mongoose from 'mongoose';

export interface ITransaction extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL';
  stockSymbol?: string;
  stockName?: string;
  quantity?: number;
  price?: number;
  amount: number;
  date: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL'],
      required: true,
    },
    stockSymbol: {
      type: String,
      required: function() {
        return this.type === 'BUY' || this.type === 'SELL';
      },
    },
    stockName: {
      type: String,
      required: function() {
        return this.type === 'BUY' || this.type === 'SELL';
      },
    },
    quantity: {
      type: Number,
      required: function() {
        return this.type === 'BUY' || this.type === 'SELL';
      },
    },
    price: {
      type: Number,
      required: function() {
        return this.type === 'BUY' || this.type === 'SELL';
      },
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema); 