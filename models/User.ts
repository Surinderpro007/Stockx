import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  profileImage: string;
  accountBalance: number;
  portfolio: Array<{
    stockId: string;
    symbol: string;
    companyName: string;
    quantity: number;
    avgBuyPrice: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    portfolio: [
      {
        stockId: String,
        symbol: String,
        companyName: String,
        quantity: Number,
        avgBuyPrice: Number,
      },
    ],
  },
  { timestamps: true }
);

// Helper method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if the model already exists before creating a new one
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 