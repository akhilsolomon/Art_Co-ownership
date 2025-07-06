import { Actor, HttpAgent } from '@dfinity/agent'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'

// Canister IDs - these will be set after deployment
const BACKEND_CANISTER_ID = process.env.REACT_APP_BACKEND_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai'
const INTERNET_IDENTITY_URL = process.env.NODE_ENV === 'production' 
  ? 'https://identity.ic0.app'
  : `http://localhost:4943/?canisterId=${process.env.REACT_APP_INTERNET_IDENTITY_CANISTER_ID}`

// IDL (Interface Description Language) for the backend canister
const idlFactory = ({ IDL }) => {
  const ArtPiece = IDL.Record({
    'id' : IDL.Nat64,
    'title' : IDL.Text,
    'artist' : IDL.Text,
    'description' : IDL.Text,
    'image_url' : IDL.Text,
    'total_tokens' : IDL.Nat64,
    'price_per_token' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'creator' : IDL.Principal,
    'verified' : IDL.Bool,
  });
  
  const TokenOwnership = IDL.Record({
    'art_id' : IDL.Nat64,
    'owner' : IDL.Principal,
    'tokens_owned' : IDL.Nat64,
    'purchase_price' : IDL.Nat64,
    'purchase_date' : IDL.Nat64,
  });
  
  const TradeOffer = IDL.Record({
    'id' : IDL.Nat64,
    'art_id' : IDL.Nat64,
    'seller' : IDL.Principal,
    'tokens_for_sale' : IDL.Nat64,
    'price_per_token' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'active' : IDL.Bool,
  });
  
  const UserProfile = IDL.Record({
    'principal' : IDL.Principal,
    'username' : IDL.Text,
    'email' : IDL.Text,
    'created_at' : IDL.Nat64,
    'total_investments' : IDL.Nat64,
    'verified' : IDL.Bool,
  });
  
  const CreateArtRequest = IDL.Record({
    'title' : IDL.Text,
    'artist' : IDL.Text,
    'description' : IDL.Text,
    'image_url' : IDL.Text,
    'total_tokens' : IDL.Nat64,
    'price_per_token' : IDL.Nat64,
  });
  
  const CreateTradeOfferRequest = IDL.Record({
    'art_id' : IDL.Nat64,
    'tokens_for_sale' : IDL.Nat64,
    'price_per_token' : IDL.Nat64,
  });
  
  const CreateUserRequest = IDL.Record({
    'username' : IDL.Text,
    'email' : IDL.Text,
  });
  
  const Result = IDL.Variant({ 'Ok' : ArtPiece, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : UserProfile, 'Err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok' : TokenOwnership, 'Err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok' : TradeOffer, 'Err' : IDL.Text });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  
  return IDL.Service({
    'accept_trade_offer' : IDL.Func([IDL.Nat64], [Result_4], []),
    'cancel_trade_offer' : IDL.Func([IDL.Nat64], [Result_4], []),
    'create_art_piece' : IDL.Func([CreateArtRequest], [Result], []),
    'create_trade_offer' : IDL.Func([CreateTradeOfferRequest], [Result_3], []),
    'create_user_profile' : IDL.Func([CreateUserRequest], [Result_1], []),
    'get_active_trade_offers' : IDL.Func([IDL.Opt(IDL.Nat64)], [IDL.Vec(TradeOffer)], ['query']),
    'get_all_art_pieces' : IDL.Func([], [IDL.Vec(ArtPiece)], ['query']),
    'get_art_ownership_distribution' : IDL.Func([IDL.Nat64], [IDL.Vec(TokenOwnership)], ['query']),
    'get_art_piece' : IDL.Func([IDL.Nat64], [IDL.Opt(ArtPiece)], ['query']),
    'get_art_statistics' : IDL.Func([IDL.Nat64], [IDL.Opt(IDL.Record({ 'nat64' : IDL.Nat64, 'nat64' : IDL.Nat64, 'nat64' : IDL.Nat64 }))], ['query']),
    'get_platform_statistics' : IDL.Func([], [IDL.Record({ 'nat64' : IDL.Nat64, 'nat64' : IDL.Nat64, 'nat64' : IDL.Nat64, 'nat64' : IDL.Nat64 })], ['query']),
    'get_user_profile' : IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Opt(UserProfile)], ['query']),
    'get_user_tokens' : IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Vec(TokenOwnership)], ['query']),
    'purchase_tokens' : IDL.Func([IDL.Nat64, IDL.Nat64], [Result_2], []),
    'verify_art_piece' : IDL.Func([IDL.Nat64], [Result_4], []),
    'verify_user' : IDL.Func([IDL.Principal], [Result_4], []),
  });
};

class ICPService {
  constructor() {
    this.authClient = null;
    this.actor = null;
    this.identity = null;
    this.isAuthenticated = false;
  }

  async init() {
    try {
      this.authClient = await AuthClient.create();
      this.isAuthenticated = await this.authClient.isAuthenticated();
      
      if (this.isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        await this.createActor();
      } else {
        // Create anonymous actor for read-only operations
        await this.createAnonymousActor();
      }
    } catch (error) {
      console.error('Failed to initialize ICP service:', error);
      // Fallback to anonymous actor
      await this.createAnonymousActor();
    }
  }

  async createActor() {
    const agent = new HttpAgent({
      identity: this.identity,
      host: process.env.NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943',
    });

    // Fetch root key for local development
    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }

    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: BACKEND_CANISTER_ID,
    });
  }

  async createAnonymousActor() {
    const agent = new HttpAgent({
      host: process.env.NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943',
    });

    // Fetch root key for local development
    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }

    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: BACKEND_CANISTER_ID,
    });
  }

  async login() {
    if (!this.authClient) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.authClient.login({
        identityProvider: INTERNET_IDENTITY_URL,
        onSuccess: async () => {
          this.isAuthenticated = true;
          this.identity = this.authClient.getIdentity();
          await this.createActor();
          resolve(this.identity.getPrincipal());
        },
        onError: reject,
      });
    });
  }

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
      this.isAuthenticated = false;
      this.identity = null;
      // Switch back to anonymous actor
      await this.createAnonymousActor();
    }
  }

  getPrincipal() {
    return this.identity ? this.identity.getPrincipal() : null;
  }

  // Art Management Methods
  async getAllArtPieces() {
    try {
      return await this.actor.get_all_art_pieces();
    } catch (error) {
      console.error('Failed to get art pieces:', error);
      throw error;
    }
  }

  async getArtPiece(id) {
    try {
      const result = await this.actor.get_art_piece(BigInt(id));
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to get art piece:', error);
      throw error;
    }
  }

  async createArtPiece(artData) {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to create art');
    }

    try {
      const result = await this.actor.create_art_piece({
        title: artData.title,
        artist: artData.artist,
        description: artData.description,
        image_url: artData.image_url,
        total_tokens: BigInt(artData.total_tokens),
        price_per_token: BigInt(artData.price_per_token),
      });

      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to create art piece:', error);
      throw error;
    }
  }

  // User Management Methods
  async createUserProfile(userData) {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to create profile');
    }

    try {
      const result = await this.actor.create_user_profile({
        username: userData.username,
        email: userData.email,
      });

      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw error;
    }
  }

  async getUserProfile(principal = null) {
    try {
      const targetPrincipal = principal ? [Principal.fromText(principal)] : [];
      const result = await this.actor.get_user_profile(targetPrincipal);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  // Token Management Methods
  async purchaseTokens(artId, tokenAmount) {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to purchase tokens');
    }

    try {
      const result = await this.actor.purchase_tokens(BigInt(artId), BigInt(tokenAmount));

      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to purchase tokens:', error);
      throw error;
    }
  }

  async getUserTokens(principal = null) {
    try {
      const targetPrincipal = principal ? [Principal.fromText(principal)] : [];
      return await this.actor.get_user_tokens(targetPrincipal);
    } catch (error) {
      console.error('Failed to get user tokens:', error);
      throw error;
    }
  }

  async getArtOwnershipDistribution(artId) {
    try {
      return await this.actor.get_art_ownership_distribution(BigInt(artId));
    } catch (error) {
      console.error('Failed to get ownership distribution:', error);
      throw error;
    }
  }

  // Trading Methods
  async createTradeOffer(offerData) {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to create trade offer');
    }

    try {
      const result = await this.actor.create_trade_offer({
        art_id: BigInt(offerData.art_id),
        tokens_for_sale: BigInt(offerData.tokens_for_sale),
        price_per_token: BigInt(offerData.price_per_token),
      });

      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to create trade offer:', error);
      throw error;
    }
  }

  async acceptTradeOffer(tradeId) {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to accept trade offer');
    }

    try {
      const result = await this.actor.accept_trade_offer(BigInt(tradeId));

      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to accept trade offer:', error);
      throw error;
    }
  }

  async cancelTradeOffer(tradeId) {
    if (!this.isAuthenticated) {
      throw new Error('Must be authenticated to cancel trade offer');
    }

    try {
      const result = await this.actor.cancel_trade_offer(BigInt(tradeId));

      if ('Ok' in result) {
        return result.Ok;
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to cancel trade offer:', error);
      throw error;
    }
  }

  async getActiveTradeOffers(artId = null) {
    try {
      const artIdParam = artId ? [BigInt(artId)] : [];
      return await this.actor.get_active_trade_offers(artIdParam);
    } catch (error) {
      console.error('Failed to get trade offers:', error);
      throw error;
    }
  }

  // Statistics Methods
  async getArtStatistics(artId) {
    try {
      const result = await this.actor.get_art_statistics(BigInt(artId));
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Failed to get art statistics:', error);
      throw error;
    }
  }

  async getPlatformStatistics() {
    try {
      return await this.actor.get_platform_statistics();
    } catch (error) {
      console.error('Failed to get platform statistics:', error);
      throw error;
    }
  }

  // Utility Methods
  formatTokenAmount(amount) {
    return Number(amount);
  }

  formatICPAmount(e8s) {
    return Number(e8s) / 100000000;
  }

  parseICPAmount(icp) {
    return Math.floor(icp * 100000000);
  }
}

// Create singleton instance
const icpService = new ICPService();

export default icpService;

