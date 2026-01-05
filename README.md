# Binance Balance Tracker

A beautiful dark-themed web application that tracks your Binance account balance changes and displays profit/loss with color-coded indicators.

## Features

- 🔐 Secure API key storage (local browser storage)
- 📊 Real-time balance tracking with USD values
- 🎨 Dark theme with modern UI
- 💚 Green indicators for profit (positive changes)
- ❤️ Red indicators for loss (negative changes)
- 🔄 Auto-refresh every 30 seconds
- 📱 Responsive design for mobile and desktop

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get your Binance API keys:**
   - Log in to your Binance account
   - Go to API Management: https://www.binance.com/en/my/settings/api-management
   - Create a new API key
   - **Important:** Only enable "Read" permissions for security
   - Save your API Key and Secret Key

3. **Start the development servers:**
   ```bash
   npm run dev:all
   ```
   
   This will start both the backend proxy server (port 3001) and the frontend (port 5173).
   
   Or start them separately in two terminals:
   ```bash
   # Terminal 1 - Backend proxy server
   npm run dev:server
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to the URL shown in the terminal (usually http://localhost:5173)
   - Enter your Binance API Key and Secret Key
   - Click "Save & Connect"
   - Your balances will be fetched automatically

## Security Notes

- API keys are stored only in your browser's local storage
- Never share your API keys with anyone
- Only enable "Read" permissions when creating API keys
- The app only reads your account balance - it cannot make trades or withdrawals

## How It Works

1. The app fetches your account balance from Binance API
2. It compares current balances with previously stored balances
3. Calculates the change (both in asset amount and USD value)
4. Displays color-coded indicators:
   - **Green** = Profit (positive change)
   - **Red** = Loss (negative change)
   - **Gray** = No change

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React 18
- Vite
- Express (backend proxy server)
- Axios (for API calls)
- Crypto-JS (for HMAC signature generation)
- Modern CSS with dark theme

## Troubleshooting

- **"Failed to fetch balance" error:** 
  - Check that your API keys are correct and have read permissions
  - Make sure the backend proxy server is running on port 3001
- **Network errors:** 
  - Ensure both the backend server (port 3001) and frontend (port 5173) are running
  - Check that no other application is using port 3001
- **CORS errors:** The backend proxy server handles CORS, so make sure it's running
- **No balances showing:** Make sure you have assets in your Binance account with non-zero balances

