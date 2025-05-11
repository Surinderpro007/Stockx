import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

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

    console.log('Fetching user data for:', session.user.email);
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      console.error('User not found:', session.user.email);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Ensure portfolio is initialized if it doesn't exist
    if (!user.portfolio) {
      user.portfolio = [];
      await user.save();
      console.log('Initialized empty portfolio for user');
    }

    console.log('User portfolio size:', user.portfolio?.length || 0);
    if (user.portfolio?.length > 0) {
      console.log('Sample portfolio item:', user.portfolio[0]);
    }

    // Return user data without sensitive information
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      accountBalance: user.accountBalance,
      portfolio: user.portfolio || [],
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}

// Update user account balance
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { action, amount, name, phone, profileImage } = data;
    
    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Handle account balance update
    if (action && amount) {
      if (action === 'deposit') {
        user.accountBalance = (user.accountBalance || 0) + amount;
      } else if (action === 'withdraw') {
        if (user.accountBalance < amount) {
          return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
        }
        user.accountBalance = user.accountBalance - amount;
      } else {
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
      }
    }
    
    // Handle profile update
    if (name !== undefined) {
      user.name = name;
    }
    
    if (phone !== undefined) {
      user.phone = phone;
    }
    
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }
    
    await user.save();
    
    return NextResponse.json({ 
      message: 'User updated successfully',
      accountBalance: user.accountBalance,
      name: user.name,
      phone: user.phone,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
} 