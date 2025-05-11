import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get query parameters for pagination if needed
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    // Fetch transactions for this user
    const transactions = await Transaction.find(
      { userId: user._id },
      null,
      { sort: { date: -1 }, limit, skip }
    );

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, stockSymbol, stockName, quantity, price, amount } = body;

    // Validate input based on transaction type
    if (!type || !['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    if ((type === 'BUY' || type === 'SELL') && 
        (!stockSymbol || !stockName || !quantity || !price || !amount)) {
      return NextResponse.json(
        { message: 'Missing required fields for stock transaction' },
        { status: 400 }
      );
    }

    if ((type === 'DEPOSIT' || type === 'WITHDRAWAL') && !amount) {
      return NextResponse.json(
        { message: 'Missing amount for deposit/withdrawal' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Process transaction based on type
    if (type === 'BUY') {
      // Check if user has enough balance
      if (user.accountBalance < amount) {
        return NextResponse.json(
          { message: 'Insufficient funds' },
          { status: 400 }
        );
      }

      // Update user balance
      user.accountBalance -= amount;

      // Ensure portfolio array exists
      if (!user.portfolio) {
        user.portfolio = [];
      }

      // Update user portfolio
      const existingStockIndex = user.portfolio.findIndex(
        (stock: any) => stock.symbol === stockSymbol
      );

      if (existingStockIndex !== -1) {
        // Calculate new average buy price
        const existingStock = user.portfolio[existingStockIndex];
        const totalShares = existingStock.quantity + quantity;
        const totalCost = existingStock.quantity * existingStock.avgBuyPrice + amount;
        const newAvgPrice = totalCost / totalShares;

        // Update existing stock
        user.portfolio[existingStockIndex].quantity = totalShares;
        user.portfolio[existingStockIndex].avgBuyPrice = newAvgPrice;
      } else {
        // Add new stock to portfolio
        user.portfolio.push({
          stockId: stockSymbol.toLowerCase(),
          symbol: stockSymbol,
          companyName: stockName,
          quantity,
          avgBuyPrice: price,
        });
      }

      // Console log for debugging
      console.log('Updated portfolio:', user.portfolio);
    } else if (type === 'SELL') {
      // Find stock in portfolio
      const stockIndex = user.portfolio.findIndex(
        (stock: any) => stock.symbol === stockSymbol
      );

      if (stockIndex === -1) {
        return NextResponse.json(
          { message: 'Stock not found in portfolio' },
          { status: 400 }
        );
      }

      const stock = user.portfolio[stockIndex];

      // Check if user has enough shares
      if (stock.quantity < quantity) {
        return NextResponse.json(
          { message: 'Insufficient shares' },
          { status: 400 }
        );
      }

      // Update user balance
      user.accountBalance += amount;

      // Update portfolio
      if (stock.quantity === quantity) {
        // Remove stock if selling all shares
        user.portfolio.splice(stockIndex, 1);
      } else {
        // Update quantity if selling some shares
        user.portfolio[stockIndex].quantity -= quantity;
      }
    } else if (type === 'DEPOSIT') {
      user.accountBalance += amount;
    } else if (type === 'WITHDRAWAL') {
      if (user.accountBalance < amount) {
        return NextResponse.json(
          { message: 'Insufficient funds' },
          { status: 400 }
        );
      }
      user.accountBalance -= amount;
    }

    // Save updated user
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      type,
      ...(type === 'BUY' || type === 'SELL' ? {
        stockSymbol,
        stockName,
        quantity,
        price,
      } : {}),
      amount,
      date: new Date(),
    });

    return NextResponse.json({
      message: 'Transaction processed successfully',
      transaction,
      newBalance: user.accountBalance,
      // Return updated portfolio for BUY/SELL transactions
      ...(type === 'BUY' || type === 'SELL' ? { portfolio: user.portfolio } : {})
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the transaction' },
      { status: 500 }
    );
  }
} 