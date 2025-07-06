# ArtShare - Blockchain-Based Art Co-Ownership Platform

A decentralized platform built on the Internet Computer Protocol (ICP) that enables fractional ownership of digital artworks through tokenization. Users can buy, sell, and trade ownership tokens representing shares in valuable art pieces.

## 🎨 Features

### Core Functionality
- **Fractional Art Ownership**: Purchase tokens representing fractional ownership in digital artworks
- **Secure Trading**: Buy and sell ownership tokens through a decentralized marketplace
- **Artist Onboarding**: Artists can tokenize their artworks and enable fractional ownership
- **Portfolio Management**: Track your art investments and ownership percentages
- **Verification System**: Verified artists and artworks for authenticity

### Technical Features
- **Internet Computer Integration**: Built on ICP for true decentralization
- **Internet Identity Authentication**: Secure, privacy-preserving login
- **Stable Memory**: Persistent data storage across canister upgrades
- **Real-time Updates**: Live trading and ownership data
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Backend (Rust Canister)
- **Smart Contracts**: Rust-based canisters handling all business logic
- **Data Management**: Stable structures for persistent storage
- **Token Economics**: Fractional ownership token system
- **Trading Engine**: Peer-to-peer token trading functionality

### Frontend (React Application)
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components
- **ICP Integration**: Direct communication with backend canisters
- **Wallet Integration**: Internet Identity authentication
- **Responsive Design**: Mobile-first approach

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Rust (latest stable)
- dfx (Internet Computer SDK)
- pnpm (package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd art_co_ownership
   ```

2. **Install dependencies**
   ```bash
   # Install Rust dependencies
   cargo update
   
   # Install frontend dependencies
   cd art-co-ownership-frontend
   pnpm install
   cd ..
   ```

3. **Start local Internet Computer replica**
   ```bash
   dfx start --background
   ```

4. **Deploy canisters**
   ```bash
   # Deploy backend canister
   dfx deploy art_co_ownership_backend
   
   # Build and deploy frontend
   cd art-co-ownership-frontend
   pnpm run build
   cd ..
   dfx deploy art_co_ownership_frontend
   ```

5. **Access the application**
   ```bash
   # Get the frontend canister URL
   dfx canister call art_co_ownership_frontend http_request '(record{url="/"; method="GET"; body=vec{}; headers=vec{}})'
   
   # Or check the local URL
   echo "http://localhost:4943/?canisterId=$(dfx canister id art_co_ownership_frontend)"
   ```

## 🛠️ Development

### Backend Development

The backend is written in Rust and provides the following main functionalities:

#### Data Structures
- `ArtPiece`: Represents a tokenized artwork
- `TokenOwnership`: Tracks user ownership of art tokens
- `TradeOffer`: Manages peer-to-peer trading offers
- `UserProfile`: User account information

#### Key Functions
- `create_art_piece()`: Tokenize new artworks
- `purchase_tokens()`: Buy fractional ownership tokens
- `create_trade_offer()`: List tokens for sale
- `accept_trade_offer()`: Execute trades

### Frontend Development

The frontend is built with React and provides:

#### Main Components
- **HomePage**: Browse and discover artworks
- **PortfolioPage**: Manage your art investments
- **CreateArtPage**: Tokenize new artworks
- **Navigation**: User authentication and navigation

#### Key Features
- Real-time data from ICP backend
- Internet Identity integration
- Responsive design with Tailwind CSS
- Modern UI components from shadcn/ui

### Running in Development Mode

1. **Start the local replica**
   ```bash
   dfx start --clean
   ```

2. **Deploy backend in watch mode**
   ```bash
   dfx deploy art_co_ownership_backend
   ```

3. **Start frontend development server**
   ```bash
   cd art-co-ownership-frontend
   pnpm run dev
   ```

4. **Access the development server**
   - Frontend: `http://localhost:5173`
   - Backend Candid UI: `http://localhost:4943/?canisterId=<backend-canister-id>&id=<backend-canister-id>`

## 📦 Project Structure

```
art_co_ownership/
├── src/
│   └── art_co_ownership_backend/
│       ├── src/
│       │   └── lib.rs                 # Main backend logic
│       ├── Cargo.toml                 # Rust dependencies
│       └── art_co_ownership_backend.did # Candid interface
├── art-co-ownership-frontend/
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── lib/
│   │   │   └── icp.js                # ICP integration service
│   │   ├── App.jsx                   # Main React application
│   │   └── main.jsx                  # React entry point
│   ├── public/                       # Static assets
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.js               # Vite configuration
├── dfx.json                          # dfx configuration
├── Cargo.toml                        # Workspace configuration
└── README.md                         # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_BACKEND_CANISTER_ID=your-backend-canister-id
REACT_APP_INTERNET_IDENTITY_CANISTER_ID=your-ii-canister-id
NODE_ENV=development
```

### dfx.json Configuration

The `dfx.json` file configures both backend and frontend canisters:

- **Backend**: Rust canister with Candid interface
- **Frontend**: Asset canister serving the React build

## 🚀 Deployment

### Local Deployment

1. **Start local replica**
   ```bash
   dfx start --background
   ```

2. **Deploy all canisters**
   ```bash
   dfx deploy
   ```

### Mainnet Deployment

1. **Add cycles to your wallet**
   ```bash
   dfx wallet --network ic balance
   ```

2. **Deploy to mainnet**
   ```bash
   dfx deploy --network ic
   ```

3. **Update frontend environment variables**
   ```bash
   # Update canister IDs in .env file
   REACT_APP_BACKEND_CANISTER_ID=$(dfx canister --network ic id art_co_ownership_backend)
   ```

## 🧪 Testing

### Backend Tests
```bash
cargo test
```

### Frontend Tests
```bash
cd art-co-ownership-frontend
pnpm test
```

### Integration Tests
```bash
# Deploy locally and run integration tests
dfx start --background
dfx deploy
# Run your integration test suite
```

## 📊 Usage Examples

### Creating an Art Piece

```javascript
import icpService from './lib/icp.js';

const artData = {
  title: "Digital Masterpiece",
  artist: "CryptoArtist",
  description: "A stunning digital artwork...",
  image_url: "https://example.com/image.jpg",
  total_tokens: 1000,
  price_per_token: 100000 // 0.001 ICP in e8s
};

const result = await icpService.createArtPiece(artData);
```

### Purchasing Tokens

```javascript
const artId = 1;
const tokenAmount = 50;

const ownership = await icpService.purchaseTokens(artId, tokenAmount);
console.log(`Purchased ${tokenAmount} tokens for art piece ${artId}`);
```

### Creating a Trade Offer

```javascript
const offerData = {
  art_id: 1,
  tokens_for_sale: 25,
  price_per_token: 110000 // 0.0011 ICP in e8s
};

const offer = await icpService.createTradeOffer(offerData);
```

## 🔐 Security Considerations

- **Internet Identity**: Secure, privacy-preserving authentication
- **Canister Security**: Rust's memory safety prevents common vulnerabilities
- **Access Control**: Proper authorization checks for all operations
- **Data Validation**: Input validation on both frontend and backend
- **Stable Memory**: Secure data persistence across upgrades

## 🏆 Acknowledgments

- **DFINITY Foundation** for the Internet Computer Protocol
- **Rust Community** for excellent tooling and libraries
- **React Team** for the frontend framework
- **shadcn/ui** for beautiful UI components

---

Built with ❤️ on the Internet Computer

# Blockchain-Art-Co-ownership
# Blockchain-Art-Co-ownership
