# NextStocks - Stock Market Application

A modern stock market application built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## Features

- **User Authentication**: Register, log in, and log out securely
- **Stock Trading**: Buy and sell stocks with real-time pricing
- **Portfolio Management**: Track your portfolio performance over time
- **Search & Filter**: Find specific stocks using powerful search and filter options
- **Wallet Management**: Add and withdraw money from your account
- **Automatic Accounting**: Automatic debit/credit when buying or selling stocks
- **SIP Calculator**: Calculate potential returns on systematic investments
- **Dark/Light Mode**: Toggle between dark and light mode based on your preference

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **State Management**: React Hooks
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Forms**: Formik with Yup validation
- **Charts**: Chart.js with react-chartjs-2

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/next-stocks.git
   cd next-stocks
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
next-stocks/
├── app/                  # Next.js 13+ App Router
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   ├── profile/          # User profile pages
│   ├── stocks/           # Stock browsing and trading pages
│   └── calculator/       # SIP Calculator
├── components/           # React components
│   ├── ui/               # UI components
│   ├── auth/             # Authentication components
│   ├── stocks/           # Stock-related components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility functions and libraries
├── models/               # MongoDB models
├── utils/                # Helper functions
├── public/               # Static files
└── styles/               # Global styles
```

## Usage

1. **Authentication**: Register for a new account or log in with existing credentials
2. **Dashboard**: View your portfolio performance, account balance, and recent transactions
3. **Stocks**: Browse available stocks, search for specific ones, and buy/sell
4. **Portfolio**: Track your investments and view detailed performance
5. **Wallet**: Add or withdraw funds from your account
6. **SIP Calculator**: Calculate potential returns on systematic investments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Chart.js](https://www.chartjs.org/)
- [React Icons](https://react-icons.github.io/react-icons/)

## Deploying to Vercel

This project is optimized for deployment on Vercel. Follow these steps to deploy:

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and sign up/login with your GitHub account
3. Click "Import Project" and select your repository
4. Configure your project:
   - Framework Preset: Next.js
   - Environment Variables: Add all variables from .env.example with proper values
5. Click "Deploy"

Once deployed, Vercel will automatically handle builds for future commits to your repository. 