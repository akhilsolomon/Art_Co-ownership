use ic_cdk::api::time;
use ic_cdk::{query, update, init};
use ic_cdk::export_candid;
use candid::{CandidType, Deserialize, Principal};
use std::collections::HashMap;
use std::cell::RefCell;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ArtPiece {
    pub id: u64,
    pub title: String,
    pub artist: String,
    pub description: String,
    pub image_url: String,
    pub total_tokens: u64,
    pub price_per_token: u64, // in e8s (1 ICP = 100_000_000 e8s)
    pub created_at: u64,
    pub creator: Principal,
    pub verified: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TokenOwnership {
    pub art_id: u64,
    pub owner: Principal,
    pub tokens_owned: u64,
    pub purchase_price: u64,
    pub purchase_date: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TradeOffer {
    pub id: u64,
    pub art_id: u64,
    pub seller: Principal,
    pub tokens_for_sale: u64,
    pub price_per_token: u64,
    pub created_at: u64,
    pub active: bool,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub principal: Principal,
    pub username: String,
    pub email: String,
    pub created_at: u64,
    pub total_investments: u64,
    pub verified: bool,
}

#[derive(CandidType, Deserialize)]
pub struct CreateArtRequest {
    pub title: String,
    pub artist: String,
    pub description: String,
    pub image_url: String,
    pub total_tokens: u64,
    pub price_per_token: u64,
}

#[derive(CandidType, Deserialize)]
pub struct CreateTradeOfferRequest {
    pub art_id: u64,
    pub tokens_for_sale: u64,
    pub price_per_token: u64,
}

#[derive(CandidType, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub email: String,
}

thread_local! {
    static ART_PIECES: RefCell<HashMap<u64, ArtPiece>> = RefCell::new(HashMap::new());
    static TOKEN_OWNERSHIPS: RefCell<HashMap<String, TokenOwnership>> = RefCell::new(HashMap::new());
    static TRADE_OFFERS: RefCell<HashMap<u64, TradeOffer>> = RefCell::new(HashMap::new());
    static USER_PROFILES: RefCell<HashMap<Principal, UserProfile>> = RefCell::new(HashMap::new());
    static NEXT_ART_ID: RefCell<u64> = RefCell::new(1);
    static NEXT_TRADE_ID: RefCell<u64> = RefCell::new(1);
}

#[init]
fn init() {
    // Initialize with some sample data
    let sample_art = ArtPiece {
        id: 1,
        title: "Digital Renaissance".to_string(),
        artist: "CryptoArtist".to_string(),
        description: "A stunning digital artwork representing the fusion of classical art with blockchain technology.".to_string(),
        image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800".to_string(),
        total_tokens: 1000,
        price_per_token: 100_000, // 0.001 ICP per token
        created_at: time(),
        creator: Principal::anonymous(),
        verified: true,
    };
    
    ART_PIECES.with(|art_pieces| {
        art_pieces.borrow_mut().insert(1, sample_art);
    });
    
    NEXT_ART_ID.with(|id| {
        *id.borrow_mut() = 2;
    });
}

// User Management Functions
#[update]
fn create_user_profile(request: CreateUserRequest) -> Result<UserProfile, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot create profiles".to_string());
    }
    
    USER_PROFILES.with(|profiles| {
        let mut profiles = profiles.borrow_mut();
        if profiles.get(&caller).is_some() {
            return Err("User profile already exists".to_string());
        }
        
        let profile = UserProfile {
            principal: caller,
            username: request.username,
            email: request.email,
            created_at: time(),
            total_investments: 0,
            verified: false,
        };
        
        profiles.insert(caller, profile.clone());
        Ok(profile)
    })
}

#[query]
fn get_user_profile(user: Option<Principal>) -> Option<UserProfile> {
    let target_user = user.unwrap_or_else(|| ic_cdk::caller());
    USER_PROFILES.with(|profiles| profiles.borrow().get(&target_user).cloned())
}

// Art Management Functions
#[update]
fn create_art_piece(request: CreateArtRequest) -> Result<ArtPiece, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot create art pieces".to_string());
    }
    
    let art_id = NEXT_ART_ID.with(|id| {
        let current_id = *id.borrow();
        *id.borrow_mut() = current_id + 1;
        current_id
    });
    
    let art_piece = ArtPiece {
        id: art_id,
        title: request.title,
        artist: request.artist,
        description: request.description,
        image_url: request.image_url,
        total_tokens: request.total_tokens,
        price_per_token: request.price_per_token,
        created_at: time(),
        creator: caller,
        verified: false,
    };
    
    ART_PIECES.with(|art_pieces| {
        art_pieces.borrow_mut().insert(art_id, art_piece.clone());
    });
    
    Ok(art_piece)
}

#[query]
fn get_all_art_pieces() -> Vec<ArtPiece> {
    ART_PIECES.with(|art_pieces| {
        art_pieces.borrow().values().cloned().collect()
    })
}

#[query]
fn get_art_piece(id: u64) -> Option<ArtPiece> {
    ART_PIECES.with(|art_pieces| art_pieces.borrow().get(&id).cloned())
}

// Token Purchase Functions
#[update]
fn purchase_tokens(art_id: u64, tokens_to_buy: u64) -> Result<TokenOwnership, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot purchase tokens".to_string());
    }
    
    let art_piece = ART_PIECES.with(|art_pieces| {
        art_pieces.borrow().get(&art_id).cloned()
    }).ok_or("Art piece not found")?;
    
    // Check if enough tokens are available
    let total_sold = get_total_tokens_sold(art_id);
    if total_sold + tokens_to_buy > art_piece.total_tokens {
        return Err("Not enough tokens available".to_string());
    }
    
    let total_cost = tokens_to_buy * art_piece.price_per_token;
    let ownership_key = format!("{}:{}", art_id, caller.to_text());
    
    TOKEN_OWNERSHIPS.with(|ownerships| {
        let mut ownerships = ownerships.borrow_mut();
        let existing_ownership = ownerships.get(&ownership_key).cloned();
        
        let new_ownership = match existing_ownership {
            Some(mut existing) => {
                existing.tokens_owned += tokens_to_buy;
                existing.purchase_price += total_cost;
                existing
            },
            None => TokenOwnership {
                art_id,
                owner: caller,
                tokens_owned: tokens_to_buy,
                purchase_price: total_cost,
                purchase_date: time(),
            }
        };
        
        ownerships.insert(ownership_key, new_ownership.clone());
        
        // Update user's total investments
        USER_PROFILES.with(|profiles| {
            let mut profiles = profiles.borrow_mut();
            if let Some(mut profile) = profiles.get(&caller).cloned() {
                profile.total_investments += total_cost;
                profiles.insert(caller, profile);
            }
        });
        
        Ok(new_ownership)
    })
}

#[query]
fn get_user_tokens(user: Option<Principal>) -> Vec<TokenOwnership> {
    let target_user = user.unwrap_or_else(|| ic_cdk::caller());
    
    TOKEN_OWNERSHIPS.with(|ownerships| {
        ownerships.borrow()
            .values()
            .filter(|ownership| ownership.owner == target_user)
            .cloned()
            .collect()
    })
}

#[query]
fn get_art_ownership_distribution(art_id: u64) -> Vec<TokenOwnership> {
    TOKEN_OWNERSHIPS.with(|ownerships| {
        ownerships.borrow()
            .values()
            .filter(|ownership| ownership.art_id == art_id)
            .cloned()
            .collect()
    })
}

// Trading Functions
#[update]
fn create_trade_offer(request: CreateTradeOfferRequest) -> Result<TradeOffer, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot create trade offers".to_string());
    }
    
    // Check if user owns enough tokens
    let ownership_key = format!("{}:{}", request.art_id, caller.to_text());
    let ownership = TOKEN_OWNERSHIPS.with(|ownerships| {
        ownerships.borrow().get(&ownership_key).cloned()
    }).ok_or("You don't own tokens for this art piece")?;
    
    if ownership.tokens_owned < request.tokens_for_sale {
        return Err("You don't own enough tokens to sell".to_string());
    }
    
    let trade_id = NEXT_TRADE_ID.with(|id| {
        let current_id = *id.borrow();
        *id.borrow_mut() = current_id + 1;
        current_id
    });
    
    let trade_offer = TradeOffer {
        id: trade_id,
        art_id: request.art_id,
        seller: caller,
        tokens_for_sale: request.tokens_for_sale,
        price_per_token: request.price_per_token,
        created_at: time(),
        active: true,
    };
    
    TRADE_OFFERS.with(|offers| {
        offers.borrow_mut().insert(trade_id, trade_offer.clone());
    });
    
    Ok(trade_offer)
}

#[update]
fn accept_trade_offer(trade_id: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot accept trade offers".to_string());
    }
    
    let mut trade_offer = TRADE_OFFERS.with(|offers| {
        offers.borrow().get(&trade_id).cloned()
    }).ok_or("Trade offer not found")?;
    
    if !trade_offer.active {
        return Err("Trade offer is no longer active".to_string());
    }
    
    if trade_offer.seller == caller {
        return Err("You cannot accept your own trade offer".to_string());
    }
    
    // Transfer tokens from seller to buyer
    let seller_key = format!("{}:{}", trade_offer.art_id, trade_offer.seller.to_text());
    let buyer_key = format!("{}:{}", trade_offer.art_id, caller.to_text());
    
    TOKEN_OWNERSHIPS.with(|ownerships| {
        let mut ownerships = ownerships.borrow_mut();
        
        // Update seller's tokens
        if let Some(mut seller_ownership) = ownerships.get(&seller_key).cloned() {
            seller_ownership.tokens_owned -= trade_offer.tokens_for_sale;
            if seller_ownership.tokens_owned == 0 {
                ownerships.remove(&seller_key);
            } else {
                ownerships.insert(seller_key, seller_ownership);
            }
        }
        
        // Update buyer's tokens
        let buyer_ownership = match ownerships.get(&buyer_key).cloned() {
            Some(mut existing) => {
                existing.tokens_owned += trade_offer.tokens_for_sale;
                existing.purchase_price += trade_offer.tokens_for_sale * trade_offer.price_per_token;
                existing
            },
            None => TokenOwnership {
                art_id: trade_offer.art_id,
                owner: caller,
                tokens_owned: trade_offer.tokens_for_sale,
                purchase_price: trade_offer.tokens_for_sale * trade_offer.price_per_token,
                purchase_date: time(),
            }
        };
        
        ownerships.insert(buyer_key, buyer_ownership);
    });
    
    // Mark trade offer as inactive
    trade_offer.active = false;
    TRADE_OFFERS.with(|offers| {
        offers.borrow_mut().insert(trade_id, trade_offer);
    });
    
    Ok("Trade completed successfully".to_string())
}

#[query]
fn get_active_trade_offers(art_id: Option<u64>) -> Vec<TradeOffer> {
    TRADE_OFFERS.with(|offers| {
        offers.borrow()
            .values()
            .filter(|offer| offer.active && (art_id.is_none() || art_id == Some(offer.art_id)))
            .cloned()
            .collect()
    })
}

#[update]
fn cancel_trade_offer(trade_id: u64) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    TRADE_OFFERS.with(|offers| {
        let mut offers = offers.borrow_mut();
        if let Some(mut offer) = offers.get(&trade_id).cloned() {
            if offer.seller != caller {
                return Err("You can only cancel your own trade offers".to_string());
            }
            
            offer.active = false;
            offers.insert(trade_id, offer);
            Ok("Trade offer cancelled successfully".to_string())
        } else {
            Err("Trade offer not found".to_string())
        }
    })
}

// Utility Functions
fn get_total_tokens_sold(art_id: u64) -> u64 {
    TOKEN_OWNERSHIPS.with(|ownerships| {
        ownerships.borrow()
            .values()
            .filter(|ownership| ownership.art_id == art_id)
            .map(|ownership| ownership.tokens_owned)
            .sum()
    })
}

#[query]
fn get_art_statistics(art_id: u64) -> Option<(u64, u64, u64)> {
    ART_PIECES.with(|art_pieces| {
        art_pieces.borrow().get(&art_id).map(|art| {
            let total_sold = get_total_tokens_sold(art_id);
            let total_owners = TOKEN_OWNERSHIPS.with(|ownerships| {
                ownerships.borrow()
                    .values()
                    .filter(|ownership| ownership.art_id == art_id)
                    .count() as u64
            });
            
            (art.total_tokens, total_sold, total_owners)
        })
    })
}

#[query]
fn get_platform_statistics() -> (u64, u64, u64, u64) {
    let total_art_pieces = ART_PIECES.with(|art_pieces| art_pieces.borrow().len() as u64);
    let total_users = USER_PROFILES.with(|profiles| profiles.borrow().len() as u64);
    let total_trades = TRADE_OFFERS.with(|offers| offers.borrow().len() as u64);
    let active_trades = TRADE_OFFERS.with(|offers| {
        offers.borrow().values().filter(|offer| offer.active).count() as u64
    });
    
    (total_art_pieces, total_users, total_trades, active_trades)
}

// Admin Functions (for demonstration - in production, implement proper access control)
#[update]
fn verify_art_piece(art_id: u64) -> Result<String, String> {
    ART_PIECES.with(|art_pieces| {
        let mut art_pieces = art_pieces.borrow_mut();
        if let Some(mut art) = art_pieces.get(&art_id).cloned() {
            art.verified = true;
            art_pieces.insert(art_id, art);
            Ok("Art piece verified successfully".to_string())
        } else {
            Err("Art piece not found".to_string())
        }
    })
}

#[update]
fn verify_user(user_principal: Principal) -> Result<String, String> {
    USER_PROFILES.with(|profiles| {
        let mut profiles = profiles.borrow_mut();
        if let Some(mut profile) = profiles.get(&user_principal).cloned() {
            profile.verified = true;
            profiles.insert(user_principal, profile);
            Ok("User verified successfully".to_string())
        } else {
            Err("User not found".to_string())
        }
    })
}

// Export Candid interface
export_candid!();

